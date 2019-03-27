"use strict";

(function () {
  angular
    .module("app.controllers")
    .controller("SurveyCtrl", SurveyCtrl);

  SurveyCtrl.$inject = ["$rootScope", "$scope", "$stateParams", "$window", "app", "i18nFilter", "ls", "response", "survey", "gridUtils", "surveyUtils", "timerUtils", "validations"];

  function SurveyCtrl($rootScope, $scope, $stateParams, $window, app, i18nFilter, ls, response, survey, gridUtils, surveyUtils, timerUtils, validations) {

    var watches = [];
    var vm = this;
    vm.startTime = new Date();
    vm.response = response;
    vm.survey = survey;
    vm.isFamily = response.hasOwnProperty("surveys");
    vm.form = survey.form;
    vm.grids = survey.grids;
    vm.gridKeys = Object.keys(vm.grids);
    vm.timers = survey.timers;
    vm.timerKeys = Object.keys(vm.timers);
    vm.schema = survey.schema;
    vm.hint = survey.subtask.config.hint;
    vm.revisited = checkRevisited(response, survey);
    vm.runningTimer = {};
    vm.surveymodel = checkExistingResponse(response, survey) || survey.section_response;
    vm.submit = submit;
    vm.checkAutostop = checkAutostop.bind(vm.surveymodel);

    init();

    $scope.$on("$destroy", function () {
      vm = null;
      watches.forEach(function (w) {
        w();
        w = null;
      });
      watches = null;
      $scope = null;
    });

    $scope.$on("sf-render-finished", sfRenderFinished);

    $scope.$on("survey:start-timer", function (evt, is_grid, time, position, up) {
      vm.runningTimer.time = time;
      vm.runningTimer.position = position;
      timerUtils.start(vm.runningTimer, is_grid);
      app.showTimer(true);
    });

    $scope.$on("survey:reset-timer", function (evt, name, is_grid) {
      vm.runningTimer = {};
      app.showTimer(false);
      timerUtils.reset();
      if (vm.gridKeys.length > 0 && is_grid) {
        var grid = vm.grids[name];
        // key should equal name
        var key = grid.key[0];
        vm.surveymodel[key] = [];
        vm.form.filter(function (d) { return d.condition && eval(d.condition) }).forEach(function (question) {
          var key = question.key[0];
          var b = question.schema.type;
          vm.surveymodel[key] = b === "array" ? [] : b === "integer" ? null : "-999";
				});
        gridUtils.reset(grid);
        vm.gridKeys.filter(function (d) { return d !== name+"_grid" }).forEach(function (d) {
          vm.grids[d].disabled = false;
          $scope.$broadcast("grid:disable-other", vm.grids[d]);
        });
        if (vm.gridKeys.length > 0 && !vm.submitted) {
          vm.gridKeys.forEach(function (g, idx) {
            var grid = vm.grids[g];
            if (grid.key[0] !== key) return;
            vm.form[grid.position].readonly = true;
            var astop = parseInt(grid.autostop, 0);
            if (astop > -1) {
              watches[idx]();
              var astopWatch = $scope.$watch("vm.surveymodel['" + grid.key + "']", function (n) {
                if (n && n.length > astop - 1 && parseInt(n[astop - 1], 0) === astop) {
                  grid.autostopped = true;
                  grid.manualstopped = false;
                  grid.lastRead = parseInt(n[astop - 1], 0);
                  timerUtils.finish(false, grid.lastRead, true);
                  astopWatch();
                }
              }, true);
              watches[idx] = astopWatch;
            } else if (grid.autostop === -1) {
              grid.lastRead = grid.titleMap.length;
            }
          });
        }
      } else if (vm.timerKeys.length > 0 && !is_grid) {
        vm.timerKeys.filter(function (d) { return d !== name+"_timer" }).forEach(function (d) {
          vm.timers[d].disabled = false;
          $scope.$broadcast("grid:disable-other", vm.timers[d]);
        });
      }
    });

    $scope.$on("survey:skip", function () {
      if ($window.confirm(i18nFilter('ARE_YOU_SURE_SKIP'))) {
        vm.surveymodel[vm.survey.subtask.code+"_Skipped"] = true;
        submit(true);
      }
    });

    $scope.$on("survey:pause", function () {
      if (!$window.confirm(i18nFilter('PAUSE_WARNING'))) return;
      vm.response.progress = {
        params: angular.copy($stateParams),
        state: "app.survey",
        updated: new Date(),
        upNext: vm.survey.subtask.name,
        famState: ls.getFamState()
      }
      return surveyUtils.submit(vm.response, null, null, true);
    });

    $scope.$on("survey:quit", function () {
      if (!$window.confirm(i18nFilter('QUIT_WARNING'))) return;
      vm.response.response_info.exit = true;
      delete vm.response.progress;
      return surveyUtils.submit(vm.response, null, true);
    });

    function sfRenderFinished() {
      if (vm.gridKeys.length > 0) {
        vm.gridKeys.forEach(function (g) {
          vm.grids[g].render = true;
        });
      }
      if (vm.timerKeys.length > 0) {
        vm.timerKeys.forEach(function (t) {
          vm.timers[t].render = true;
        });
      }
		}

    // grid listeners
    $scope.$on("grid:disable", function (evt, position, disabled) {
      vm.form[position].readonly = disabled;
      // if grid is in progress, disable submit button
      if (!disabled && vm.runningTimer.started) {
        vm.form[vm.form.length-1].readonly = true;
      } else if (vm.runningTimer.started && vm.runningTimer.paused) {
        vm.form[vm.form.length-1].readonly = true;
      } else {
        vm.form[vm.form.length-1].readonly = false;
      }
      // disable all other grids
      vm.gridKeys.forEach(function (g) {
        var grid = vm.grids[g];
        if (grid.position === parseInt(position, 0)) return;
        if (!disabled && vm.runningTimer.started) {
          grid.disabled = true;
        } else if (vm.runningTimer.started && vm.runningTimer.paused) {
          grid.disabled = true;
        } else {
          grid.disabled = false;
        }
        $scope.$broadcast("grid:disable-other", grid);
      });
      // disable all other timers
      vm.timerKeys.forEach(function (t) {
        var timer = vm.timers[t];
        if (timer.position === parseInt(position, 0)) return;
        if (!disabled && vm.runningTimer.started) {
          timer.disabled = true;
        } else if (vm.runningTimer.started && vm.runningTimer.paused) {
          timer.disabled = true;
        } else {
          timer.disabled = false;
        }
        $scope.$broadcast("timer:disable-other", timer);
      });
    });

    $scope.$on("grid:init-last-word", function (evt, position, timeRemaining, autostopped, manualstopped) {
      vm.form[vm.form.length-1].readonly = true;
      var grid = vm.gridKeys.map(function (d) { return vm.grids[d] }).filter(function (grid) { return grid.position === parseInt(position, 0)})[0];
      return gridUtils.initLastWord(grid, vm.surveymodel, timeRemaining, autostopped, manualstopped);
    });

    $scope.$on("grid:set-last-word", function (evt, grid) {
      if (vm.runningTimer.started || vm.runningTimer.started && vm.runningTimer.paused) {
        vm.form[vm.form.length-1].readonly = true;
      } else {
        vm.form[vm.form.length-1].readonly = false;
      }
      vm.gridKeys.map(function (d) { return vm.grids[d] }).filter(function (g) { return g.position !== grid.position}).forEach(function (g) {
        g.disabled = false;
        $scope.$broadcast("grid:disable-other", g);
      });
      try {
        $scope.$digest();
      } catch (err) {};
    });

    function init() {
      app.updateMainTitle(vm.survey.subtask.name);
      app.showBottom(true);
      app.showTimer(false);
      app.updateSidebarState("survey", {});
      app.disableSidebar("left", false);
      app.disableSidebar("right", vm.hint ? false : true);
      $rootScope.$broadcast("sidebar:set-response", vm.response, {
        revisited: vm.revisited,
        skippable: vm.survey.subtask.config.skippable,
        first: ls.get("survey_subtask_order") === 0,
      });
      if (vm.hint) {
        $rootScope.$broadcast("sidebar:set-hint", vm.hint, vm.survey.direction);
      }
      if (!vm.revisited && vm.isFamily && Object.keys(vm.response.surveys[survey.id].response_info).length === 0) {
        var info = survey.info;
        info.survey_order = ls.get("family_survey_index") - 1;
        vm.response.surveys[survey.id].response_info = info;
      }
      if (vm.gridKeys.length > 0 && !vm.submitted) {
        vm.gridKeys.forEach(function (g) {
          var grid = vm.grids[g];
          vm.form[grid.position].readonly = true;
          var astop = parseInt(grid.autostop, 0);
          if (astop > -1) {
            var astopWatch = $scope.$watch("vm.surveymodel['" + grid.key + "']", function (n) {
              if (n && n.length > astop - 1 && parseInt(n[astop - 1], 0) === astop) {
                grid.autostopped = true;
                grid.manualstopped = false;
                grid.lastRead = parseInt(n[astop - 1], 0);
                timerUtils.finish(false, grid.lastRead, true);
                astopWatch();
              }
            }, true);
            watches.push(astopWatch);
          } else if (grid.autostop === -1) {
            grid.lastRead = grid.titleMap.length;
          }
        });
      }
    }

    function checkRevisited(response, survey) {
      return checkExistingResponse(response, survey) ? true : false;
    }

    function checkAutostop(value) {
      var model = this;
      var answers = Object.keys(model).filter(function (k) { return k.match(/_\d$/); }).map(function (k) { return model[k]; });
      var astop = answers.slice(0, value).filter(function (d) { return d !== "1" && d !== "-999"; });
      if (astop.length === value) {
        $window.alert(i18nFilter('AUTOSTOP_TRIGGERED'));
        model[vm.survey.subtask.code+"_Auto_Stop"] = true;
        submit(true);
      }
      return false;
    }

    function checkExistingResponse(response, survey) {
      if (response.hasOwnProperty("surveys") && response.surveys[survey.id].sections.hasOwnProperty(survey.subtask.code)) {
        return response.surveys[survey.id].sections[survey.subtask.code];
      } else if (response.hasOwnProperty("sections") && response.sections.hasOwnProperty(survey.subtask.code)) {
        return response.sections[survey.subtask.code];
      }
    }

    function submit(skip_validation) {
      if (skip_validation) {
        appendResponse();
        return surveyUtils.submit(vm.response, survey.section_idx, !vm.response.response_info.has_consent);
      }
      var check = validations.validate(vm.surveymodel, vm.form, vm.schema, vm.grids);
      if (check.length > 0) {
        var mistakes = check.filter(function (d) { return d.valid !== "NO_CONSENT" });
        var consent = check.filter(function (d) { return d.valid === "NO_CONSENT" });
        // warn about validations, handle no consent;
        if (mistakes.length > 0) {
          var reasons = mistakes.reduce(function (p,n) {
            if (p.hasOwnProperty(n.valid)) {
              p[n.valid].push(n.key);
            } else {
              p[n.valid] = [n.key];
            }
            return p;
          }, {});
          var msg = Object.keys(reasons).map(function (key) {
            return [i18nFilter(key), reasons[key].join(", ")].join("\n");
          }).join("\n");
          $window.alert(msg);
          return;
        }
        if (consent.length > 0 && !$window.confirm(i18nFilter('ARE_YOU_SURE_CONSENT'))) {
          return;
        } else if (consent.length > 0) {
          vm.response.response_info.has_consent = false;
        }
      }
      if (vm.gridKeys.length > 0) {
        scoreGrids();
      }
      appendResponse();
      return surveyUtils.submit(vm.response, survey.section_idx, !vm.response.response_info.has_consent);
    }

    function appendResponse() {
      var endTime = new Date();
      var duration = endTime - vm.startTime;
      vm.surveymodel.$time = {
        start: vm.startTime.toString(),
        end: endTime.toString(),
        duration: duration
      };
      if (vm.isFamily) {
        vm.response.surveys[survey.id].sections[survey.subtask.code] = angular.copy(vm.surveymodel);
      } else {
        vm.response.sections[survey.subtask.code] = angular.copy(vm.surveymodel);
      }
      delete vm.response.progress;
    }

    function scoreGrids() {
      vm.gridKeys.forEach(function (g) {
        var grid = vm.grids[g];
        var key = vm.surveymodel.hasOwnProperty(grid.name) ? grid.name : grid.name+"_grid";

        vm.surveymodel[key+"_Attempted"] = grid.lastRead;
        vm.surveymodel[key+"_Autostopped"] = grid.autostopped;
        vm.surveymodel[key+"_Manual_Stop"] = grid.manualstopped;
        vm.surveymodel[key+"_Time_Elapsed"] = parseInt(grid.timer, 0) - grid.timeRemaining;
        vm.surveymodel[key+"_Full_Grid"] = grid.titleMap.map(function (d) {return d.name});
        vm.surveymodel[key+"_Incorrect_Grid"] = grid.titleMap.filter(function (d) {
          return vm.surveymodel[grid.title].indexOf(d.value) > -1;
        }).map(function (d) { return d.name});
        vm.surveymodel[key+"_Incorrect_Index"] = angular.copy(vm.surveymodel[key]);
        vm.surveymodel[key+"_Incorrect_Count"] = vm.surveymodel[grid.title].length;
      });
    }

  }
}())
