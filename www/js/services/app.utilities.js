"use strict";

(function () {
	angular
		.module("egra")
		.service("app", app);

	app.$inject = ["$rootScope", "$state"];

	function app($rootScope, $state) {
		var utils = {
			setSchools: setSchools,
			setPupils: setPupils,
			disableSidebar: disableSidebar,
			showBottom: showBottom,
			showTimer: showTimer,
			updateMainTitle: updateMainTitle,
			updateSidebarState: updateSidebarState,
			state: {
				disable: {left: true, right: true},
				bottom: false,
				timer: false,
				title: "Page loading...",
				sidebarState: "main",
				sidebarStateParams: {}
			}
		};
		return utils;

		// /////////////////////////

		function disableSidebar(sidebar, status) {
			if (sidebar === "both") {
				utils.state.disable.left = status;
				utils.state.disable.right = status;
			} else {
				utils.state.disable[sidebar] = status;
			}
			$rootScope.$broadcast("app:enable-sidebar", utils.state.disable);
		}

		function showBottom(show) {
			utils.state.bottom = show;
			$rootScope.$broadcast("app:show-bottom", show);
		}

		function showTimer(show) {
			utils.state.timer = show;
			$rootScope.$broadcast("app:show-timer", show);
		}

		function updateMainTitle(title) {
			utils.state.title = title;
			$rootScope.$broadcast("app:update-title", title);
		}

		function updateSidebarState(state, params) {
			utils.state.sidebarState = state;
			utils.state.sidebarStateParams = params;
			$rootScope.$broadcast("app:sidebar-state", state, params);
		}

		function setSchools(schools) {
			utils.schools = schools;
		}

		function setPupils(pupils) {
			utils.pupils = pupils;
		}

	}
}());
