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

            var tabs = $("#tr").tabs();
            tabs.find( ".tr_sortable" ).sortable({
                axis: "x",
                stop: function() {
                    tabs.tabs( "refresh" );
                }
            });
    });
    
    console.log("DONE");
}

function redraw(){
    $("#tr").html("");
    ul = $("<ul>").html("");
    ul.addClass("tr_sortable");
    $.each(stack,function(i,x){
        if(x.windowId == windowId){
            li = $("<li>");
            li.addClass("tr_tab");
            //t.append("<img class='tr_favicon' src='"+tab.favIconUrl+"'/>");
            if(x.id == myId)
                li.addClass("tr_this");
            li.text(x.title);
            console.log(x.title);
            ul.append(li);
        }
    });
    $("#tr").append(ul);
}

chrome.runtime.onMessage.addListener(
    function(response, tab, callback){
        console.log("ON MESSAGE");
        //console.log(response);
        //console.log(tab);
        //console.log(callback);
        redraw();
    }
);

$(document).on("load", init());
