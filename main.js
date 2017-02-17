$(document).on("load", main.load());
$(document).on("keydown", main.shortcutOptions);
$(document).on("keyup", main.shortcutOptionsExit);

$(window).on("blur", main.shortcutOptionsForce);
$(window).on("load", function(){$("#search_box").focus();});
$(window).on("focus", function(){$("#search_box").focus();});


chrome.runtime.sendMessage({code: "get"},main.init);