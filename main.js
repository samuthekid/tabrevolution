var stack;
var myId;
var windowId;

function init(){
    // Start here
    console.log("front running");
    chrome.runtime.sendMessage({"code":"getData"},
        function(response){
            stack = response.stack;
            myId = response.myId;
            windowId = response.windowId;
            console.log(myId+" "+windowId);
            redraw();
    });

    $("head").append("<style id='tr_style'></style>");
    $("#tr_style").load(chrome.extension.getURL("/style.css"));
    
    $("body").append("<div id='tr'></div>");
    
    console.log("DONE");
}

function redraw(){
    $.each(stack,function(i,x){
        if(x.windowId == windowId){
            t = $("<div>");
            t.addClass("tr_tab");
            //t.append("<img class='tr_favicon' src='"+tab.favIconUrl+"'/>");
            if(x.id == myId)
                t.addClass("tr_this");
            t.text(x.title);
            console.log(t);
            $("#tr").append(t);
        }
    });
}

chrome.runtime.onMessage.addListener(
    function(response, tab, callback){
        console.log(response);
        console.log(tab);
        console.log(callback);
    }
);

$(document).on("load", init());
