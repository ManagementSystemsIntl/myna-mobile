"use strict";

(function () {
	angular
		.module("app.controllers")
		.controller("GeoCtrl", GeoCtrl);

  GeoCtrl.$inject = ["$cordovaGeolocation", "$rootScope", "$scope", "app", "ls", "SharedState"];

	function GeoCtrl($cordovaGeolocation, $rootScope, $scope, app, ls, SharedState) {

    var vm = this;
    vm.finding;
    vm.geo = angular.copy(ls.get("geo")) || {};
		vm.getGeo = getGeo;
    vm.submit = submit;
		vm.schools = app.schools.hasOwnProperty("schools") ? angular.copy(app.schools).schools : null;
		vm.setSchoolCode = setSchoolCode;
		vm.updateAutocomplete = updateAutocomplete;

    init();

    $scope.$on("$destroy", function () {
      vm = null;
      $scope = null;
    });

    function init() {
			return getGeo();
    }

		function getGeo() {
			vm.finding = true;
			return $cordovaGeolocation.getCurrentPosition({timeout: 15000, enableHighAccuracy: true}).then(function (position) {
				['latitude', 'longitude', 'accuracy'].forEach(function (key) {
					vm.geo[key] = position.coords[key];
				});
				vm.finding = false;
				return true;
			}).catch(function (err) {
				['latitude', 'longitude', 'accuracy'].forEach(function (key) {
					vm.geo[key] = "NOT_FOUND";
				});
				vm.finding = false;
				return false;
			});
		}

    function submit() {
      ls.set("geo", vm.geo);
      ls.set("geo_info_last_set", new Date());
      SharedState.turnOff("geo");
      $rootScope.$broadcast("geo:updated", vm.geo);
    }

		function updateAutocomplete() {
			if (!vm.geo.school_code || vm.geo.school_code.length < 3) {
				vm.autocomplete = [];
				return;
			};
			vm.autocomplete = vm.schools.filter(function (d) { return d.school_id.match(vm.geo.school_code) });
		}

		function setSchoolCode(code) {
			vm.autocomplete = [];
			vm.geo.school_code = code;
			vm.geo.school_code_confirm = code;
		}

	}
}());
