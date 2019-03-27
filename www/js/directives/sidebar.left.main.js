"use strict";

(function () {
	angular
		.module("egra")
		.directive("sidebarLeftMain", Sidebar);

	Sidebar.$inject = ["$q", "$rootScope", "app", "i18nTrans", "ls", "pdb", "sidebarUtils", "surveyUtils", "version"];

	function Sidebar($q, $rootScope, app, i18nTrans, ls, pdb, sidebarUtils, surveyUtils, version) {
		var directive = {
			link: link,
			replace: false,
			restrict: "A",
			scope: {},
			templateUrl: "templates/sidebars/left.main.html"
		};
		return directive;

		function link(scope) {
			scope.connection = ls.get("connection");
			scope.enumerator = ls.get("enumerator");
			scope.fetching = false;
			scope.geo = ls.get("geo");
			scope.languages = Object.keys(i18nTrans.config).map(function (key) {
				var obj = angular.copy(i18nTrans.config[key]);
				obj.key = key;
				return obj;
			});
			scope.language = angular.copy(ls.get("app_language"));
			scope.languageObj = scope.languages.filter(function (d) { return d.key === scope.language })[0];
			scope.showSurveys = false;
			scope.updateLanguage = updateLanguage;
			scope.updateSurveys = updateSurveys;
			scope.version = version;

			init();

			//---------------------

			scope.$on("$destroy", function() {
				scope = null;
			});

			scope.$on("connection:updated", function (evt, connection) {
				scope.connection = connection;
			});

			scope.$on("enumerator:updated", function (evt, enumerator) {
				scope.enumerator = enumerator;
			});

			scope.$on("geo:updated", function (evt, geo) {
				scope.geo = geo;
			});

			scope.$on("sidebar:init-surveys", function (evt, surveys) {
				scope.surveys = surveys;
				scope.surveys_last_synced = ls.get("surveys_last_synced");
				updateSurveys();
			});

			function init() {
				$rootScope.$broadcast("sidebar:get-surveys");
			}

			function updateLanguage(language) {
				ls.set("app_language", scope.languageObj.key);
				ls.set("app_language_style", scope.languageObj.style);
				scope.language = scope.languageObj.key;
				$rootScope.$broadcast("app:update-language", scope.languageObj);
			}

			function updateSurveys() {
				scope.fetching = true;
				return pdb.getSurveys().then(function (res) {
					return $q.all([
						pdb.localSurveyDB.get("schools").catch(function (err) { return {} }),
						pdb.localSurveyDB.get("pupils").catch(function (err) { return {} })
					]);
				}).then(function (res) {
					app.setSchools(res[0]);
					app.setPupils(res[1]);
					return pdb.localSurveyDB.query("surveys/surveys", {include_docs: true}).then(surveyUtils.mapSurveys);
				}).then(function (res) {
					scope.surveys = res.active;
					scope.surveys_last_synced = ls.get("surveys_last_synced");
					scope.fetching = false;
					$rootScope.$broadcast("app:update-surveys", res);
					scope.$digest(sidebarUtils.toggleSyncClass("fetch", "success"));
				}).catch(function (err) {
					scope.fetching = false;
					scope.$digest(sidebarUtils.toggleSyncClass("fetch", "fail"));
				});
			}

		}
	}
}());
