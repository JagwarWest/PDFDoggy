document.getElementById("upload_category").addEventListener('keypress', function(event) {
    if (event.keyCode == 13) {
        upload_document();
    }
});

function upload_document() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/documents/upload/");
    xhr.addEventListener("load", function (e) {
        console.log(xhr.responseText);
        alert(xhr.responseText);
        create_categories_table();
        document.getElementById("upload-info").innerHTML = "";
        list_documents();
    });

    var formData = new FormData();
    formData.append("collection", document.getElementById("upload_category").value);

    var upload_file_input = document.getElementById("upload_file");

    var doc_counter = 0;
    for(var file of upload_file_input.files) {
        formData.append("document_"+doc_counter++, file);
    }
    xhr.send(formData);
    document.getElementById("upload-info").innerHTML = "<br>This upload might take some time!";  
    event.preventDefault();
    return false;  
}