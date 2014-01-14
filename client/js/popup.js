var myApp = angular.module('prompTweet',['ngAnimate'])
.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
    }
]);

var iconNames = ["Pororo","Crong","Petty","Eddy","Poby","Loopy","Harry"];

function rand(start, end) {
    return Math.floor((Math.random() * (end-start+1)) + start);
}

function TestCtrl($scope, $http) {
	$scope.tweetList = [];

  	function fetchTweet() {
		$http({method: 'GET', url: "http://bluemirr.kr:9090/getTweet"}).
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
  		$http.post("http://bluemirr.kr:9090/putTweet", tweet).success(function(data, status, headers, config) {
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
		// $scope.tweetList.unshift(card);
		sendRemote(JSON.stringify(card));
		$scope.message = "";
	}
	
	$scope.addNew = function() {
		chrome.browserAction.setBadgeText({text:"N"});
	}
	var oSocket = new WebSocket("ws://bluemirr.kr:9090/ws");
	oSocket.onmessage = function (event) {
		var parsedLog = JSON.parse(event.data)
		$scope.tweetList.unshift(parsedLog);
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