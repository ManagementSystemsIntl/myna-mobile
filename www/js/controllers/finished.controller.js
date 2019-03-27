"use strict";

(function () {
  angular
    .module("app.controllers")
    .controller("FinishedCtrl", FinishedCtrl);

  FinishedCtrl.$inject = ["$scope", "app", "response"];

  function FinishedCtrl($scope, app, response) {

    var vm = this;

    $scope.$on("$destroy", function () {
      vm = null;
      $scope = null;
    });

    init();

    function init() {
      app.updateMainTitle('SURVEY_FINISHED');
      app.showBottom(true);
      app.showTimer(false);
      app.updateSidebarState("survey", {});
      app.disableSidebar("both", true);
    }
  }
}())
