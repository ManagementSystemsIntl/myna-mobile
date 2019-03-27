"use strict";

(function () {
	angular
		.module("egra")
		.directive("sidebarRight", SidebarRight);

	SidebarRight.$inject = ["ls"];

	function SidebarRight(ls) {
		var directive = {
			link: link,
			replace: false,
			restrict: "A",
			scope: {},
			templateUrl: "templates/sidebars/right.html"
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
