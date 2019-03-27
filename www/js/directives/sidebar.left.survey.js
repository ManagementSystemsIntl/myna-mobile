"use strict";

(function () {
	angular
		.module("egra")
		.directive("sidebarLeftSurvey", Sidebar);

	Sidebar.$inject = ["$interval", "$rootScope"];

	function Sidebar($interval, $rootScope) {
		var directive = {
			link: link,
			replace: false,
			restrict: "A",
			scope: {},
			templateUrl: "templates/sidebars/left.survey.html"
		};
		return directive;

		function link(scope) {

			// var elapsed;
			// scope.elapsed;
			scope.skip = skip;
			scope.pause = pause;
			scope.quit = quit;

			scope.$on("$destroy", function () {
				$interval.cancel(elapsed);
				elapsed = null;
				scope = null;
			});

			scope.$on("sidebar:set-response", function (evt, response, params) {
				scope.info = response.response_info;
				scope.info.doc_id = response._id;
				scope.params = params;
				// try {
				// 	$interval.cancel(elapsed);
				// 	scope.elapsed = calculateElapsed(parseInt(response.modified));
				// 	elapsed = $interval(function () {
				// 		scope.elapsed = calculateElapsed(parseInt(response.modified));
				// 	}, 1000);
				// } catch (err) {};
			});

  		function calculateElapsed(startTime) {
  			var timeNow = new Date();
  			var timeThen = new Date(startTime);
  			return timeNow - timeThen;
  		}

			function skip() {
				$rootScope.$broadcast("survey:skip");
			}

			function pause() {
				$rootScope.$broadcast("survey:pause");
			}

			function quit() {
				$rootScope.$broadcast("survey:quit");
			}

		}
	}
}());
