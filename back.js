var stack;

function init(){
    // Start here
    chrome.tabs.query({},function(tab){
        stack = tab;
    });

    chrome.contextMenus.create({"contexts":["all"],"id": "pinTab","title": "Pin/Unpin Tab"});
    chrome.contextMenus.create({"contexts":["all"],"id": "subMute","title": "Mute/Unmute"});
        chrome.contextMenus.create({"contexts":["all"],"id": "muteTab","parentId": "subMute","title": "Mute/Unmute Tab"});
        chrome.contextMenus.create({"contexts":["all"],"id": "muteAllOthers","parentId": "subMute","title": "Mute all other Tabs"});
        chrome.contextMenus.create({"contexts":["all"],"id": "unmuteAllOthers","parentId": "subMute","title": "Unmute all other Tabs"});
    chrome.contextMenus.create({"contexts":["all"],"id": "duplicateTab","title": "Duplicate Tab"});
    chrome.contextMenus.create({"contexts":["all"],"id": "closeAllOthers","title": "Close all other Tabs"});
    chrome.contextMenus.create({"contexts":["all"],"id": "closeTab","title": "Close Tab"});
}

function broadcast(data,sender){
    chrome.tabs.query({},function(tab){
        stack = tab;
        if(data==null) data = tab;
        $.each(tab,function(i,x){
            if(x.id!=sender){
                chrome.tabs.sendMessage(x.id,data);
            }
        });
        console.log(tab);
    });
}

chrome.contextMenus.onClicked.addListener(
    function(response,tab){
        if(response.menuItemId == "pinTab"){
            chrome.tabs.update(tab.id,{pinned: !tab.pinned});

        }else if(response.menuItemId == "muteTab"){
            chrome.tabs.update(tab.id,{muted: !tab.mutedInfo.muted});

        }else if(response.menuItemId == "muteAllOthers"){
            $.each(stack,function(i,x){
                if(x.id != tab.id && x.audible) chrome.tabs.update(x.id,{muted: true});
            });

        }else if(response.menuItemId == "unmuteAllOthers"){
            $.each(stack,function(i,x){
                if(x.id != tab.id && x.audible) chrome.tabs.update(x.id,{muted: false});
            });

        }else if(response.menuItemId == "duplicateTab"){
            chrome.tabs.create({url:tab.url});

        }else if(response.menuItemId == "closeTab"){
            chrome.tabs.remove(tab.id);

        }else if(response.menuItemId == "closeAllOthers"){
            $.each(stack,function(i,x){
                if(x.id != tab.id) chrome.tabs.remove(x.id);
            });

        }
});

chrome.runtime.onMessage.addListener(
    function(response, tab, callback){

        if(response.code == "getData"){
            callback({stack: stack,
                      myId: tab.tab.id,
                      windowId: tab.tab.windowId});

        }else if(response.code == "checkIfFullscreen"){
            chrome.windows.get(tab.tab.windowId, function(chromeWindow) {
                // "normal", "minimized", "maximized" or "fullscreen"
                callback({"isFullscreen":(chromeWindow.state == "fullscreen")});
            });
            return true;

        }else if(response.code == "setActive"){
            chrome.tabs.update(response.tabId,{active: true});

        }else if(response.code == "createTab"){
            chrome.tabs.create({});

        }else if(response.code == "muteTab"){
            $.each(stack,function(i,x){
                if(x.id == response.tabId){
                    chrome.tabs.update(response.tabId,{muted: !x.mutedInfo.muted});
                    return;
                }
            });

        }else if(response.code == "closeTab"){
            chrome.tabs.remove(response.tabId);
            if(response.tabId != tab.tab.id)
                chrome.tabs.update(tab.tab.id, {active: true});

        }else if(response.code == "moveTab"){
            chrome.tabs.move(response.id,{'index':response.index});

        }else{
            //broadcast(response,tab.id);
        }
});

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    console.log("onUpdated activated");
    broadcast(null,null);
});

chrome.tabs.onCreated.addListener(function(tab){
    console.log("onCreated activated");
    broadcast(null,null);
});

chrome.tabs.onMoved.addListener(function(tabId,moveInfo){
    console.log("onMoved activated");
    broadcast(null,null);
});

chrome.tabs.onActivated.addListener(function(activeInfo){
    console.log("onActivated activated");
    broadcast(null,null);
});

chrome.tabs.onDetached.addListener(function(tabId,detachInfo){
    console.log("onDetached activated");
    broadcast(null,null);
});

chrome.tabs.onAttached.addListener(function(tabId,attachInfo){
    console.log("onAttached activated");
    broadcast(null,null);
});

chrome.tabs.onRemoved.addListener(function(tabId,removeInfo){
    console.log("onRemoved activated");
    broadcast(null,null);
});

chrome.tabs.onReplaced.addListener(function(addedTabId,removedTabId){
    console.log("onReplaced activated");
    //broadcast(null,null);
});

init();
