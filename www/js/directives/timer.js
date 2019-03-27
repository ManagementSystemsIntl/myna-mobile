"use strict";

(function () {
	angular
		.module("egra")
		.directive("timerDirective", TimerDirective);

	TimerDirective.$inject = [];

	function TimerDirective() {
		var directive = {
			link: link,
			restrict: "A",
			scope: {
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
			scope.finished = false;

			scope.$on("$destroy", function() {
				try {
					appendWatch();
				} catch (err) {};
				appendWatch = null;
				scope = null;
			});

			scope.$on("timer:disable-other", function (evt, timer) {
				if (timer.position === parseInt(scope.position, 0)) {
					scope.disabled = timer.disabled;
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
				return scope.$emit("survey:start-timer", false, parseInt(scope.time, 0), scope.position, scope.timeRemaining === 0);
			}

			function resetTimer() {
				scope.running = false;
				scope.finished = false;
				return scope.$emit("survey:reset-timer", scope.name, false);
			}

		}
	}
}());
