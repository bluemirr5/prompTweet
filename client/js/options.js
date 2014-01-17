function OptionCtrl($scope) {
	console.log("aaaaa");
	chrome.storage.sync.get("channel", function(item) {
		$scope.channel = item.channel
		console.log(item.channel);
		$scope.$apply();
	});
}