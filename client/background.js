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

var oSocket = new WebSocket("ws://bluemirr.kr:9090/ws");
oSocket.onmessage = function (event) {
	chrome.browserAction.setBadgeText({text:"N"});
}
oSocket.onopen = function (e) {
	console.log("Server Connected");
};

oSocket.onclose = function (e) {
	alert("Server Disconnected")
};
// chrome.alarms.onAlarm.addListener(function(alarm) {
//     chrome.browserAction.setBadgeText({text:"1"});
// });