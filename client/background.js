//============================================
//
//  OmniBox
//
//============================================
chrome.omnibox.onInputChanged.addListener(
    function(text, suggest) {
        console.log('inputChanged: ' + text);
    }
);
chrome.omnibox.onInputEntered.addListener(
    function(text) {
        alert(text);
        console.log('inputEntered: ' + text);
    }
);

//============================================
//
//  Notify From WebSocket
//
//============================================
var oSocket = new WebSocket("ws://bluemirr.kr:9090/ws");
oSocket.onmessage = function (event) {
    var popups = chrome.extension.getViews({type: "popup"});
    console.log(popups.length);
    console.log(event.data);
    if (popups.length != 0) {
        var popup = popups[0];
        popup.addHiddenMessage(JSON.parse(event.data));
    } else {
        chrome.browserAction.setBadgeText({text:"N"});
    }
};
oSocket.onopen = function (e) {
    console.log("Server Connected");
};
oSocket.onclose = function (e) {
    alert("Server Disconnected")
};

//============================================
//
//  ContextMenu
//
//============================================
function createMenuItem(creationObject, onclickHandler) {
    if (onclickHandler) {
        creationObject.onclick = function(onClickData, tab) {
            onclickHandler(onClickData, tab, creationObject);
        };
    }
    return chrome.contextMenus.create(creationObject);
}
createMenuItem({"title": "PrompTweet", "contexts":["selection"]}, searchSelection);

//============================================
//
//  Common  Function
//
//============================================
var iconNames = ["Pororo","Crong","Petty","Eddy","Poby","Loopy","Harry"];
function rand(start, end) {
    return Math.floor((Math.random() * (end-start+1)) + start);
}
function searchSelection(info, tab, creationData) {
    send(info.selectionText)
}
function sendRemote(tweet) {
    console.log(tweet)

    var xmlhttp
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
        }
    }
    xmlhttp.open("POST","http://bluemirr.kr:9090/putTweet",true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(tweet);
}
function send(message) {
    if(message == null || message == "") {
        alert("No Message!");
        return
    }
    var i = rand(0,6)
    var si = (i+1)+""
    var card = {RandomIconNum:si, RandomId:iconNames[i], TweetMessage:message}
    sendRemote(JSON.stringify(card));
}