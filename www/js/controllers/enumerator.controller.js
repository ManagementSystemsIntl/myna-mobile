"use strict";

(function () {
	angular
		.module("app.controllers")
		.controller("EnumeratorCtrl", EnumeratorCtrl);

	EnumeratorCtrl.$inject = ["$rootScope", "$scope", "ls", "SharedState"];

	function EnumeratorCtrl($rootScope, $scope, ls, SharedState) {

		var vm = this;
		vm.enumerator = angular.copy(ls.get("enumerator")) || {};
		vm.submit = submit;

		$scope.$on("$destroy", function () {
			vm = null;
			$scope = null;
		});

		function submit() {
			ls.set("enumerator", vm.enumerator);
			ls.set("enumerator_info_last_set", new Date());
			SharedState.turnOff("enum");
			$rootScope.$broadcast("enumerator:updated", vm.enumerator);
		}
	}
}());
