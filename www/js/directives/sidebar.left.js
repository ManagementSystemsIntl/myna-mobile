"use strict";

(function () {
	angular
		.module("egra")
		.directive("sidebarLeft", SidebarLeft);

	SidebarLeft.$inject = ["ls"];

	function SidebarLeft(ls) {
		var directive = {
			link: link,
			replace: false,
			restrict: "A",
			scope: {},
			templateUrl: "templates/sidebars/left.html"
		};
		return directive;

		function link(scope) {

			scope.langStyle = ls.get("app_language_style");

			scope.$on("$destroy", function() {
				scope = null;
			});

			scope.$on("app:sidebar-state", function (evt, state) {
				scope.state = state;
			});

			scope.$on("app:update-language", function (evt, language) {
				scope.langStyle = language.style;
			});

		}
	}
}());
