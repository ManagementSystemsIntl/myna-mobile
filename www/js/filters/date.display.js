"use strict";

(function () {
	angular
		.module("egra")
		.filter("dateDisplay", dateDisplay);

	dateDisplay.$inject = ["$filter", "ls", "i18nTrans"];

	function dateDisplay($filter, ls, i18nTrans) {
		return function (input, language) {
			var d = input;
			var lang = language || ls.get("app_language");
			try {
				var dateFormat = lang ? i18nTrans.config[lang].dateFormat : "MM/dd/yyyy hh:mm:ss a";
				d = new Date(input);
			} catch (err) { debugger }
			return d.getTime() ? $filter("date")(d, dateFormat) : input;
		};
	}
}());
