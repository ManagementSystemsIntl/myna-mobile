"use strict";

(function () {
	angular
		.module("egra")
		.service("timerUtils", utilities);

	utilities.$inject = ["$interval", "$rootScope", "$window", "app", "i18nFilter"];

	function utilities($interval, $rootScope, $window, app, i18nFilter) {
		var utils = {
			finish: finish,
			pause: pause,
			reset: reset,
			resume: resume,
			start: start,
		};
		return utils;

		//-----------------------------

		function finish(manualstopped, autostopped, grid, mute) {
			reset();
			var msg = i18nFilter('END_TIMER');
			if (grid) {
				msg = autostopped ? i18nFilter('GRID_AUTOSTOP') : i18nFilter('GRID_LAST_READ');
				$rootScope.$broadcast("grid:init-last-word", utils.timer.position, utils.timer.time, autostopped, manualstopped);
			}
			if (!mute) $window.alert(msg);
			app.showTimer(false);
		}

		function pause() {
			$interval.cancel(utils.timer.running);
			utils.timer.paused = true;
			$rootScope.$broadcast("grid:disable", utils.timer.position, true);
		}

		function reset() {
			$interval.cancel(utils.timer.running);
			utils.timer.started = false;
			$rootScope.$broadcast("grid:disable", utils.timer.position, true);
		}

		function resume() {
			start(utils.timer, utils.timer.grid);
		}

		function start(timer, grid) {
			utils.timer = timer;
			timer.started = true;
			timer.paused = false;
			timer.grid = grid;
			$rootScope.$broadcast("grid:disable", timer.position, false);
			timer.running = $interval(function () {
				if (timer.time - 1 > 0) {
					timer.time--;
				} else {
					timer.time = 0;
					finish(false, false, grid);
				}
			}, 1000);
		}
	}
}());
