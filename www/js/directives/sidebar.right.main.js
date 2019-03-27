"use strict";

(function () {
	angular
		.module("egra")
		.directive("sidebarRightMain", Sidebar);

	Sidebar.$inject = ["$rootScope", "$window", "i18nFilter", "ls", "pdb", "SharedState", "sidebarUtils", "resolves", "rvUtils"];

	function Sidebar($rootScope, $window, i18nFilter, ls, pdb, SharedState, sidebarUtils, resolves, rvUtils) {
		var directive = {
			link: link,
			replace: false,
			restrict: "A",
			scope: {},
			templateUrl: "templates/sidebars/right.main.html"
		};
		return directive;

		function link(scope) {

			scope.offset = 0;
			scope.language = angular.copy(ls.get("app_language"));
			scope.postResponses = postResponses;
			scope.posting = false;
			scope.resumeSurvey = resumeSurvey;
			scope.total_response_count;
			scope.unsynced_modifications;
			scope.updateResponses = updateResponses;
			scope.viewResponseModal = viewResponseModal;

			init();

			scope.$on("$destroy", function() {
				scope = null;
			});

			scope.$on("sidebar:init-responses", function (evt, responses) {
				scope.responses = responses.rows;
				scope.unsynced_modifications = responses.unsynced_modifications;
				scope.total_response_count = responses.total_rows;
				scope.responses_last_synced = ls.get("responses_last_synced") || "NEVER";
				scope.responses_last_synced_time = new Date(ls.get("responses_last_synced")).getTime();
				postResponses();
			});

			scope.$on("app:update-language", function (evt, language) {
				scope.language = language.key;
			});

			function init() {
				$rootScope.$broadcast("sidebar:get-responses");
			}

			function postResponses() {
				scope.posting = true;
				return pdb.postResponses().then(function (res) {
					var today = new Date().toString().split(" ").slice(1, 4).join(" ");
	      	return resolves.responses(scope.offset);
				}).then(function (res) {
					scope.responses = res.rows;
					scope.unsynced_modifications = res.unsynced_modifications;
					scope.total_response_count = res.total_rows;
					scope.responses_last_synced = ls.get("responses_last_synced");
					scope.responses_last_synced_time = new Date(ls.get("responses_last_synced")).getTime();
					scope.posting = false;
					scope.$digest(sidebarUtils.toggleSyncClass("post", "success"));
				}).catch(function (err) {
					scope.posting = false;
					scope.$digest(sidebarUtils.toggleSyncClass("post", "fail"));
				});
			}

			function updateResponses(inc) {
				scope.offset += inc;
				return resolves.responses(scope.offset).then(function (res) {
					scope.responses = res.rows;
					scope.responses_last_synced_time = new Date(ls.get("responses_last_synced")).getTime();
				});
			}

			function viewResponseModal(response) {
				return pdb.localResponseDB.get(response._id).then(function (res) {
					rvUtils.set(res);
				});
			}

			function resumeSurvey(response) {
				if ($window.confirm(i18nFilter('ARE_YOU_SURE_RESUME', scope.language))) {
					SharedState.turnOff("sidebar-right");
					$rootScope.$broadcast("sidebar:resume-survey", response);
				}
			}

		}
	}
}());
