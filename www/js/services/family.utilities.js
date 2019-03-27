"use strict";

(function () {
  angular
    .module("egra")
    .service("familyUtils", utilities)

  utilities.$inject = ["$q", "ls", "pdb"];

  function utilities($q, ls, pdb) {
    var utils = {
      createFamily: createFamily,
      findNextSurvey: findNextSurvey,
      getSurveys: getSurveys,
      mapResponseSurveys: mapResponseSurveys,
    };
    return utils;

    function createFamily(family, schemas) {
      var obj = {
        used_random: [],
        random_uuids: [],
        random_uuids_shuffled: [],
        survey_uuids: [],
        iteration: family.survey_info.iteration
      }

      var fam = family.survey_info.surveys.reduce(function (p,n) {
        if (n.random) {
          p.survey_uuids.push("R");
          p.random_uuids.push(n.uuid);
          p.random_uuids_shuffled.push(n.uuid);
        } else {
          p.survey_uuids.push(n.uuid);
        }
        return p;
      }, obj);

      // if the family has random uuids
      if (fam.random_uuids.length > 0) {
        var random = schemas.filter(function (d) { return fam.random_uuids.indexOf(d._id) > -1;})
          .map(function (d) { return {uuid: d._id, name: d.survey_info.name }; });
        fam.random_uuids = angular.copy(random);
        fam.random_uuids_shuffled = shuffleArray(angular.copy(fam.random_uuids_shuffled));
      }
      return fam;
    }

    function findNextSurvey(family, prompt) {
      var idx = ls.get("family_survey_index");
      var rIdx = ls.get("family_random_index");
      if (idx >= family.survey_uuids.length) {
        return "app.finished";
      }
      var next = family.survey_uuids[idx];
      if (next === "R") {
        var n = prompt ? "app.picknext" : family.random_uuids_shuffled[rIdx];
        ls.set("family_random_index", rIdx+1);
        ls.set("family_survey_index", idx+1);
        return n;
      } else {
        ls.set("family_survey_index", idx+1);
        return next;
      }
    }

    function getSurveys(family) {
      var queries = family.survey_info.surveys.map(function (d) { return pdb.localSurveyDB.get(d.uuid); });
      return $q.all(queries);
    }

    function mapResponseSurveys(surveys) {
      return surveys.map(function (d) {return d.uuid;})
        .reduce(function (p, n) {
          p[n] = {response_info: {}, sections: {}};
          return p;
        }, {});
    }

    function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    }

  }
}())
