import os
import re
import json
import subprocess
import copy

import threading

import pymongo
from flask import Flask
from flask import request
from flask import send_from_directory
from werkzeug.utils import secure_filename
#import ssl

def create_regex_query(terms, matchall, under_as_white):
    operator = "$or"
    if matchall:
        operator = "$and"
    query = {operator: []}

    #pabe.find({"$and":[{"text":re.compile("heap")}, {"text":re.compile("exim")}]})
    for term in terms:
        if under_as_white:
            term = term.replace("_", " ")

        # negation
        if term.startswith("-"):
            query[operator].append({"text": {"$not": re.compile(term[1:], re.IGNORECASE)}})
        else:
            query[operator].append({"text": re.compile(term, re.IGNORECASE)})
    print(query)
    return query

def search_targets2(search_terms, targets, matchall, under_as_white, in_one_document=True):
    existing_collections = pymongo.MongoClient().pdfs.list_collection_names()
    result = {}
    not_terms = []
    for t in search_terms:
        if t.startswith("-"):
            not_terms.append(t)
    if len(not_terms) == len(search_terms):
        return {}

    for target in targets:
        if target in existing_collections:
            coll = pymongo.MongoClient().pdfs[target]
            if matchall:
                the_query = create_regex_query(search_terms, matchall, under_as_white)
                findings = coll.find(the_query)
                for finding in findings:
                    if target not in result:
                        result[target] = {}
                    if finding["document"] not in result[target]:
                        result[target][finding["document"]] = {"ALL TERMS": []}
                    result[target][finding["document"]]["ALL TERMS"].append(finding["page"])

            else:
                for term in search_terms:
                    if term.startswith("-"):
                        continue
                    the_query = create_regex_query([term] + not_terms, True, under_as_white)
                    findings = coll.find(the_query)
                    for finding in findings:
                        if target not in result:
                            result[target] = {}
                        if finding["document"] not in result[target]:
                            result[target][finding["document"]] = {}
                        if term not in result[target][finding["document"]]:
                            result[target][finding["document"]][term] = []
                        result[target][finding["document"]][term].append(int(finding["page"]))
                        result[target][finding["document"]][term].sort()
        else:
            print("TSK, TSK: ", target)

    # prune documents with only partial matches
    if in_one_document and not matchall:
        result2 = copy.deepcopy(result)
        for cat in result:
            for doc in result[cat]:
                if len(result[cat][doc]) < len(search_terms) - len(not_terms):
                    del result2[cat][doc]
            if len(result2[cat]) == 0:
                del result2[cat]
        result = result2
    return result

def list_documents():
    database = pymongo.MongoClient().pdfs
    result = {
        "doc_list": {},
        "page_count": 0
    }
    for name in database.list_collection_names():
        result["doc_list"][name] = {}
        result["doc_list"][name]["names"] = database[name].distinct("document", {})
        category_page_count = database[name].count_documents({})
        result["doc_list"][name]["category_page_count"] = category_page_count
        result["page_count"] += category_page_count
    return result


app = Flask(__name__, static_url_path='/static/', static_folder="static/")

@app.route("/api/search/", methods=["POST"])
def search():
    print(request.get_data())
    search_data  = json.loads(request.get_data().decode("utf8"))
    search_terms = search_data["terms"].strip().split(" ")
    targets      = search_data["targets"]
    flavor       = search_data["flavor"]

    matchall = False
    in_one_document = False

    if flavor == "matchall":
        matchall = True

    if flavor == "in_one_document":
        in_one_document = True

    if (len(search_terms) == 1 and search_terms[0] == "") or len(search_terms) == 0:
        return "{}"

    result = search_targets2(search_terms, targets, matchall, True, in_one_document)
    return json.dumps(result, ensure_ascii=False).encode("utf8")


@app.route("/<subdir>/<filename>", methods=["GET"])
def get_document(subdir, filename):
    print("GET PDF", filename)
    return send_from_directory("pdfs/%s" % subdir, filename)


