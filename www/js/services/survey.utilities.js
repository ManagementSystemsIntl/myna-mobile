"use strict";

(function () {
  angular
    .module("egra")
    .service("surveyUtils", utilities)

  utilities.$inject = ["$state", "familyUtils", "i18nFilter", "ls", "pdb", "version"];

  function utilities($state, familyUtils, i18nFilter, ls, pdb, version) {
    var utils = {
      findNextSection: findNextSection,
      init: init,
      mapSurveys: mapSurveys,
      renderPrep: renderPrep,
      resume: resume,
      saveAndNavigate: saveAndNavigate,
      start: start,
      submit: submit,
    };
    return utils;

    function init(info, enumerator, geo) {
    	var today = new Date();
    	var response = {
    		_id: today.getTime() + "",
    		doc_type: "response",
    		modified: today.getTime() + "",
    		response_info: {
    			app_version: version,
    			enumerator_id: enumerator.id,
    			enumerator_name: enumerator.name,
    			latitude: geo.latitude,
    			longitude: geo.longitude,
    			accuracy: geo.accuracy,
    			school_code: geo.school_code,
    			has_consent: true,
    			grade: info.grade,
    			training_entry: info.training_entry || false,
    			irr_entry: info.irr_entry || false,
    			survey_uuid: info.survey._id,
    			survey_name: info.survey.survey_info.name,
    			survey_iteration: info.survey.survey_info.iteration,
    			survey_started: today + "",
          student_unique_code: info.student_unique_code
    		}
    	}
    	if (info.training_entry) {
    		response.response_info.gold_standard = info.gold_standard;
    	}
    	if (info.irr_entry) {
    		response.response_info.irr_student_code = info.irr_student_code;
    		response.response_info.irr_student_code_confirm = info.irr_student_code_confirm;
    	}
      return response;
    }

    function start(response, survey) {
      ls.set("survey_subtask_order", 0);
      if (survey.doc_type === "schema-family") {
        response.surveys = familyUtils.mapResponseSurveys(survey.survey_info.surveys);
        return familyUtils.getSurveys(survey).then(function (schemas) {
          var family = setupFamily(survey, schemas);
          response.family = angular.copy(family);
          var prompt = response.response_info.training_entry || response.response_info.irr_entry;
          var nextSurvey = familyUtils.findNextSurvey(response.family, prompt);
          if (!prompt) {
            var last = family.random_uuids_shuffled.pop();
            family.random_uuids_shuffled.unshift(last);
          }
          if (nextSurvey === "app.picknext") {
            return saveAndNavigate(nextSurvey, response);
          }
          var nextSchema = schemas.filter(function (d) { return d._id === nextSurvey})[0];
          var nextSection = findNextSection(0, response.response_info.grade, nextSchema, true);
          var nextState = nextSurvey !== "app.picknext" && nextSurvey !== "app.finished" ? "app.survey" : nextSurvey;
          return saveAndNavigate(nextState, response, nextSurvey, nextSection);
        });
      }
      response.sections = {};
      var nextSection = findNextSection(0, response.response_info.grade, survey, false);
      var nextState = nextSection !== "app.finished" ? "app.survey" : nextSection;
      return saveAndNavigate(nextState, response, survey._id, nextSection);
    }

    function submit(response, section, exit, pause) {
      if (exit || pause) {
        if (exit) {
          delete response.family;
        }
        var state = exit ? "app.finished" : "app.home";
        return saveAndNavigate(state, response);
      }
      ls.set("survey_subtask_order", angular.copy(ls.get("survey_subtask_order")+1));
      if (response.hasOwnProperty("surveys")) {
        var family = ls.get("families")[response.response_info.survey_uuid];
        return pdb.localSurveyDB.get(response.response_info.survey_uuid).then(function (survey) {
          return familyUtils.getSurveys(survey).then(function (schemas) {
            var current_survey = ls.get("current_survey");
            var schema = schemas.filter(function (d) { return d._id === current_survey })[0];
            return navigateFamily(response, schema, schemas, section + 1, family);
          });
        });
      } else {
        return pdb.localSurveyDB.get(response.response_info.survey_uuid).then(function (survey) {
          var nextSection = findNextSection(section + 1, response.response_info.grade, survey, false);
          var nextState = nextSection !== "app.finished" ? "app.survey" : nextSection;
          return saveAndNavigate(nextState, response, survey._id, nextSection);
        });
      }
    }

    function resume(survey) {
      return $state.go(survey.progress.state, survey.progress.params);
    }

    function setupFamily(survey, schemas) {
      var families = ls.get("families") || {};
      var family;
      ls.set("current_family_id", survey._id);
      ls.set("family_survey_index", 0);
      ls.set("family_random_index", 0);
      if (!families.hasOwnProperty(survey._id) || families[survey._id].iteration !== survey.survey_info.iteration) {
        family = familyUtils.createFamily(survey, schemas);
        families[survey._id] = family;
        ls.set("families", families);
      } else {
        family = families[survey._id];
      }
      return family;
    }

    function navigateFamily(response, schema, schemas, section, family) {
      var info = response.response_info;
      var prompt = info.training_entry || info.irr_entry;
      var nextSection = findNextSection(section, info.grade, schema, true);
      if (nextSection !== "app.picknext" && nextSection !== "app.finished") {
        return saveAndNavigate("app.survey", response, schema._id, nextSection);
      } else {
        var nextSurvey = familyUtils.findNextSurvey(response.family, prompt);
        if (nextSurvey === "app.finished" || nextSurvey === "app.picknext") {
          return saveAndNavigate(nextSurvey, response);
        } else {
          var nextSchema = nextSurvey !== "app.picknext" && nextSurvey !== "app.finished" ?
            schemas.filter(function (d) { return d._id === nextSurvey})[0] : null;
          nextSection = findNextSection(0, info.grade, nextSchema, true);
          // var nextState = nextSurvey !== "app.picknext" && nextSurvey !== "app.finished" ? "app.survey" : nextSurvey;
          return saveAndNavigate("app.survey", response, nextSurvey, nextSection);
        }
      }
    }

    function saveAndNavigate(state, response, survey, section) {
      response.modified = new Date().getTime() + "";
      return pdb.localResponseDB.post(response).then(function (res) {
        ls.set("current_response", response._id);
        ls.set("current_survey", survey);
        return $state.go(state, {response_id: response._id, survey_id: survey, section_id: section});
      });
    }

    function findNextSection(idx, grade, survey, family) {

      if (idx >= survey.sections.length) {
        return family ? "app.picknext" : "app.finished";
      }
      var section = survey.sections[idx];
      var sectionGrades = section.config.grade.split(",");
      // return idx if grade included in section, otherwise check next section for grade
      return sectionIncludesGrade(sectionGrades, grade) ? idx : findNextSection(idx + 1, grade, survey, family);

      function sectionIncludesGrade(sectionGrades, grade) {
        return grade === "NO_GRADE" || sectionGrades.indexOf(grade) > -1 || sectionGrades.indexOf("NO_GRADE") > -1;
      }
    }

    function mapSurveys(res) {
      var surveys = res.rows.map(function (d) {
        d.doc.doc_type_nice = d.doc.doc_type === "schema" ? "Individual" : "Grouped";
        return d.doc;
      });
      // TODO: include grade on survey family surveys, so you don't have to do some weird faux join to get the grade
      var active = surveys.filter(filterActive).sort(sortSurveys).map(function (survey) {
        survey.survey_info.gold_standards = survey.survey_info.gold_standards ? survey.survey_info.gold_standards.split(",").map(mapGold) : [];

        if (survey.doc_type === "schema") {
          survey.survey_info.grade = survey.survey_info.grade.split(",");
          return survey;
        }
        var g = survey.survey_info.surveys.map(mapSurvey.bind(surveys)).join(",").split(",").reduce(reduceGrade, {});
        survey.survey_info.grade = Object.keys(g).map(function(k){
          return [k, g[k]];
        }).sort(function(a,b) {
          return b[1] - a[1];
        }).filter(function (d,i,a) {
          return d[1] >= a[0][1];
        }).map(function (d) { return d[0] });
        return survey;
      });
      var grades = active.map(function (survey) {
        return survey.survey_info.grade.join(",");
      }).join(",").split(",").filter(function(d,i,a){return a.indexOf(d) === i}).sort();
      return {
        active: active,
        grades: grades
      };
    }

    function filterActive(d) {
      return d.active;
    }

    function sortSurveys(a,b) {
      // alphabetize list, families on top
      var cat1 = a.doc_type;
      var cat2 = b.doc_type;
      var name1 = a.survey_info.name;
      var name2 = b.survey_info.name;
      if (cat1 > cat2) return -1;
      if (cat1 < cat2) return 1;
      if (name1 < name2) return -1;
      if (name1 > name2) return 1;
      return 0;
    }

    function mapGold(d) {
      return "Gold " + d;
    }

    function mapSurvey(s) {
      var schema = this.filter(function (d) { return d._id === s.uuid })[0];
      if (schema) {
        return schema.survey_info.grade;
      }
    }

    function reduceGrade(p,n) {
      if (p[n]) {
        p[n]++;
      } else {
        p[n] = 1;
      }
      return p;
    }

    function renderPrep(survey) {
      var section = parseInt(this, 0);
      var subtask = survey.sections[section];
      var translations = survey.translations.language;
      var form = parseTranslations(subtask.questions.form, translations);
      var schema = parseTranslations(subtask.questions.schema, translations);
      var direction = translations.survey_direction;

      var sectionResponse = Object.keys(schema.properties).reduce(function (p,n) {
        var b = schema.properties[n].type;
        var enumerable = schema.properties[n].hasOwnProperty("enum");
        p[n] = b === "array" ? [] : b === "integer" ? null : enumerable ? "-999" : "";
        return p;
      }, {});

      var timers = form.filter(function (d) { return d.htmlClass.match("timerName") }).map(function (d) {
        d.position = form.indexOf(d);
        d.render = false;
        var atts = d.htmlClass.split(" ");
        d.timer = atts.filter(function (t) { return t.match("timer-")})[0].split("-")[1];
        d.name = atts.filter(function (t) { return t.match("timerName-")})[0].split("-")[1];
        // d.key = [d.name, "timer"].join("_");
        return d;
      }).reduce(function (p,n) {
        p[n.name] = n;
        return p;
      }, {});

      var grids = form.filter(function (d) { return d.htmlClass.match("gridName") }).map(function (d) {
        d.position = form.indexOf(d);
        d.lastRead = -1;
        d.render = false;
        var atts = d.htmlClass.split(" ");
        d.timer = atts.filter(function (t) { return t.match("timer-")})[0].split("-")[1];
        d.name = atts.filter(function (t) { return t.match("gridName-")})[0].split("-")[1];
        // d.key = [d.name, "grid"].join("_");
        d.autostop = atts.filter(function (t) { return t.match("autostop-")})[0].split("-")[1];
        return d;
      }).reduce(function (p,n) {
        p[n.name] = n;
        return p;
      }, {});

      form.forEach(function (question) {
        if (question.hasOwnProperty("condition")) {
// <<<<<<< HEAD
          var condition = angular.copy(question.condition);
          var gridFinder = new RegExp(/(\$[^$]+\.)/, 'g');

          var matches = question.condition.match(gridFinder) ? question.condition.match(gridFinder).map(function (d) {
            var key = d.slice(1, -1);
            var start = d.slice(0, 1);
            var end = d.slice(-1);
            var mod = grids.hasOwnProperty(key.split(".")[0]) ? "vm.grids."+key+end : "vm.surveymodel."+key+end;
            return {orig: ["\\",start,key,"\\",end].join(""), mod: mod};
          }).forEach(function (m) {
            var mReg = new RegExp(m.orig, 'g');
            condition = condition.replace(mReg, m.mod);
          }) : null;
          condition = condition.replace(/\$/g, "vm.surveymodel.");
          question.condition = condition;
        }
        if (subtask.config.autostop >= 0) {
          question.onChange = "vm.checkAutostop("+subtask.config.autostop+")";
        }
        if (question.type === "submit") {
          question.title = i18nFilter('SUBMIT_BTN');
          question.fieldHtmlClass = 'btn-info';
        }
      });

      return {
        id: survey._id,
        info: survey.survey_info,
        direction: direction,
        survey: survey,
        subtask: subtask,
        section_idx: section,
        form: form,
        schema: schema,
        section_response: sectionResponse,
        grids: grids,
        timers: timers,
      };
    }

    function parseTranslations(item, translations) {
      // this regex will match all the keys from the translations, whole word only
      // used to substitute translation placeholders with the content they should have
      var translationKeys = Object.keys(translations);
      var keyRegex = new RegExp("\\b(" + translationKeys.join("|") + ")\\b", "g");

      return JSON.parse(JSON.stringify(item), function (k, v) {
        if (typeof v === "string") {
          var matched = v.match(keyRegex);
          if (matched) {
            for (var i = 0; i < matched.length; i++) {
              v = v.replace(matched[i], translations[matched[i]]);
            }
          }
        }
        return v;
      });
    }

  }
}())
