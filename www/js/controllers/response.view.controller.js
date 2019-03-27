"use strict";

(function () {
	angular
		.module("egra")
		.controller("RVCtrl", RVCtrl);

	RVCtrl.$inject = ["$scope", "rvUtils", "SharedState"];

	function RVCtrl($scope, rvUtils, SharedState) {
    var vm = this;
		vm.close = close;

    $scope.$on("$destroy", function () {
      vm = null;
      $scope = null;
    });

		$scope.$on("update-modal-response", function (evt, response)  {
			vm.response = response;
			$scope.$digest();
		});

		function close(evt) {
			evt.stopImmediatePropagation();
			SharedState.turnOff("rv");
		}

	}
}());
