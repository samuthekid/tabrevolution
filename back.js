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
        $.each(tab,function(i,x){
            if(x.id!=sender)
                chrome.tabs.sendMessage(x.id,data);
        });
    });
}

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    chrome.tabs.query({},function(tab){
        stack = tab;
    });
});

chrome.tabs.onCreated.addListener(function(tab){
    console.log("onCreated activated");
});

chrome.tabs.onMoved.addListener(function(tabId,moveInfo){
    console.log("onMoved activated");
});

chrome.tabs.onActivated.addListener(function(activeInfo){
    console.log("onActivated activated");
});

chrome.tabs.onHighlighted.addListener(function(highlightInfo){
    console.log("onHighlighted activated");
});

chrome.tabs.onDetached.addListener(function(tabId,detachInfo){
    console.log("onDetached activated");
});

chrome.tabs.onAttached.addListener(function(tabId,attachInfo){
    console.log("onAttached activated");
});

chrome.tabs.onRemoved.addListener(function(tabId,removeInfo){
    console.log("onRemoved activated");
});

chrome.tabs.onReplaced.addListener(function(addedTabId,removedTabId){
    console.log("onReplaced activated");
});


chrome.runtime.onMessage.addListener(
    function(response, tab, callback){
        if(response.code == "getData"){
            console.log(tab.tab);
            callback({stack: stack,
                      myId: tab.tab.id,
                      windowId: tab.tab.windowId});
        }else{
            console.log("broadcast");
            console.log(response);
            broadcast(response,tab.id);
        }
});

init();
