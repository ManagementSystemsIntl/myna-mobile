"use strict";

(function () {
	angular
		.module("app.controllers")
		.controller("HomeCtrl", HomeCtrl);

	HomeCtrl.$inject = ["$rootScope", "$scope", "app", "enumerator", "geo", "incomplete", "ls", "pupils", "responses", "schools", "surveys", "surveyUtils"];

	function HomeCtrl($rootScope, $scope, app, enumerator, geo, incomplete, ls, pupils, responses, schools, surveys, surveyUtils) {

		var vm = this;
		vm.allSurveys = surveys.active;
		vm.enumerator = enumerator;
		vm.formInfo = {};
		vm.formIncomplete;
		vm.geo = geo;
		vm.generateStudentCode = generateStudentCode;
		vm.grades = surveys.grades;
		vm.incomplete = incomplete;
		vm.lang = ls.get("app_language");
		vm.newSurvey = true;
		vm.pupils = pupils.hasOwnProperty("pupils");
		vm.responses = responses;
		vm.surveys, vm.golds;
		vm.validInfo = enumerator && geo;
		vm.validateForm = validateForm;
		vm.updateGolds = updateGolds;
		vm.updateSurveys = updateSurveys;
		vm.startSurvey = startSurvey;
		vm.resumeSurvey = resumeSurvey;
		vm.starting = false;

		init();

		$scope.$on("$destroy", function () {
			vm = null;
			$scope = null;
		});

		$scope.$on("enumerator:updated", function (evt, enumerator) {
			vm.enumerator = enumerator;
			validateInfo();
		});

		$scope.$on("geo:updated", function (evt, geo) {
			vm.geo = geo;
			validateInfo();
		});

		$scope.$on("app:update-language", function (evt, lang) {
			vm.lang = lang.key;
		});

		$scope.$on("pupil:updated", function (evt, code) {
			vm.formInfo.student_unique_code = code;
			validateForm();
		});

		$scope.$on("app:update-surveys", function (evt, surveys) {
			vm.allSurveys = surveys.active;
			vm.pupils = app.pupils.hasOwnProperty("pupils");
			vm.grades = surveys.grades;
			vm.formInfo = {};
			vm.surveys = undefined;
			vm.golds = undefined;
			$scope.$digest();
		});

		$scope.$on("sidebar:get-responses", function () {
			$rootScope.$broadcast("sidebar:init-responses", responses);
		});

		$scope.$on("sidebar:get-surveys", function () {
			$rootScope.$broadcast("sidebar:init-surveys", surveys.active);
		});

		$scope.$on("sidebar:resume-survey", function (evt, response) {
			vm.formIncomplete = response;
			resumeSurvey();
		});

		function init() {
			app.setSchools(schools);
			app.setPupils(pupils);
			app.updateMainTitle("HOME_PAGE");
			app.showBottom(true);
			app.showTimer(false);
			app.updateSidebarState("main", {});
			if (vm.validInfo) {
				app.disableSidebar("both", false);
			} else {
				app.disableSidebar("both", true);
			}
			$rootScope.$broadcast("sidebar:init-surveys", surveys.active);
			$rootScope.$broadcast("sidebar:init-responses", responses);
		}

		function validateInfo() {
			vm.validInfo = vm.geo && vm.enumerator;
			if (vm.validInfo) {
				app.disableSidebar("both", false);
			}
		}

		function validateIrr() {
			return vm.formInfo.irr_entry && vm.formInfo.irr_student_code && (vm.formInfo.irr_student_code === vm.formInfo.irr_student_code_confirm);
		}

		function validateTraining() {
			return vm.formInfo.training_entry && vm.golds.indexOf(vm.formInfo.gold_standard) > -1;
		}

		function updateSurveys(grade) {
			vm.formInfo = {grade: grade};
			vm.validForm = false;
			vm.surveys = vm.allSurveys.filter(function (survey) {
				return survey.survey_info.grade.indexOf(grade) > -1;
			});
		}

		function updateGolds(survey) {
			vm.golds = survey ? ["Practice"].concat(survey.survey_info.gold_standards) : ["Practice"];
		}

		function validateForm() {
			var training = vm.formInfo.training_entry ? validateTraining() : true;
			var irr = vm.formInfo.irr_entry ? validateIrr() : true;
			var student = vm.formInfo.student_unique_code;
			vm.validForm = training && irr && student && vm.validInfo;
			try {
				$scope.$digest(vm.validForm);
			} catch (err) {}
		}

		function startSurvey() {
			vm.starting = true;
			var response = surveyUtils.init(vm.formInfo, vm.enumerator, vm.geo);
			ls.set("training_entry", response.response_info.training_entry);
			ls.set("current_grade", response.response_info.grade);
			surveyUtils.start(response, vm.formInfo.survey);
		}

		function resumeSurvey() {
			Object.keys(vm.formIncomplete.progress.famState).forEach(function (key) {
				ls.set(key, vm.formIncomplete.progress.famState[key]);
			});
			surveyUtils.resume(vm.formIncomplete);
		}

		function generateStudentCode() {
			var today = new Date();
			var rand = Math.floor((Math.random() * 9999) + 999);
			var hr = ["0",today.getHours()].join("").slice(-2);
			var sec = ["0",today.getSeconds()].join("").slice(-2);
			vm.formInfo.student_unique_code = [vm.enumerator.id, hr, sec, rand].join("");
			validateForm();
		}

  }
}());
