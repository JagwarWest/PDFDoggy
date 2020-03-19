var last_search_flavor = "normal";

function search_documents() {
    
    var flavor = "normal";
    for(var i=0; i<mode_selectors.length;i++) {
        if(mode_selectors[i].getAttribute("checked") === "true") {
            flavor = mode_selectors[i].getAttribute("id");
            break;
        }
    }

    var display = document.getElementById("search_results");

    last_search_flavor = flavor;
    var terms = document.getElementById("search_terms").value.trim(); 
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/search/");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.addEventListener("load", function() {

        if(xhr.status == 200) {
            display_search_results(JSON.parse(xhr.responseText));
        }
        else {
            alert("Your search caused an error\n"+xhr.responseText);
            show_section(search_view);
        }
    });

    // search the selected collections
    var targets = [];
    var checkboxes = document.getElementById("category_table").getElementsByTagName("div");
    for(var cb of checkboxes) {
        if(cb.getAttribute("checked") === "true") {
            targets.push(cb.textContent);
        }
    }

    if(targets.length == 0) {
        alert("You have to select at least one category for a search!");
        return;
    }

    if(terms.length == 0) {
        alert("You have to specify a search term!");
        return;
    }

    var terms_object = {
        "terms": terms.trim(),
        "targets": targets,
        "flavor": flavor
    };

    xhr.send(JSON.stringify(terms_object));
    
    display.innerHTML = "<b>Waiting for server. A search might take some seconds!";
    show_section(search_results);
}

function display_search_results(results) {
    var categories = Object.keys(results).sort();
    var display = sections[search_results];
    if (categories.length == 0) {
        display.innerHTML = "<b>There is no document containing those terms";
    }

    else {
        var html = "";
        if(last_search_flavor != "matchall") {
            html = "Legend:<table><tr><td style='color: blue;'><u>42</b></td><td>: this page contains one search term</td></tr><tr><td style='color: blue;'><b><u>42</u></b></td><td>: multiple (but not all) search terms are on this page</td></tr><tr><td style='color: #00bb00'><b><u>42</u></b></td><td>: all search terms are on this page</td></tr></table>"
        }
        html += "<div style='border-bottom: 2px solid;></div>";
        html += "<div style='border-bottom: 2px solid;></div>";
        // For each category
        for(var category of categories) {
            var documents = Object.keys(results[category]).sort();
            for(var doc of documents) {
                html += "<br><label style='padding-right: 10px'>"+ category +": </label><a target='_blank' rel='noopener noreferrer' href='"+category+"/"+doc+"'>" + doc + "</a><br><br>";

                var terms = Object.keys(results[category][doc]).sort();
                console.log(terms.length);
                for(var term of terms) {
                    var pages = results[category][doc][term];

                    html += "<li>" + term + ": ";
                    html += "["
                    for(var i = 0; i<pages.length; i++) {
                        var page = pages[i];
                        var same_page_ctr = 0;
                        for (var t of terms) {
                            if(t != term) {
                                if (results[category][doc][t].indexOf(page) != -1) {
                                    same_page_ctr++;
                                }
                            }
                        }
                        var page_refs = "";
                        if(same_page_ctr == 0) {
                            page_refs = "<a target='_blank' rel='noopener noreferrer' href='"+category+"/"+doc+"#page="+page+"'>"+page+"</a>";
                        }
                        else {
                            if(same_page_ctr == terms.length -1) {
                                page_refs = "<b><a style='color: #00bb00' target='_blank' rel='noopener noreferrer' href='"+category+"/"+doc+"#page="+page+"'>"+page+"</a></b>";
                            }
                            else {
                                page_refs = "<b><a target='_blank' rel='noopener noreferrer' href='"+category+"/"+doc+"#page="+page+"'>"+page+"</a></b>";
                            }
                        }
                        if(i < pages.length-1) {
                            page_refs += ", ";
                        }
                        html += page_refs;
                    }
                    html += "]";   
                }
                html += "<br><br>";
            }
            html += "<div style='border-bottom: 2px solid;'></div>";
        }
        display.innerHTML = html;
    }
    show_section(search_results);
}   