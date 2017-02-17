

function init(){
	// Start here
}

chrome.runtime.onMessage.addListener(function(response, tab, callback){
    if(response.code == "getData")
		callback({data: "teste"});
});

chrome.tabs.sendMessage();

init();