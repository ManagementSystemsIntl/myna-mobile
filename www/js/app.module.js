"use strict";

(function () {
	angular
		.module("egra", [
			"ui.router",
			"mobile-angular-ui",
			"ngCordova",
			"ngStorage",
			"pouchdb",
			"schemaForm",
			"app.constants",
			"app.controllers",
			"app.translations"
		])
		.config(StateConfig)
		.run(Run)

	StateConfig.$inject = ["$stateProvider"];
	function StateConfig($stateProvider) {
		$stateProvider
			.state("app", {
				url: "/app",
				abstract: true,
				template: "<ui-view></ui-view>",
				resolve: {
					pouch: pouch
				},
				views: {
					"main": {
						templateUrl: "templates/layout/main.html",
						controller: "MainCtrl",
						controllerAs: "vm"
					},
					"nav": {
						templateUrl: "templates/layout/nav.html",
						controller: "NavCtrl",
						controllerAs: "vm"
					}
				}
			})
			.state("app.connection", {
				url: "/connection",
				templateUrl: "templates/state/connection.html",
				controller: "ConnectionCtrl",
				controllerAs: "vm",
				resolve: {
					connection: connection
				}
			})
			.state("app.home", {
				url: "/home",
				templateUrl: "templates/state/home.html",
				controller: "HomeCtrl",
				controllerAs: "vm",
				resolve: {
					enumerator: enumerator,
					geo: geo,
					responses: responses,
					surveys: surveys,
					incomplete: incomplete,
					schools: schools,
					pupils: pupils
				}
			})
			.state("app.survey", {
				url: "/response/:response_id/survey/:survey_id/section/:section_id",
				templateUrl: "templates/state/survey.html",
				controller: "SurveyCtrl",
				controllerAs: "vm",
				resolve: {
					response: response,
					survey: survey,
				}
			})
			.state("app.finished", {
				url: "/response/:response_id/finished",
				templateUrl: "templates/state/finished.html",
				controller: "FinishedCtrl",
				controllerAs: "vm",
				resolve: {
					response: finished
				}
			})
			.state("app.picknext", {
				url: "/response/:response_id/picknext",
				templateUrl: "templates/state/picknext.html",
				controller: "PicknextCtrl",
				controllerAs: "vm",
				resolve: {
					response: response
				}
			});
	}

	connection.$inject = ["resolves"];
	function connection(resolves) {
		return resolves.connection();
	}

	enumerator.$inject = ["resolves"];
	function enumerator(resolves) {
		return resolves.enumerator();
	}

	finished.$inject = ["$stateParams", "resolves"];
	function finished($stateParams, resolves) {
		return resolves.finished($stateParams.response_id);
	}

	geo.$inject = ["resolves"];
	function geo(resolves) {
		return resolves.geo();
	}

	incomplete.$inject = ["resolves"];
	function incomplete(resolves) {
		return resolves.incomplete();
	}

	pouch.$inject = ["resolves"];
	function pouch(resolves) {
		return resolves.pouch();
	}

	pupils.$inject = ["resolves"];
	function pupils(resolves) {
		return resolves.pupils();
	}

	response.$inject = ["$stateParams", "resolves"];
	function response($stateParams, resolves) {
		return resolves.response($stateParams.response_id);
	}

	responses.$inject = ["resolves"];
	function responses(resolves) {
		return resolves.responses(0);
	}

	schools.$inject = ["resolves"];
	function schools(resolves) {
		return resolves.schools();
	}

	survey.$inject = ["$stateParams", "resolves"];
	function survey($stateParams, resolves) {
		return resolves.survey($stateParams.survey_id, $stateParams.section_id);
	}

	surveys.$inject = ["resolves"];
	function surveys(resolves) {
		return resolves.surveys();
	}

	Run.$inject = ["$rootScope", "$state", "$timeout", "$window", "app", "ls", "nav"];
	function Run($rootScope, $state, $timeout, $window, app, ls, nav) {
		$rootScope.$on("$stateChangeStart", function () {
			// https://github.com/mcasimir/mobile-angular-ui-ui-router/issues/2#issuecomment-107425425
			$rootScope.$broadcast("$routeChangeStart");
			app.updateMainTitle("Page loading...");
		});
		$rootScope.$on("$stateChangeSuccess", function (evt, to, toP) {
			angular.element(document.querySelector("#loader")).addClass("hidden");
			if (to.name === "app.finished") {
				ls.set("current_state", "app.home");
				ls.set("current_state_params", {});
			} else {
				ls.set("current_state", to.name);
				ls.set("current_state_params", toP);
			}
		});

		$window.addEventListener("online", function () {
			return $rootScope.$broadcast("app:network-available", true);
		});

		$window.addEventListener("offline", function () {
			return $rootScope.$broadcast("app:network-available", false);
		});

		// timeout just so that state can resolve
		$timeout(function () {
			if (!ls.get("app_language")) {
				// if using older version of app, wipe it (not compatible)
				ls.set("app_language", "EN");
				ls.set("app_language_style", "app-language-ltr");
				ls.reset();
				ls.remove("connection");
			}
			if (!ls.get("connection")) {
				return nav.goTo("app.connection");
			} else if ($state.current.abstract && ls.get("current_state")) {
				return nav.goTo(ls.get("current_state"), ls.get("current_state_params"));
			}
			return false;
		}, 0);

	}

}());
