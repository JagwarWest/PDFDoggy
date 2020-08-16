var manage_documents = 0;
var search_results   = 1;
var help_menu        = 2;
var search_view      = 3;

let sections = [
    document.getElementById("manage_documents"),
    document.getElementById("search_results"),
    document.getElementById("help_menu"),
    document.getElementById("search_view")
];

let tabs = [
    document.getElementById("list_docs"),
    document.getElementById("show_help_menu"),
    document.getElementById("search_docs")
];

var mode_selectors = [
    document.getElementById("matchall"),
    document.getElementById("normal"),
    document.getElementById("in_one_document")
];


/*********** ***********/
document.getElementById("search_terms").addEventListener('keypress', function(event) {
    if (event.keyCode == 13) {
        search_documents();
    }
});

String.prototype.capit = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function play_audio(bark) {
    var audio = document.getElementById(bark);
    audio.play();
}
/*********** ***********/


/************* Category Selection *************/

// Handles the "Select/Deselect All" buttons
function select_categories(select_value=true) {
    var checkboxes = document.getElementById("checkboxes").getElementsByTagName("div");
    for(var checkbox of checkboxes) {
        var check_val = checkbox.getAttribute("checked") === "true";
        if(select_value != check_val) {
            checkbox.click();
        }
    }
}

// Individual selection of categories
function category_selection_click(ev) {
    var current_value = ev.getAttribute("checked") === "true";
    if(current_value) {
        ev.setAttribute("checked", "false");
        ev.setAttribute("class", "category_tag white_background");
    }
    else {
        ev.setAttribute("checked", "true");
        ev.setAttribute("class", "category_tag blue_background");
    }
}

function create_categories_table() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/types/");
    xhr.addEventListener("load", function() {
        let types = JSON.parse(xhr.responseText)["types"].sort();
        var category_table = document.getElementById("category_table");
        category_table.innerHTML = "";
        if(types.length == 0) {
            category_table.innerHTML = "<b><i>There are no documents uploaded yet</i></b>";
            return;
        }

        table_string = "";
        var columns = 5
        for(var i in types) {
            if ((i % columns) == 0) {
                table_string += "<tr>";
            }

            var category_name = types[i];
            if(category_name.length > 33) {
                category_name = category_name.substring(0,30) + "...";
            }

            table_string += '<td><div checked="true" title="'+types[i]+'" class="category_tag blue_background" onclick="category_selection_click(this)">' + category_name + '</div></td>';
            if ((i % columns) == columns-1) {
                table_string += "</tr>";
            }
        }
        table_string += "</tr>"
        category_table.innerHTML = table_string;
    });
    xhr.send();
}
/************* END Category selection *************/

// Function to switch between the search modes (flavors)
function select_search_mode(index) {
    for(var i=0; i<mode_selectors.length;i++) {
        if(i != index) {
            mode_selectors[i].setAttribute("class", "category_tag white_background");
            mode_selectors[i].setAttribute("checked", "false");
        }
        else {
            mode_selectors[i].setAttribute("class", "category_tag yellow_background");
            mode_selectors[i].setAttribute("checked", "true");
        }
    }
}


// show one section, hide every other section
function show_section(index=pdf_list) {
    // first hide every thing then show the desired one to make a more fluent appearance
    for(var s of sections) {
        s.setAttribute("style", "display:none");
    }

    sections[index].setAttribute("style", "");

    if(index==search_view) {
        searcher = document.getElementById("search_terms");
        searcher.focus();
        searcher.select();
    }
} 

function tab_selection(index) {
    for(var i in tabs) {
        if(i != index) {
            tabs[i].setAttribute("style", "font-weight: normal;");
        }
    }
    tabs[index].setAttribute("style", "font-weight: bold;");
}

show_section(search_view);
tab_selection(2);
create_categories_table();
