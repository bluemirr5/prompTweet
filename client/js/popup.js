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
		  		//console.log(data);
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
		sendRemote(JSON.stringify(card));
		$scope.message = "";
	}
	
	fetchTweet();
	$scope.addTweet = function(tweet) {
		// filter
		tweet = $scope.tweetFilter(tweet);

		$scope.tweetList.unshift(tweet);
		$scope.$apply();
		chrome.browserAction.setBadgeText({text:""});
	};

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

	$scope.link = function(purl) {
		chrome.tabs.create( { url: purl} );
	};

	$('#messagebox').keypress(function(e){
		if(e.keyCode == 13){
			$scope.send();
		}
	});

}

function addHiddenMessage(obj) {
	console.log("addHiddenMessage")
	angular.element(document.getElementById("body")).scope().addTweet(obj);
	angular.element(document.getElementById("body")).scope().$apply();
}
chrome.browserAction.setBadgeText({text:""});