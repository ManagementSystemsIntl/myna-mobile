"use strict";

(function () {
	angular
		.module("app.controllers")
		.controller("ConnectionCtrl", ConnectionCtrl);

	ConnectionCtrl.$inject = ["$scope", "app", "connection", "connectionUtils", "ls", "nav"];

	function ConnectionCtrl($scope, app, connection, connectionUtils, ls, nav) {

		var vm = this;
		vm.connection = connection;
		vm.connecting = false;
		vm.reset = reset;
		vm.submit = submit;
		vm.showCancel = ls.get("connection");

		init();

		$scope.$on("$destroy", function () {
			vm = null;
			$scope = null;
		});

		function init() {
			app.showBottom(false);
			app.showTimer(false);
			app.disableSidebar("both", true);
			app.updateMainTitle("CONNECTION_SETTINGS");
			app.updateSidebarState("main", {});
		}

		function reset() {
			vm.error = false;
			vm.connection = {};
			$scope.connectionForm.$setPristine();
			$scope.connectionForm.$setUntouched();
		}

		function submit() {
			vm.connecting = true;
			vm.error = false;
			return connectionUtils.connect(vm.connection).then(function (res) {
				ls.set("fb-checkin", new Date());
				vm.connecting = false;
				nav.goTo("app.home");
			}).catch(function (err) {
				vm.error = err.statusText || err.error || "Error connecting to cohort";
				vm.connecting = false;
			});
		}
	}
}());
