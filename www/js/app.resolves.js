"use strict";

(function(){
  angular
    .module("egra")
    .service("resolves", resolves);

  resolves.$inject = ["$q", "$stateParams", "ls", "pdb", "surveyUtils"];

  function resolves($q, $stateParams, ls, pdb, surveyUtils) {
    return {
      connection: connection,
      enumerator: enumerator,
      finished: finished,
      geo: geo,
      incomplete: incomplete,
      pouch: pouch,
      pupils: pupils,
      response: response,
      responses: responses,
      schools: schools,
      survey: survey,
      surveys: surveys,
    };

    function connection() {
      var cxn = angular.copy(ls.get("connection")) || {};
      return {
        url: cxn.url,
        code: cxn.code
      };
    }

    function enumerator() {
      var lastSet = ls.get("enumerator_info_last_set");
      if (lastSet) {
        var then = new Date(lastSet);
        var now = new Date();
        if (then.setHours(0,0,0,0) < now.setHours(0,0,0,0))  {
          return angular.copy(ls.set("enumerator", undefined));
        }
      }
      return angular.copy(ls.get("enumerator"));
    }

    function finished(id) {
      return response(id).then(function (res) {
        res.response_info.survey_finished = new Date().toString();
        return pdb.localResponseDB.put(res);
      }).then(function () {
        return response(id);
      });
    }

    function geo() {
      var lastSet = ls.get("geo_info_last_set");
      if (lastSet) {
        var then = new Date(lastSet);
        var now = new Date();
        if (then.setHours(0,0,0,0) < now.setHours(0,0,0,0))  {
          return angular.copy(ls.set("geo", undefined));
        }
      }
      return angular.copy(ls.get("geo"));
    }

    function incomplete() {
      return pdb.localResponseDB.query("responses/incomplete", {include_docs: true, reduce: false, descending: true}).then(function (res) {
        return res.rows.map(function (d) {return d.doc});
      });
    }

    function pouch() {
      return pdb.init();
    }

    function pupils() {
      return pdb.localSurveyDB.get("pupils").catch(function (err) { return {}; });
    }

    function response(id) {
      return pdb.localResponseDB.get(id);
    }

    function responses(offset) {
      var promises = [pdb.localResponseDB.query("responses/responses", {skip: offset || 0, limit: 10, include_docs: true, reduce: false, descending: true}), pdb.localResponseDB.query("responses/responses", {reduce: true})];
      return $q.all(promises).then(function (res){
        var lastSync = ls.get("responses_last_synced");
        var syncTime = !lastSync ? 0 : new Date(lastSync).getTime();
        res[0].unsynced_modifications  = res[1].rows.filter(function (d) { return d.value > syncTime }).length;
        res[0].rows.reverse();
        return res[0];
      });
    }

    function schools() {
      return pdb.localSurveyDB.get("schools").catch(function (err) { return {}; });
    }

    function survey(id, section) {
      return pdb.localSurveyDB.get(id).then(surveyUtils.renderPrep.bind(section)).catch(function (err) {debugger});
    }

    function surveys() {
      return pdb.localSurveyDB.query("surveys/surveys", {include_docs: true}).then(surveyUtils.mapSurveys);
    }

  }
}());
