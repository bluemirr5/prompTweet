var myApp = angular.module('prompTweet',['ngAnimate'])
.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        //$compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);


function TestCtrl($scope) {
	$scope.cardList = [];

	$scope.send = function() {
		var message = $scope.message;
		var icon = chrome.extension.getURL('/img/01.png');
		var card = {userIcon:'/img/01.png', userName:"루피", message:$scope.message}
		$scope.cardList.unshift(card);
		$scope.message = "";
	}
	$scope.addNew = function() {
		chrome.browserAction.setBadgeText({text:"N"});
	}
}
chrome.browserAction.setBadgeText({text:""});