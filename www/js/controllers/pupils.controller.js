"use strict";

(function () {
	angular
		.module("app.controllers")
		.controller("PupilsCtrl", PupilsCtrl);

  PupilsCtrl.$inject = ["$rootScope", "$scope", "app", "ls", "SharedState"];

	function PupilsCtrl($rootScope, $scope, app, ls, SharedState) {

    var vm = this;
    vm.submit = submit;
		vm.pupils = app.pupils.hasOwnProperty("pupils") ? angular.copy(app.pupils).pupils : null;
		vm.setStudentCode = setStudentCode;
		vm.updateAutocomplete = updateAutocomplete;
    vm.geo = ls.get("geo");
    vm.enumerator = ls.get("enumerator");
    vm.generateStudentCode = generateStudentCode;
		vm.valid = false;

    $scope.$on("$destroy", function () {
      vm = null;
      $scope = null;
    });

    function submit() {
      SharedState.turnOff("pupils");
      $rootScope.$broadcast("pupil:updated", vm.student);
    }

		function updateAutocomplete() {
			if (!vm.student || vm.student.length < 3) {
				vm.autocomplete = [];
				return;
			};
			vm.autocomplete = vm.pupils.filter(function (d) { return d.school_code === vm.geo.school_code && d.student_unique_code.match(vm.student) });
			vm.valid = false;
		}

		function setStudentCode(code) {
			vm.autocomplete = [];
      vm.student = code;
			vm.valid = true;
		}

    function generateStudentCode() {
      var today = new Date();
      var rand = Math.floor((Math.random() * 9999) + 999);
      var hr = ["0",today.getHours()].join("").slice(-2);
      var sec = ["0",today.getSeconds()].join("").slice(-2);
      vm.student = [vm.enumerator.id, hr, sec, rand].join("");
			vm.valid = true;
    }

	}
}());
