"use strict";

(function () {
	angular
		.module("egra")
		.controller("MainCtrl", MainCtrl);

	MainCtrl.$inject = ["$scope", "connectionUtils", "ls"];

	function MainCtrl($scope, connectionUtils, ls) {

		var vm = this;
		vm.langStyle = ls.get("app_language_style");

		init();

		$scope.$on("$destroy", function () {
			vm = null;
			$scope = null;
		});

		$scope.$on("app:update-language", function (evt, language) {
			vm.langStyle = language.style;
		});

		function init() {
			connectionUtils.checkin();
		}

	}
}());
