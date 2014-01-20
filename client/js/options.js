function OptionCtrl($scope) {
	chrome.storage.sync.get("channel", function(item) {
		$scope.channel = item.channel
		console.log(item.channel);
		$scope.$apply();
	});
}