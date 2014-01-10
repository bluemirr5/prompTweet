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
// chrome.alarms.onAlarm.addListener(function(alarm) {
//     chrome.browserAction.setBadgeText({text:"1"});
// });