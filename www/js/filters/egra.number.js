"use strict";

(function () {
  angular
    .module("egra")
    .filter("egraNumber", egraNumber);

  egraNumber.$inject = ["$filter", "i18nFilter"];

  function egraNumber($filter, i18nFilter) {
    return function (input, length) {
      return typeof input === "number" ? $filter("number")(input, length) : input;
		};
  }
}());
