"use strict";

(function () {
	angular
		.module("egra")
		.service("ls", ls);

	ls.$inject = ["$localStorage"];

	function ls($localStorage) {
		var utils = {
			set: set,
			get: get,
			remove: remove,
			reset: reset,
			getFamState: getFamState
		};
		return utils;

		//-----------------------

		function set(key, value) {
			$localStorage[key] = value;
			return value;
		}

		function get(key) {
			return $localStorage[key];
		}

		function remove(key) {
			delete $localStorage[key];
		}

		function reset() {
			var keys = Object.keys($localStorage).filter(function (d) { return !d.match(/^\$/) });
			keys.forEach(function (key) {
				if (key === "connection" || key === "app_language" || key === "app_language_style") return;
				delete $localStorage[key];
			});
		}

		function getFamState() {
			return angular.copy({
				current_family_id: $localStorage.current_family_id,
				families: $localStorage.families,
				family_random_index: $localStorage.family_random_index,
				family_survey_index: $localStorage.family_survey_index,
				current_survey: $localStorage.current_survey,
				survey_subtask_order: $localStorage.survey_subtask_order
			});
		}

	}
}());
