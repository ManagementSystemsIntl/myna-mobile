"use strict";

(function () {
  angular
    .module("egra")
    .service("validations", utilities);

  utilities.$inject = [];

  function utilities() {
    var utils = {
      validate: validate
    };
    return utils;

    function validate(response, form, schema, grids) {

      var obj = Object.keys(schema.properties).reduce(function (p, key) {
        var question = form.filter(function (d) { return d.key && d.key[0] === key })[0];
        if (question.hasOwnProperty("condition")) {
          var condition = angular.copy(question.condition)
            .replace(/vm\.grids\./g, "grids.")
            .replace(/vm\.surveymodel/g, "response");
          var passes = eval(condition);
          if (!passes) {
            p[key] = true;
            return p;
          }
        }
        if (key.match(/_consent$/)) {
          p[key] = validateConsent(response[key]);
        } else if (question.htmlClass && question.htmlClass.match(/^grid/)) {
          // var grid = grids[question.name];
          var grid = grids[key];
          p[key] = validateGrid(grid);
        } else if (schema.properties[key].type === "string" && schema.properties[key].hasOwnProperty("enum")) {
          p[key] = validateEnumString(response[key], schema.properties[key].enum);
        } else if (schema.properties[key].type === "array") {
          p[key] = validateEnumArray(response[key], schema.properties[key].items.enum);
        } else if (schema.properties[key].type === "integer") {
          p[key] = validateInteger(response[key], schema.properties[key]);
        } else if (schema.properties[key].type === "string") {
          p[key] = validateString(response[key]);
        }
        return p;
      }, {});
      return Object.keys(obj).map(function (key) {
        return {key: key, valid: obj[key]};
      }).filter(function (d) { return d.valid !== true });
    }

    function validateConsent(value) {
      return !value ? "NO_CONSENT" : true;
    }

    function validateGrid(grid) {
      return grid.attempted || "SKIPPED_GRID";
    }

    function validateEnumString(value, arr) {
      return arr.indexOf(value) > -1 || "INCOMPLETE";
    }

    function validateEnumArray(value, arr) {
      return value.length === 0 ? "INCOMPLETE" :
        value.map(function (v) { return arr.indexOf(v) }).indexOf(-1) === -1 || "INVALID_VALUE";
    }

    function validateString(value) {
      return value !== "" || "INCOMPLETE";
    }

    function validateInteger(value, props) {
      return parseInt(props.minimum) <= value && parseInt(props.maximum) >= value || "INVALID_NUMBER";
    }

  }
}())
