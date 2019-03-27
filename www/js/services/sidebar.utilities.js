"use strict";

(function () {
  angular
    .module("egra")
    .service("sidebarUtils", utilities);

    utilities.$inject = ["$timeout"];

    function utilities($timeout) {
      var utils = {
        toggleSyncClass: toggleSyncClass
      };
      return utils;

      function toggleSyncClass(selector, result) {
        var elem = angular.element(document.querySelector(".sidebar-" + selector));
        var cl = "sync-" + result;
        elem.addClass(cl);
        var changeClass = $timeout(function () {
          elem.removeClass(cl);
          changeClass = null;
        }, 2000);
      }
      
    }
}())
