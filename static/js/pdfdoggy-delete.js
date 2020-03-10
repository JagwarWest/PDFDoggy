function remove_document(event) {
    if( confirm("Do you really want to remove '" + event.target.getAttribute("filename") + "'?")) {     
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/documents/remove/");
        xhr.addEventListener("load", function() {
            list_documents();
            create_categories_table();
        });
        xhr.setRequestHeader("Content-Type", "application/json");

        var remove_doc = {
            "collection": event.target.getAttribute("collection"),
            "filename": event.target.getAttribute("filename")
        }
        xhr.send(JSON.stringify(remove_doc));
    }
}

function remove_category(event) {
    if( confirm("Do you really want to remove the whole category '"+event.target.getAttribute("category_name")+"'?")) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/categories/remove/");
        xhr.addEventListener("load", function() {
            list_documents();
            create_categories_table();
        });
        xhr.setRequestHeader("Content-Type", "application/json");
        var remove_cat = {
            "collection": event.target.getAttribute("category_name")
        }
        xhr.send(JSON.stringify(remove_cat));
    }
}