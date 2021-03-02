function full_backup(event) {
    if( confirm("Do you really want to make a full backup?\nCreating the zip file might take a while!")) {     
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/documents/fullbackup/");
        xhr.responseType = 'blob';
        xhr.addEventListener("load", function(e) {
            var blob = e.currentTarget.response;
            saveBlob(blob, "PDFDoggyFullBackup.zip");
        });
        xhr.send();
    }
}


function backup_category(event) {
    if( confirm("Do you really want to make a backup of '"+event.target.getAttribute("category_name")+"'?\nCreating the zip file might take a while!")) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/categories/backup/");
        xhr.responseType = 'blob';
        xhr.addEventListener("load", function(e) {
            var blob = e.currentTarget.response;
            saveBlob(blob, "PDFDoggyBackup-"+backup_cat["collection"]+".zip");
        });
        xhr.setRequestHeader("Content-Type", "application/json");
        var backup_cat = {
            "collection": event.target.getAttribute("category_name")
        }
        xhr.send(JSON.stringify(backup_cat));
    }
}


function saveBlob(blob, fileName) {
    console.log(fileName);
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = fileName;
    a.dispatchEvent(new MouseEvent('click'));
}
