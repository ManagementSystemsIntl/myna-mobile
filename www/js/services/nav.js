"use strict";

(function () {
	angular
		.module("egra")
		.service("nav", nav);

	nav.$inject = ["$state", "ls"];

	function nav($state, ls) {
		var utils = {
			goTo: goTo
		};
		return utils;

		// /////////////////////////

		function goTo(state, params) {
			return $state.go(state, params);
		}

	}
}());
