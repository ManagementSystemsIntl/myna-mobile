"use strict";

(function () {
	angular
		.module("egra")
		.service("gridUtils", utilities);

	utilities.$inject = ["$rootScope"];

	function utilities($rootScope) {
		var utils = {
			initLastWord: initLastWord,
			reset: reset
		};
		return utils;

		//-----------------------------

		function initLastWord(grid, model, timeRemaining, autostopped, manualstopped) {
			grid.attempted = true;
			grid.timeRemaining = timeRemaining;
			grid.manualstopped = manualstopped;
			grid.incorrect = angular.copy(model[grid.key[0]]);
			var domGrid = document.querySelector(".grid.gridName-"+grid.key[0]);
			var cells = domGrid.querySelectorAll(".checkbox label");
			if (autostopped) {
				angular.element(cells[parseInt(autostopped, 0) - 1]).addClass("last-word");
				grid.lastRead = parseInt(autostopped, 0);
        grid.autostopped = true;
				$rootScope.$broadcast("grid:set-last-word", grid, true);
			} else {
        grid.autostopped = false;
				for (var i = 0; i < cells.length; i++) {
					angular.element(cells[i]).on("click", function () {
						var lw = angular.element(this).find("input").scope().$index + 1;
						var gridVals = model[grid.key[0]];
						if (lw >= parseInt(gridVals[gridVals.length - 1], 0) || gridVals.length === 0) {
							angular.element(document.querySelector(".grid.gridName-"+grid.key[0]).querySelector(".last-word")).removeClass("last-word");
							angular.element(this).addClass("last-word");
							grid.lastRead = lw;
							$rootScope.$broadcast("grid:set-last-word", grid);
						}
						return false;
					});
				}
			}
			domGrid = null;
			cells = null;
		}

		function reset(grid) {
			delete grid.autostopped;
			delete grid.manualstopped;
			delete grid.incorrect;
			grid.attempted = false;
			grid.lastRead = -1;
			var domGrid = document.querySelector(".grid.gridName-"+grid.key[0]);
			var cells = domGrid.querySelectorAll(".checkbox label");
			angular.element(document.querySelector(".grid.gridName-"+grid.key[0]).querySelector(".last-word")).removeClass("last-word");
			for (var i = 0; i < cells.length; i++) {
				angular.element(cells[i]).off("click");
			}
			domGrid = null;
			cells = null;
		}
	}
}());
