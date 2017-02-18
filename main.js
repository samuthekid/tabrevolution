var stack;
var myId;
var windowId;

function init(){
    // Start here
    console.log("front running");

    $("head").append("<style id='tr_style'></style>");
    $("#tr_style").load(chrome.extension.getURL("/style.css"));
    $("body").append("<div id='tr'></div>");

    $("#tr").on("mouseenter",function(e){
        $("#tr").css("top","0px");
    });

    $("#tr").on("mouseleave",function(e){
        $("#tr").css("top","-54px");
    });

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

function addEvents(){
    $(".tr_tab").click(function(e) {
        console.log("click");
        chrome.runtime.sendMessage({"code":"setActive","tabId":e.target.closest("li").dataset["tabid"]});
    });
    $("#tr_prev").click(function(e){
        console.log("BACK");
        window.history.back();
    });
    $("#tr_next").click(function(e){
        console.log("NEXT");
        window.history.forward();
    });
    $("#tr_rel").click(function(e){
        console.log("RELOAD");
        location.reload();
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
            li.attr("data-tabIndex",x.index);
            if(x.id == myId)
                li.addClass("tr_this");
            fav = "<img class='tr_favicon' style='width:17px;height:17px;' src='"+x.favIconUrl+"'/>";
            li.html(fav+x.title);
            ul.append(li);
        }
    });
    $("#tr").append(ul);

    url = $("<div>");
    url.addClass("tr_url");
    
    prev = $("<button>");
    prev.attr("id","tr_prev");
    prev.text("P");
    url.append(prev);

    next = $("<button>");
    next.attr("id","tr_next");
    next.text("N");
    url.append(next);

    rel = $("<button>");
    rel.attr("id","tr_rel");
    rel.text("R");
    url.append(rel);

    inp = $("<input>");
    inp.addClass("tr_input");
    inp.attr("type","text");
    inp.attr("value",location.href);
    url.append(inp);
    $("#tr").append(url);
    makeSortable();
    addEvents();
}

chrome.runtime.onMessage.addListener(
    function(response, tab, callback){
        console.log("ON MESSAGE");
        stack = response;
        redraw();
    }
);

$(document).on("load", init());
