//============================================
//
//  OmniBox
//
//============================================
var gchannel;
chrome.omnibox.onInputChanged.addListener(
    function(text, suggest) {
        console.log('inputChanged: ' + text);
    }
);
chrome.omnibox.onInputEntered.addListener(
    function(text) {
        alert(text);
        console.log('inputEntered: ' + text);
        chrome.storage.sync.set({'channel': text}, function() {
            gchannel = text;
            console.log("saveChannel");
        });
    }
);
chrome.storage.sync.get("channel", function(item) {
    if(item.channel == undefined || item.channel == null) {
        item.channel = "";  
    }
    gchannel = item.channel;
});

//============================================
//
//  Notify From WebSocket
//
//============================================
var oSocket;
function setWebSocketClient() {
    oSocket = new WebSocket("ws://bluemirr.kr:9090/ws");
    oSocket.onmessage = function (event) {
        var tweet = JSON.parse(event.data)
        var destTweet = channelFilterTweet(tweet);
        console.log(destTweet);
        console.log(tweet);
        if(destTweet != null) {
            var popups = chrome.extension.getViews({type: "popup"});
            if (popups.length != 0) {
                var popup = popups[0];
                popup.addHiddenMessage(tweet);
            } else {
                // chrome.browserAction.setBadgeBackgroundColor({color:[232,212,102,255]});
                chrome.browserAction.setBadgeText({text:"N"});
                makeNotification(destTweet);
            }
        }
    };
    oSocket.onopen = function (e) {
        console.log("Server Connected");
    };
    oSocket.onclose = function (e) {
        console.log("Server Disconnected")
        var r=confirm("PrompTweet Server is disconnected.\n Connect again?");
        if(r) {
            setWebSocketClient();
        }
    };
} 
setWebSocketClient();
function channelFilterTweet(tweet) {
    var channel = null;
    var message = tweet.TweetMessage;
    var firstStr = message.substring(0, 1);
    var etcStr = message.substring(1, message.length-1);
    var parsedMessage = etcStr.split("#");
    if (firstStr == "#") {
        if (parsedMessage.length == 2 && parsedMessage[0] == gchannel) {
            tweet.TweetMessage = parsedMessage[1];
            channel = gchannel;
        }
    } else {
        channel = "Common";
    }
    if(channel != null) {
        tweet.channel = channel
        return tweet;
    } else {
        return null;
    }
}
function makeNotification(tweet) {
    chrome.notifications.clear("PrompTweet", function(cleared){
        var tweetType = getTweetType(tweet.TweetMessage);
        var notyType = "basic";
        var callback = function(){};
        if(tweetType == "I") {
            notyType = "image"
        }
        var opt = {
            type: notyType,
            title: tweet.RandomId+" : "+tweet.RegisterDate,
            message: tweet.TweetMessage,
            iconUrl: "/icon.png"
        }
        if(tweetType == "I") {
            opt.imageUrl = tweet.TweetMessage;
        }
        console.log(opt);
        chrome.notifications.onClicked.addListener(function(notificationId){
            chrome.notifications.clear("PrompTweet", function(b){});
        });
        chrome.notifications.create("PrompTweet", opt, callback);
    });        
}

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
createMenuItem({"title": "PrompTweet", "contexts":["selection", "image", "link"]}, contextAction);
function contextAction(info, tab, creationData) {
    if(info.selectionText != undefined && info.selectionText != null) {
        send(info.selectionText);
    } else if(info.srcUrl != undefined && info.srcUrl != null) {
        send(info.srcUrl);
    } else if(info.linkUrl != undefined && info.linkUrl != null) {
        send(info.linkUrl);
    }
}

//============================================
//
//  Common  Function
//
//============================================
var iconNames = ["Pororo","Crong","Petty","Eddy","Poby","Loopy","Harry"];
function rand(start, end) {
    return Math.floor((Math.random() * (end-start+1)) + start);
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

function getTweetType(message) {
    var retType = "T";
    var header1 = message.substring(0,7).toLowerCase();
    var header2 = message.substring(0,8).toLowerCase();
    var header3 = message.substring(0,16).toLowerCase();
    if(header1 == "http://" || header2 == "https://") {
        //link
        retType = "L";
        var tail = message.substring(message.length-4, message.length).toLowerCase();
        if(tail == ".jpg" || tail == ".gif" || tail == ".png") {
            retType = "I"
            //Image
        }
    } else if(header3 == "data:image/jpeg;") {
        retType = "I"
    }
    return retType;
}