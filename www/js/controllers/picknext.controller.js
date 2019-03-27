"use strict";

(function () {
  angular
    .module("app.controllers")
    .controller("PicknextCtrl", PicknextCtrl);

  PicknextCtrl.$inject = ["$scope", "$state", "$stateParams", "app", "ls", "pdb", "response", "surveyUtils"];

  function PicknextCtrl($scope, $state, $stateParams, app, ls, pdb, response, surveyUtils) {

    var vm = this;
    vm.family = response.family;
    vm.randoms = response.family.random_uuids.filter(function (d) {
      return vm.family.used_random.indexOf(d.uuid) === -1;
    });
    vm.survey_id;
    vm.submit = submit;

    $scope.$on("$destroy", function () {
      vm = null;
      $scope = null;
    });

    init();

    function init() {
      app.updateMainTitle('PICKNEXT_SURVEY');
      app.showBottom(true);
      app.showTimer(false);
      app.updateSidebarState("survey", {});
      app.disableSidebar("both", true);
    }

    function submit() {
      ls.set("current_survey", vm.survey_id);
      vm.family.used_random.push(vm.survey_id);
      return pdb.localResponseDB.put(response).then(function (res) {
        return pdb.localSurveyDB.get(vm.survey_id);
      }).then(function (survey) {
        var nextSection = surveyUtils.findNextSection(0, ls.get("current_grade"), survey, true);
        return $state.go("app.survey", {response_id: response._id, survey_id: vm.survey_id, section_id: nextSection});
      });
    }
  }
}())
