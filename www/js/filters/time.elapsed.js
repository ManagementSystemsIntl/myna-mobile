"use strict";

(function () {
	angular
		.module("egra")
		.filter("timeElapsed", timeElapsed);

	timeElapsed.$inject = [];

	function timeElapsed() {
		return function (input) {
			var totalSec = input / 1000;
			var s = Math.floor(totalSec % 60);
			var totalMin = Math.floor(totalSec / 60);
			var m = totalMin >= 60 ? Math.floor(totalMin % 60) : totalMin;
			var h = Math.floor(totalMin / 60);
			return h > 0 ? [h, m, s].map(fillZero).join(":") : [m, s].map(fillZero).join(":");

			function fillZero(i) {
				return ("0" + i).slice(-2);
			}
		};
	}
}());
