from io import StringIO
import os
import pymongo
import sys
import subprocess
import fitz

mongoclient = pymongo.MongoClient()
database = mongoclient.pdfs

def import_pdf2(filename, collection_name):
    database[collection_name].delete_many({"document": filename})
    filepath = "pdfs/" + collection_name + "/" + filename
    print("FILENAME",filepath)
    pdfreader = fitz.open(filepath)

    for i in range(pdfreader.pageCount):
      try:
        page_text = pdfreader.getPageText(i)
        page_text = page_text.encode("utf16", "surrogatepass").decode("utf16")

        # weeding out some bad characters
        page_text = page_text.replace("ﬃ", "ffi")
        page_text = page_text.replace("ﬂ", "fl")
        page_text = page_text.replace("ﬀ", "ff")
        page_text = page_text.replace("ﬁ", "fi")
        page_text = page_text.replace("\n", " ")

        document = {
            "page": i+1,
            "document": filename,
            "tag": collection_name,
            "text": page_text.lower().strip()
        }
        database[collection_name].insert_one(document)
      except Exception as e:
        print("error while reading page %d of %s" % (i, filepath))
    print("DONE", collection_name, filename)


def import_all_pdfs(pdfs_location):
  mongoclient.drop_database("pdfs")
  database = mongoclient.pdfs
  for dirname in os.listdir(pdfs_location):
    print(dirname)
    for filename in os.listdir(pdfs_location+"/"+dirname+"/"):
      print(filename)
      import_pdf2(filename, dirname)
  print("DONE IMPORTING ALL PDFs")

if __name__ == "__main__":
  if len(sys.argv) == 1:
    import_all_pdfs("pdfs/")
  else:
      collection_name = sys.argv[1]
      pdf_name = sys.argv[2]
      print("COLLECTION_NAME", collection_name)
      print("PDF_NAME", pdf_name)
      import_pdf2(pdf_name, collection_name)
