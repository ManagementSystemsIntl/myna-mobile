"use strict";

(function () {
	angular
		.module("egra")
		.directive("sidebarRightSurvey", Sidebar);

	Sidebar.$inject = [];

	function Sidebar() {
		var directive = {
			link: link,
			replace: false,
			restrict: "A",
			scope: {},
			templateUrl: "templates/sidebars/right.survey.html"
		};
		return directive;

		function link(scope) {

			scope.$on("$destroy", function() {
				scope = null;
			});

      scope.$on("sidebar:set-hint", function (evt, hint, direction) {
        scope.hint = hint;
        scope.direction = direction;
      });

		}
	}
}());
