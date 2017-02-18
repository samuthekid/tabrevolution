var stack;

function init(){
    // Start here
    console.log("back running");
    chrome.tabs.query({},function(tab){
        stack = tab;
    });
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
    });
}

chrome.runtime.onMessage.addListener(
    function(response, tab, callback){
        if(response.code == "getData"){
            //console.log(tab.tab);
            callback({stack: stack,
                      myId: tab.tab.id,
                      windowId: tab.tab.windowId});
        }else if(response.code == "setActive"){
            chrome.tabs.update(parseInt(response.tabId),{active: true});
        }else if(response.code == "moveTab"){
            chrome.tabs.move(response.id,{'index':response.index});
        }else{
            console.log("broadcast");
            console.log(response);
            //broadcast(response,tab.id);
        }
});

init();

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
    broadcast(null,null);
});
