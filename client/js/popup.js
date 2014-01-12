var myApp = angular.module('prompTweet',['ngAnimate'])
.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }
]);

const PROTOCOL_TYPE_REQ_FIRST_DATA  = "REQ_FIRST_DATA"
const PROTOCOL_TYPE_RESP_FIRST_DATA = "RESP_FIRST_DATA"
const PROTOCOL_TYPE_REQ_SEND_DATA   = "REQ_SEND_DATA"
const PROTOCOL_TYPE_RESP_NEW_DATA   = "REQ_NEW_DATA"

const HOST = "localhost"
const PORT = ":9090"

var iconNames = ["뽀로로","크롱","패티","에디","포비","루피","해리"];

function rand(start, end) {
    return Math.floor((Math.random() * (end-start+1)) + start);
}

function TestCtrl($scope, $http) {
	$scope.tweetList = [];

  	function fetchTweet() {
		$http({method: 'GET', url: "http://localhost:9090/getTweet"}).
	  		success(function(data, status, headers, config) {
		  		console.log(data);
	  			for (var i = 0; data != "null" && data != null && i < data.length; i++) {
		  			var temp = {};
		  			temp.RandomId = data[i].RandomId;
		  			temp.RandomIconNum = data[i].RandomIconNum;
		  			temp.TweetMessage = data[i].TweetMessage;
		  			console.log(temp);
	  				$scope.tweetList.unshift(temp);
	  			};
	  	}).
	  		error(function(data, status, headers, config) {
	  			console.log(data)
	  	});
  	}

  	function sendRemote(tweet) {
  		console.log(tweet)
  		$http.post("http://localhost:9090/putTweet", tweet).success(function(data, status, headers, config) {
		  		console.log(data);
	  	});
  	}

	$scope.send = function() {
		var message = $scope.message;
		if(message == null || message == "") {
			alert("No Message!");
			return
		}
		var i = rand(0,6)
		var si = (i+1)+""
		var card = {RandomIconNum:si, RandomId:iconNames[i], TweetMessage:$scope.message}
		$scope.tweetList.unshift(card);
		sendRemote(JSON.stringify(card));
		$scope.message = "";
	}
	
	$scope.addNew = function() {
		chrome.browserAction.setBadgeText({text:"N"});
	}
	var oSocket = new WebSocket("ws://localhost:9090/ws");
	oSocket.onmessage = function (event) {
		var parsedLog = JSON.parse(event.data)
		if(parsedLog.PtcType == PROTOCOL_TYPE_RESP_NEW_DATA) {
			$scope.cardList.unshift(parsedLog.PtcContents);
		}
		$scope.$apply();
	}
	oSocket.onopen = function (e) {
		console.log("Server Connected");
	};

	oSocket.onclose = function (e) {
		alert("Server Disconnected")
	};
	fetchTweet();
}
chrome.browserAction.setBadgeText({text:""});