@app.route("/api/documents/", methods=["GET"])
def list_registered_documents():
    return json.dumps(list_documents(), ensure_ascii=False).encode("utf8")


@app.route("/api/types/", methods=["GET"])
def get_document_types():
    return json.dumps({"types": pymongo.MongoClient().pdfs.list_collection_names()})


@app.route("/api/documents/remove/", methods=["POST"])
def remove_document():
    remove_params = json.loads(request.get_data().decode("utf8"))
    print(remove_params)
    collection = remove_params["collection"]
    database =  pymongo.MongoClient().pdfs
    database[collection].delete_many({"document": remove_params["filename"]})
    if database[remove_params["collection"]].count_documents({}) == 0:
        database.drop_collection(collection)
    subprocess.Popen(["rm", "pdfs/" + collection + "/" + remove_params["filename"]], shell=False).wait()
    if len(os.listdir("pdfs/" + collection)) == 0:
        subprocess.Popen(["rmdir", "pdfs/" + collection], shell=False).wait()
    return json.dumps({"Result": "OK"})


def thread_upload_document(thread_id, collection, file_keys, request_files):
    while(len(file_keys) > 0):
        document = request_files[file_keys.pop()]
        filename = secure_filename(document.filename)
        if collection not in os.listdir("pdfs/"):
            subprocess.Popen(["mkdir", "pdfs/" + collection], shell=False).wait()

        print("Thread %d" % thread_id, "FILENAME:", "pdfs/" + collection + "/" + filename)
        document.save("pdfs/" + collection + "/" + filename)

        print("Thread %d" % thread_id, "EXTRACTING:", filename)
        process = subprocess.Popen(["python3", "PDFImporter.py", collection, filename], shell=False)
        return_code = process.wait()

        if return_code != 0:
            print("There was an error with: %s", document.filename)
            subprocess.Popen(["rm", "pdfs/"+collection+"/"+filename], shell=False).wait()
            if len(os.listdir("pdfs/" + collection)) == 0:
              subprocess.Popen(["rmdir", "pdfs/" + collection], shell=False).wait()


@app.route("/api/documents/upload/", methods=["POST"])
def upload_documents_multithreaded():
    print(request.form)
    collection = secure_filename(request.form["collection"].strip())

    if len(collection) == 0:
        return "You have to specify a category name!"

    thread_list = []
    num_threads = 8
    file_keys = list(request.files)
    for i in range(0,num_threads):
        thread_list.append(threading.Thread(target=thread_upload_document, args=(i, collection, file_keys, request.files)))
    for thread in thread_list:
        thread.start()
    for i in range(0,num_threads):
        thread_list[i].join()
        print("Thread %d joined" % i)
    return "OK"


@app.route("/api/categories/remove/", methods=["POST"])
def remove_category():
    remove_params = json.loads(request.get_data().decode("utf8"))
    print(remove_params)
    collection = remove_params["collection"]
    database =  pymongo.MongoClient().pdfs
    database.drop_collection(collection)
    subprocess.Popen(["rm", "-r", "pdfs/" + collection + "/"], shell=False).wait()
    return json.dumps({"Result": "OK"})


@app.route("/", methods=["GET"])
def get():
    return send_from_directory("html", "PDFDoggy.html")

@app.route("/favicon.ico", methods=["GET"])
def favicon():
    return send_from_directory("static/img", "dog.png")

@app.after_request
def set_headers(response):
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Server"] = "Later"
    return response

if __name__ == "__main__":
    port = 8181
    app.run("0.0.0.0", threaded=True, port=port)


    # later...
    """
    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    context.options |= ssl.OP_CIPHER_SERVER_PREFERENCE
    # no re-negotiation, please!
    context.options |= 0x40000000
    context.options |= 0x0001
    context.set_ciphers("TLSv1.2+HIGH+AES256+EECDH:TLSv1.2+HIGH+AES256+EDH")
    context.load_cert_chain("ssl/server.pem", "ssl/server.key")
    app.run("0.0.0.0", threaded=True, port=4343, ssl_context=context)
    """
