"use strict";

(function () {
	angular
		.module("egra")
		.directive("gridDirective", GridDirective);

	GridDirective.$inject = ["$window", "i18nFilter"];

	function GridDirective($window, i18nFilter) {
		var directive = {
			link: link,
			restrict: "A",
			scope: {
				autostop: "@",
				time: "@",
				name: "@",
				position: "@",
				render: "@",
				disabled: "@"
			},

			templateUrl: "templates/components/timer.html"
		};
		return directive;

		function link(scope, el) {

			var appendWatch;
			scope.timeRemaining = parseInt(scope.time, 0);
			scope.startTimer = startTimer;
			scope.resetTimer = resetTimer;
			scope.running = false;
			scope.finished = scope.timeRemaining === -1;
			if (scope.timeRemaining === -1) {
				disableGrid(false);
			}

			scope.$on("$destroy", function() {
				try {
					appendWatch();
				} catch (err) {};
				appendWatch = null;
				scope = null;
			});

			scope.$on("grid:disable-other", function (evt, grid) {
				if (grid.position === parseInt(scope.position, 0)) {
					scope.disabled = grid.disabled;
				}
			});

			appendWatch = scope.$watch("render", function (n) {
				if (n === "true") {
					var ael = document.querySelector("[form='schemaForm.form[" + scope.position + "]']");
					angular.element(ael).prepend(el[0]);
					appendWatch();
					ael = null;
				}
			});

			function startTimer() {
				scope.running = true;
				return scope.$emit("survey:start-timer", true, parseInt(scope.time, 0), scope.position, scope.timeRemaining === 0);
			}

			function resetTimer() {
				if (!$window.confirm(i18nFilter('RESET_GRID_WARNING'))) return;
				scope.running = false;
				scope.finished = false;
				return scope.$emit("survey:reset-timer", scope.name, true);
			}

			function disableGrid(value) {
				return scope.$emit("grid:disable", value, scope.position);
			}
		}
	}
}());
