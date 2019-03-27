"use strict";

(function () {
	angular
		.module("egra")
		.service("rvUtils", rvUtils);

	rvUtils.$inject = ["$rootScope", "familyUtils", "pdb"];

	function rvUtils($rootScope, familyUtils, pdb) {
		var utils = {
			response: undefined,
			get: get,
			set: set,
			processSurvey: processSurvey
		};
    return utils;

		function set(response) {
			return processSurvey(response).then(function (res) {
				utils.response = response;
				$rootScope.$broadcast("update-modal-response", response);
			});
		}

		function get() {
			return utils.response;
		}

		function processSurvey(response) {
			return pdb.localSurveyDB.get(response.response_info.survey_uuid).then(function (survey) {
				if (survey.doc_type === "schema") {
					return format(response, survey);
				} else if (survey.doc_type === "schema-family") {
					return familyUtils.getSurveys(survey).then(function (surveys) {
						var responseSections = Object.keys(response.surveys).map(function (d) {
							return response.surveys[d];
						}).filter(function (d) {
							return Object.keys(d.response_info).length > 0;
						}).sort(function (a, b) {
							return parseInt(a.response_info.survey_order, 0) - parseInt(b.response_info.survey_order, 0);
						});
						response.surveys = responseSections.map(function (d) {
							var s = surveys.filter(function (s) { return s._id === d.response_info.uuid })[0];
							return format(d, s);
						});
						response.mapped = [].concat.apply([], response.surveys.map(function (d) {return d.mapped} ));
						response.mapped.forEach(function (m, i) { m.order = i });
						return response;
					});
				}
				return false;
			}).catch(function (err) {
				console.log(err);
			});
		}

		function format(response, survey) {
			var translations = survey.translations.language;
			response.direction = translations.survey_direction;
			response.mapped = survey.sections.map(function (section) {
				var responseSection = response.hasOwnProperty("sections") ? response.sections[section.code] : response.surveys;
				return renderMap(responseSection || {}, section, translations);
			});
			response.mapped.forEach(function (m, i) { m.order = i });
			return response;
		}

		function renderMap(response, section, translations) {
			var schema = parseTranslations(section.questions.schema, translations);
			var form = parseTranslations(section.questions.form, translations).filter(function (d) {
				return d.type !== "help" && d.type !== "submit";
			});
			section.renderer = response && Object.keys(response).length > 0 ? form.map(renderQuestion) : "incomplete";
			try {
				var autostopField = Object.keys(response).find(function (k) { return k.match("_Auto_Stop$") });
				var skippedField = Object.keys(response).find(function (k) { return k.match("_Skipped$") });
				if (response[autostopField]) {
					// section.renderer.unshift({p: "Task Auto-Stopped?", c: "Yes", r: true, hc: "", t: "autostop"})
				}
				if (response[skippedField]) {
					// section.renderer.unshift({p: "Skipped", c: "Yes", r: true, hc: "", t: "skipped"})
				}
			} catch (err) {
				//
			}
			return section;

			function renderQuestion(question) {
				var type;
				if (question.type === "checkboxes" && question.fieldHtmlClass === "grid-item") {
					type = "grid";
				} else if (question.key && question.key.match(/_consent/)) {
					type = "consent";
				} else {
					type = question.type;
				}

				var rawValue = response[question.key];
				var codedValue;
				if (rawValue) {
					codedValue = uncodeQuestion();
				} else {
					codedValue = false;
				}

				var prompt = "";
				if (type === "consent") {
					prompt = "Consent?";
				} else if (type !== "grid" && schema.properties[question.key]) {
					prompt = schema.properties[question.key].title;//.match(/"question_number">\d*/)[0].replace(/"question_number">/, "Question ");
				}

				return {r: rawValue, c: codedValue, p: prompt, t: type, hc: type === "grid" ? question.htmlClass : ""};

				function uncodeQuestion() {
					switch (type) {
					case "radios":
						return question.titleMap.find(matchRaw) ? question.titleMap.find(matchRaw).name : "-";
					case "checkboxes":
						return rawValue.map(function (d) {
							return question.titleMap.find(function (b) { return d === b.value;}).name;
						}).join(", ");
					case "grid":
						var gridKeys = Object.keys(response);
						var timeKey = gridKeys.filter(function (d) { return d.match(/_Time_Elapsed/);})[0];
						var asKey = gridKeys.filter(function (d) { return d.match(/_Autostopped/);})[0];
						var attempted = gridKeys.filter(function (d) { return d.match(/_Attempted/);})[0];
						var rawGrid = question.titleMap.map(function (d, i) {
							if (rawValue.indexOf(d.value) > -1) {
								d.incorrect = true;
							}
							// TODO: make this work so that it can render multiple grids per section
							if (attempted && response[attempted] && response[attempted] - 1 === i) {
								d.lastRead = true;
							}
							return d;
						});
						return {
							grid: rawGrid,
							time: response[timeKey],
							autostop: response[asKey]
						};
					default:
						return rawValue;
					}
				}

				function matchRaw(d) {
					return d.value === rawValue;
				}
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

	}
}());
