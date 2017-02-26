var stack;
var order;
var myId;
var windowId;
var isFullscreen;

function init(){
    // Start here

    // Append styles
    $("head").append("<style id='tr_style'></style>");
    $("#tr_style").load(chrome.extension.getURL("/style.css"));
    // Append div
    boss = $("<div>");
    boss.attr("id","tr");
    boss.addClass("tr_reset");
    $("body").append(boss);

    $("#tr").mouseenter(function(){
        if(isFullscreen) $("#tr").removeClass("tr_hidden");
    });

    $("#tr").mouseleave(function(){
        if(isFullscreen) $("#tr").addClass("tr_hidden");
    });

    $(window).resize(checkIfFullscreen);

    $(window).keydown(function(e){
        var key = e.which;
        if(key == 13 && $(".tr_input").is(":focus")){
            //submit form
            var query = $(".tr_input").val();
            url_reg = /^((http|https|ftp|chrome):\/\/)?([a-zA-Z0-9\_\-]+)((\.|\:)[a-zA-Z0-9\_\-]+)+(\/.*)?$/;
            if(url_reg.test(query)){
                //URL
                if(query.includes("http://") || query.includes("https://"))
                    location.href = query;
                else
                    location.href = "http://"+query;
            }else{
                //Não url
                location.href = "https://www.google.pt/search?q="+query;
            }
            return false;  
        }
    });

    chrome.runtime.sendMessage({"code":"getData"},
        function(response){
            stack = response.stack;
            myId = response.myId;
            windowId = response.windowId;
            //console.log(myId+" "+windowId);
            checkIfFullscreen();
            redraw();
    });
}

function checkIfFullscreen(){
    isFullscreen = (window.innerHeight == screen.height);
    if(isFullscreen){
        $("#tr").removeClass("tr_disabled").addClass("tr_hidden");
    }else{
        $("#tr").addClass("tr_disabled");
    }
}

function checkForMoves(){
    $.each($(".tr_sortable").children(),function(i,x){
        x = parseInt(x.dataset["tabid"]);
        chrome.runtime.sendMessage({"code":"moveTab","id":x,"index":i});
    });
}

function makeSortable(){
    var tabs = $("#tr").tabs();
    tabs.find( ".tr_sortable" ).sortable({
        axis: "x",
        stop: function(e) {
            tabs.tabs("refresh");
            checkForMoves();
        }
    });
}

function addEvents(){
    $(".tr_tab").mousedown(function(e){
        switch(e.which){
            case 2:
            chrome.runtime.sendMessage({"code":"closeTab","tabId":parseInt(e.target.closest("li").dataset["tabid"])});
            e.preventDefault();
            e.stopPropagation();
            break;
        }
        return true;// to allow the browser to know that we handled it.
    });

    $(".tr_tab").click(function(e) {
        if(e.target.className.includes("tr_tab_close")){
            chrome.runtime.sendMessage({"code":"closeTab","tabId":parseInt(e.target.closest("li").dataset["tabid"])});
        }else{
            chrome.runtime.sendMessage({"code":"setActive","tabId":parseInt(e.target.closest("li").dataset["tabid"])});
        }
    });

    $("#tr_prev").click(function(e){
        window.history.back();
    });

    $("#tr_next").click(function(e){
        window.history.forward();
    });

    $("#tr_rel").click(function(e){
        location.reload();
    });

    $("input.tr_input").on("focus",function(e){
        $(e.target).select();
    });

    $("input.tr_input").on("focusout",function(e){
        if(e.target.value == ""){
            e.target.value = location.href;
        }
    });
}

function redraw(){
    $("#tr").html("");
    ul = $("<ul>").html("");
    ul.addClass("tr_reset tr_hidden tr_sortable");
    $.each(stack,function(i,x){
        if(x.windowId == windowId){
            // DO NOT add tr_reset to the lis
            li = $("<li>");
            li.addClass("tr_tab");
            li.attr("data-tabId",x.id);
            li.attr("data-tabIndex",x.index);
            fav = "";
            if(x.id == myId){
                li.addClass("tr_this");
            }
            if(!x.favIconUrl || !x.favIconUrl.includes("chrome://")){
                fav = "<img class='tr_favicon' style='width:17px;height:17px;' src='"+x.favIconUrl+"'/>";
            }
            title = $("<span>");
            title.addClass("tr_reset tr_tab_title");
            title.text(x.title);
            close = $("<div>");
            close.addClass("tr_reset tr_tab_close");
            close.text("X");
            li.html(fav);
            li.append(title);
            li.append(close);
            ul.append(li);
        }
    });
    $("#tr").append(ul);

    url = $("<div>");
    url.addClass("tr_reset tr_url");
    
    prev = $("<div>");
    prev.attr("id","tr_prev");
    prev.addClass("tr_reset tr_button");
    prev.append($("<img>").addClass("tr_reset tr_button_img").attr("src",chrome.extension.getURL("back.png")));
    url.append(prev);

    next = $("<div>");
    next.attr("id","tr_next");
    next.addClass("tr_reset tr_button");
    next.append($("<img>").addClass("tr_reset tr_button_img").attr("src",chrome.extension.getURL("forward.png")));
    url.append(next);

    rel = $("<div>");
    rel.attr("id","tr_rel");
    rel.addClass("tr_reset tr_button");
    rel.append($("<img>").addClass("tr_reset tr_button_img").attr("src",chrome.extension.getURL("reload.png")));
    url.append(rel);

    inp = $("<input>");
    inp.addClass("tr_reset tr_input");
    inp.attr("type","text");
    inp.attr("value",location.href);
    url.append(inp);
    $("#tr").append(url);

    makeSortable();
    addEvents();
}

chrome.runtime.onMessage.addListener(
    function(response, tab, callback){
        stack = response;
        redraw();
    }
);

// I can do this because "run_at": "document_end" (manifest.json)
init();
