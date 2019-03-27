"use strict";

(function () {
	angular
		.module("app.controllers")
		.controller("NavCtrl", NavCtrl);

	NavCtrl.$inject = ["$scope", "$window", "app", "connectionUtils", "i18nTrans", "ls", "timerUtils"];

	function NavCtrl($scope, $window, app, connectionUtils, i18nTrans, ls, timerUtils) {

		var vm = this;
		vm.online = $window.navigator.onLine;
		vm.title = app.state.title;
		vm.disableSidebar = app.state.disableSidebar;
		vm.sidebarState = app.state.sidebarState;
		vm.showTimer = app.state.timer;
		vm.showBottom = app.state.bottom;
		vm.hint = app.state.hint;
		vm.finishTimer = timerUtils.finish;
		vm.pauseTimer = timerUtils.pause;
		vm.resumeTimer = timerUtils.resume;
		vm.langStyle = ls.get("app_language_style");

		$scope.$on("$destroy", function () {
			vm = null;
			$scope = null;
		});

		$scope.$on("app:update-title", function (evt, title) {
			vm.title = title;
		});

		$scope.$on("app:enable-sidebar", function (evt, sidebars) {
			vm.disableSidebar = sidebars;
		});

		$scope.$on("app:show-timer", function (evt, show) {
			vm.showTimer = show;
			vm.timer = show ? timerUtils.timer : {};
		});

		$scope.$on("app:show-bottom", function (evt, show) {
			vm.showBottom = show;
		});

		$scope.$on("app:sidebar-state", function (evt, state) {
			vm.sidebarState = state;
		});

		$scope.$on("app:update-language", function (evt, language) {
			vm.language = language.key;
			vm.langStyle = language.style;
		});

		$scope.$on("app:update-hint", function (evt, hint) {
			vm.hint = hint;
		});

		$scope.$on("app:network-available", function (evt, online) {
			vm.online = online;
			$scope.$digest(vm.online);
			//// checkin if offline for more than an hour
			if (online) {
				connectionUtils.checkin();
			}
		});

	}
}());
