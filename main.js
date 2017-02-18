var stack;
var myId;
var windowId;

function init(){
    // Start here
    console.log("front running");

    $("head").append("<style id='tr_style'></style>");
    $("#tr_style").load(chrome.extension.getURL("/style.css"));
    $("body").append("<div id='tr'></div>");

    chrome.runtime.sendMessage({"code":"getData"},
        function(response){
            stack = response.stack;
            myId = response.myId;
            windowId = response.windowId;
            console.log(myId+" "+windowId);
            redraw();
    });
    
    console.log("DONE");
}

function makeSortable(){
    var tabs = $("#tr").tabs();
    tabs.find( ".tr_sortable" ).sortable({
        axis: "x",
        stop: function() {
            console.log("Acabou de mover");
            tabs.tabs( "refresh" );
        }
    });
}

function redraw(){
    $("#tr").html("");
    ul = $("<ul>").html("");
    ul.addClass("tr_sortable");
    $.each(stack,function(i,x){
        if(x.windowId == windowId){
            li = $("<li>");
            li.addClass("tr_tab");
            li.attr("data-tabId",x.id);
            if(x.id == myId)
                li.addClass("tr_this");
            fav = "<img class='tr_favicon' style='width:17px;height:17px;' src='"+x.favIconUrl+"'/>";
            li.html(fav+x.title);
            ul.append(li);
        }
    });
    $("#tr").append(ul);

    url = $("<div>");
    url.addClass("tr_url");;
    inp = $("<input>");
    inp.addClass("tr_input");
    inp.attr("type","text");
    url.append(inp);
    $("#tr").append(url);
    makeSortable();
}

chrome.runtime.onMessage.addListener(
    function(response, tab, callback){
        console.log("ON MESSAGE");
        stack = response;
        redraw();
    }
);

$(document).on("load", init());
