function create_document_table(docs) {
    var table_html = "<table style='font-size:8pt' border='1'><thead><tr>";

    Object.keys(docs).sort().forEach(function(i) {
        docs[i].sort();
        var titlename = i.capit();

        if(titlename.length > 33) {
            titlename = titlename.substring(0,30) + "..."
        }

        table_html += "<th style='padding-right:10px;' title='"+i.capit()+"'>" + titlename + " ("+docs[i].length+" docs)<img category_name='"+i+"' class='pictogram' src='/static/img/trash.png' title='Remove "+i+"' onclick='remove_category(event)'/></th>";
    });
    table_html += "</tr><thead>";

    // find largest list to determine the number of rows of the table
    var largest_list = ""
    var size = 0;

    Object.keys(docs).forEach(function(i) {
        if(docs[i].length > size) {
            largest_list = i;
            size = docs[i].length;
        }
    });

    // table body
    table_html += "<tbody>"
    for(var i = 0; i<size; i++) {
        table_html += "<tr>";
        Object.keys(docs).sort().forEach(function(key) {
            table_html += "<td style='padding-right:10px'>";
            if(i < docs[key].length ) {
                var displayname = docs[key][i];

                if(displayname.length > 33) {
                    displayname = docs[key][i].substring(0,30) + "..."
                }

                table_html += "<a style='float:left; padding-left: 3px;' target='_blank' title='"+docs[key][i]+"'rel='noopener noreferrer' href='/" + key + "/" + docs[key][i] + "'>" + displayname + "</a><img collection='"+key+"' filename='"+docs[key][i]+"'class='pictogram' src='/static/img/trash.png' title='Remove "+docs[key][i]+"' onclick='remove_document(event)'/>";
            }
            table_html += "</td>";
        });
        table_html += "</tr>";
    }
    table_html += "</tbody></table><br><br>";
    document.getElementById("pdf_list").innerHTML += table_html;
}

function list_documents() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/documents/");
    xhr.addEventListener("load", function() {
        var docs = JSON.parse(xhr.responseText);
        var sorted_keys = Object.keys(docs).sort()
        var doc_count = 0;
        for(var i=0; i<sorted_keys.length; i++) {
            doc_count += docs[sorted_keys[i]].length;
        }
        document.getElementById("pdf_list").innerHTML = "<h2>Uploaded documents (" + doc_count + " in total)</h2>";
        var tmp_object = {};
        for(var i=0; i<sorted_keys.length; i++) {
            tmp_object[sorted_keys[i]] = docs[sorted_keys[i]];
            if((i % 4) == 3) {
                create_document_table(tmp_object);
                tmp_object = {};
            }
            else {
                if((i+1) == sorted_keys.length) {
                    create_document_table(tmp_object);
                }
            }
        }
    }); 
    xhr.send();
}

list_documents();