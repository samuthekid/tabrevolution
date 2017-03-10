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
    boss.addClass("tr_reset tr_disabled");
    $("body").append(boss);

    $(window).resize(checkIfFullscreen);

    $(window).keydown(function(e){
        var key = e.which;
        if(key == 13 && $(".tr_input").is(":focus")){
            //submit form
            var query = $(".tr_input").val();
            url_reg = /^((http|https|ftp|chrome):\/\/)?([a-zA-Z0-9\_\-]+)((\.|\:)[a-zA-Z0-9\_\-]+)+(\/.*)?$/;
            if(url_reg.test(query)){
                // URL
                if(query.includes("http://") || query.includes("https://"))
                    location.href = query;
                else
                    location.href = "http://"+query;
            }else{
                // NOT URL
                location.href = "https://www.google.pt/search?q="+query;
            }
            return false;  
        }else if((e.ctrlKey && key==76) || (e.altKey && key==68)){
            $("#tr").addClass("tr_hover");
            $("input.tr_input").select();
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
    chrome.runtime.sendMessage({"code":"checkIfFullscreen"},
        function(response){
            isFullscreen = response.isFullscreen;
            if(isFullscreen){
                $("#tr").removeClass("tr_disabled");
            }else{
                $("#tr").addClass("tr_disabled");
            }
    });
}

function checkForMoves(){
    $.each($(".tr_sortable").children(),function(i,x){
        x = parseInt(x.dataset["tabid"]);
        chrome.runtime.sendMessage({"code":"moveTab","id":x,"index":i});
    });
}

function makeSortable(){
    var tabs = $("#tr").tabs();
    tabs.find(".tr_sortable").sortable({
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
            // MIDDLE CLICK
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

    $(".tr_new_tab").click(function(e){
        chrome.runtime.sendMessage({"code":"createTab"});
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
        $("#tr").addClass("tr_hover");
    });

    $("input.tr_input").on("focusout",function(e){
        if(e.target.value == ""){
            e.target.value = location.href;
        }
        $("#tr").removeClass("tr_hover");
    });
}

function redraw(){
    var isLoading = false;

    $("#tr").html("");

    tops = $("<div>");
    tops.addClass("tr_tops");

    pins = $("<ul>");
    pins.addClass("tr_reset tr_sortable tr_sortable_pinned");

    tabs = $("<ul>");
    tabs.addClass("tr_reset tr_sortable");

    $.each(stack,function(i,x){
        if(x.windowId == windowId){

            li = $("<li>");
            li.addClass("tr_reset tr_tab");
            li.attr("data-tabId",x.id);
            li.attr("data-tabIndex",x.index);

            if(x.id == myId){
                li.addClass("tr_this");
            }

            if(x.pinned){

                // PINNED
                li.addClass("tr_pinned");
                fav = $("<img>");

                if(x.audible){
                    // AUDIBLE
                    fav.addClass("tr_tab_sound");
                    if(x.mutedInfo.muted)
                        fav.attr("src",chrome.extension.getURL("assets/no_sound.png"));
                    else
                        fav.attr("src",chrome.extension.getURL("assets/sound.png"));
                }else{
                    // NOT AUDIBLE
                    fav.addClass("tr_favicon");
                    if(x.status == "loading"){
                        // LOADING
                        isLoading = true;
                        fav.attr("src",chrome.extension.getURL("assets/loading.gif"));
                    }else{
                        // COMPLETE
                        if(!x.favIconUrl || x.favIconUrl.includes("chrome://"))
                            fav.attr("src",chrome.extension.getURL("assets/internet.png"));
                        else
                            fav.attr("src",x.favIconUrl);
                    }
                }
                li.append(fav);

                pins.append(li);

            }else{

                // NOT PINNED
                fav = $("<img>");
                fav.addClass("tr_favicon");
                if(x.status == "loading"){
                    // LOADING
                    isLoading = true;
                    fav.attr("src",chrome.extension.getURL("assets/loading.gif"));
                }else{
                    // COMPLETE
                    if(!x.favIconUrl || x.favIconUrl.includes("chrome://"))
                        fav.attr("src",chrome.extension.getURL("assets/internet.png"));
                    else
                        fav.attr("src",x.favIconUrl);
                }
                li.append(fav);

                title = $("<span>");
                title.addClass("tr_reset tr_tab_title");
                title.text(x.title);
                li.append(title);

                if(x.audible){
                    // AUDIBLE
                    snd = $("<img>");
                    snd.addClass("tr_tab_sound");
                    if(x.mutedInfo.muted)
                        snd.attr("src",chrome.extension.getURL("assets/no_sound.png"));
                    else
                        snd.attr("src",chrome.extension.getURL("assets/sound.png"));
                    li.append(snd);
                }

                close = $("<img>");
                close.addClass("tr_tab_close");
                close.attr("src",chrome.extension.getURL("assets/close.png"));
                li.append(close);

                tabs.append(li);
            }
        }
    });

    tops.append(pins);
    tops.append(tabs);

    newtab = $("<div>");
    newtab.addClass("tr_reset tr_new_tab");
    newtab.append($("<img>").addClass("tr_reset tr_new_tab_icon").attr("src",chrome.extension.getURL("assets/add.png")));
    //tops.append(newtab);

    $("#tr").append(tops);

    url = $("<div>");
    url.addClass("tr_reset tr_url");
    
    prev = $("<div>");
    prev.attr("id","tr_prev");
    prev.addClass("tr_reset tr_button");
    prev.append($("<img>").addClass("tr_reset tr_button_img").attr("src",chrome.extension.getURL("assets/back.png")));
    url.append(prev);

    next = $("<div>");
    next.attr("id","tr_next");
    next.addClass("tr_reset tr_button");
    next.append($("<img>").addClass("tr_reset tr_button_img").attr("src",chrome.extension.getURL("assets/forward.png")));
    url.append(next);

    rel = $("<div>");
    rel.attr("id","tr_rel");
    rel.addClass("tr_reset tr_button");
    rel.append($("<img>").addClass("tr_reset tr_button_img").attr("src",chrome.extension.getURL("assets/reload.png")));
    url.append(rel);

    inp = $("<input>");
    inp.addClass("tr_reset tr_input");
    inp.attr("type","text");
    inp.attr("value",location.href);
    url.append(inp);

    $("#tr").append(url);

    if(isFullscreen && isLoading) $("#tr").addClass("tr_hover");
    else $("#tr").removeClass("tr_hover");

    makeSortable();
    addEvents();
}

chrome.runtime.onMessage.addListener(
    function(response, tab, callback){
        stack = response;
        redraw();
    }
);

init();
