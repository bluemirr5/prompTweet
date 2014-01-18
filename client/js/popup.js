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

	// get Channel & 
	chrome.storage.sync.get("channel", function(item) {
		if(item.channel == undefined || item.channel == null) {
			item.channel = "";	
		}
		$scope.channel = item.channel;
		fetchTweet();
	});

	// when page has loaded get Tweet from Server
  	function fetchTweet() {
		$http({method: 'GET', url: "http://bluemirr.kr:9090/getTweet", params:{channel:$scope.channel}}).
	  		success(function(data, status, headers, config) {
	  			for (var i = 0; data != "null" && data != null && i < data.length; i++) {
		  			var temp = {};
		  			temp.RandomId = data[i].RandomId;
		  			temp.RandomIconNum = data[i].RandomIconNum;
		  			temp.TweetMessage = data[i].TweetMessage;
		  			temp.RegisterDate = data[i].RegisterDate;
		  			// console.log(temp);
		  			// filter
					temp = $scope.tweetFilter(temp);
	  				$scope.tweetList.unshift(temp);
	  			};
	  	}).
	  		error(function(data, status, headers, config) {
	  			console.log(data)
	  	});
  	}

  	// send Tweet to Server
  	function sendRemote(tweet) {
  		console.log(tweet)
  		$http.post("http://bluemirr.kr:9090/putTweet", tweet).success(function(data, status, headers, config) {
	  		console.log(data);
	  	});
  	}

  	// make Tweet for sending Server
	$scope.send = function() {
		var message = $scope.message;
		if(message == null || message == "") {
			alert("No Message!");
			return
		}
		var i = rand(0,6)
		var si = (i+1)+""
		var card = {RandomIconNum:si, RandomId:iconNames[i], TweetMessage:$scope.message}
		sendRemote(JSON.stringify(card));
		$scope.message = "";
	}
	
	// when client recieve Tweet, add and display Tweet
	$scope.addTweet = function(tweet) {
		// filter
		tweet = $scope.tweetFilter(tweet);

		$scope.tweetList.unshift(tweet);
		$scope.$apply();
		chrome.browserAction.setBadgeText({text:""});
	};

	// classify Tweet Type : Text, Image, Link
	$scope.tweetFilter = function(tweet) {
		tweet.Type = "T";
		var message = tweet.TweetMessage;
		var header1 = message.substring(0,7).toLowerCase();
		var header2 = message.substring(0,8).toLowerCase();
		var header3 = message.substring(0,16).toLowerCase();
		if(header1 == "http://" || header2 == "https://") {
			//link
			tweet.Type = "L";
			var tail = message.substring(message.length-4, message.length).toLowerCase();
			if(tail == ".jpg" || tail == ".gif" || tail == ".png") {
				tweet.Type = "I"
				//Image
			}
		} else if(header3 == "data:image/jpeg;") {
			tweet.Type = "I"
		}
		return tweet;
	};

	// goto link
	$scope.link = function(purl) {
		chrome.tabs.create( { url: purl} );
	};

	// view operation
	$('#messagebox').keypress(function(e){
		if(e.keyCode == 13){
			$scope.send();
		}
	});

}

// call from background.js
function addHiddenMessage(obj) {
	console.log("addHiddenMessage")
	angular.element(document.getElementById("body")).scope().addTweet(obj);
	angular.element(document.getElementById("body")).scope().$apply();
}
chrome.browserAction.setBadgeText({text:""});