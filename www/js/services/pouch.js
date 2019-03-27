"use strict";

(function () {
	angular
		.module("egra")
		.service("pdb", pdbFn);

  // "dbInfo",
	pdbFn.$inject = ["$q", "$rootScope", "ls"];

	function pdbFn($q, $rootScope, ls) {
		var pdb = {
      init: init,
      resetDBs: resetDBs,
			setup: setup,
			getSurveys: getSurveys,
			postResponses: postResponses
		};
		return pdb;

		// /////////////////////////////

		function init() {
			var deferred = $q.defer();

			try {
				var creds = ls.get("connection");
				pdb.localSurveyDB = new PouchDB("surveyDB");
				pdb.localResponseDB = new PouchDB("responseDB");
				pdb.remoteSurveyDB = new PouchDB("https://" + creds.username + ":" + creds.pwd + "@" + creds.couch_url + "/" + creds.db_name + "_schemas");
				pdb.remoteResponseDB = new PouchDB("https://" + creds.username + ":" + creds.pwd + "@" + creds.couch_url + "/" + creds.db_name + "_responses");
				pdb.enabled = true;

				deferred.resolve(true);
			} catch (err) {
				deferred.resolve(false);
			}
			return deferred.promise;
		}

    function resetDBs() {
      return $q.all([pdb.localSurveyDB.destroy(), pdb.localResponseDB.destroy()]).catch(function (err) {  });
    }

		function setup() {
			return $q.all([getSurveys(), makeResponseViews(), makeSurveyViews()]).catch(function(err) {
				return err;
			});
		}

		function makeResponseViews() {
			var ddoc = {
				_id: "_design/responses",
				views: {
					"incomplete": {
						map: function (doc) {
							if (doc.hasOwnProperty("progress")) {
								emit(doc._id, 1);
							}
						}.toString()
					},
					"by-date": {
						map: function (doc) {
							if (doc.hasOwnProperty("response_info")) {
								var modDate = doc.response_info.survey_started.split(" ").slice(1, 4).join(" ");
								emit(modDate, 1);
							}
						}.toString()
					},
					"responses": {
						map: function (doc) {
							if (doc._id !== "_design/responses") {
								emit(doc._id, parseInt(doc.modified));
							}
						}.toString()
					}
				}
			};
			return pdb.localResponseDB.get(ddoc._id).then(function (res) {
				ddoc._rev = res._rev;
				return pdb.localResponseDB.put(ddoc);
			}).catch(function (err) {
				return pdb.localResponseDB.put(ddoc);
			});
		}

		function makeSurveyViews() {
			var ddoc = {
				_id: "_design/surveys",
				views: {
					"surveys": {
						map: function (doc) {
							if (doc.hasOwnProperty("doc_type") && (doc.doc_type === "schema-family" || doc.doc_type === "schema")) {
								emit(doc._id, 1);
							}
						}.toString()
					}
				}
			};
			return pdb.localSurveyDB.get(ddoc._id).then(function (res) {
				ddoc._rev = res._rev;
				return pdb.localSurveyDB.put(ddoc);
			}).catch(function (err) {
				return pdb.localSurveyDB.put(ddoc);
			});
		}

		function getSurveys() {
			return pdb.remoteSurveyDB.replicate.to(pdb.localSurveyDB, {
				timeout: 5000,
				retry: false
			}).on("complete", function (res) {
				ls.set("surveys_last_synced", res.end_time);
				return res;
			}).on("error", function (err) {
				console.log("ERROR", err);
				return err;
			});
		}

		function postResponses() {
			return pdb.localResponseDB.replicate.to(pdb.remoteResponseDB, {
				timeout: 5000,
				retry: false,
				filter: "_view",
				view: "responses/responses"
			}).on("complete", function (res) {
				ls.set("responses_last_synced", res.end_time);
				return res;
			}).on("error", function (err) {
				console.log("ERROR", err);
			});
		}

		// function fetchSpecial(type) {
		// 	return pdb.localSurveyDB.get(type).then(function (doc) {
		// 		return doc[type];
		// 	}).catch(function (err) {
		// 		console.log("ERROR", err);
		// 		return [];
		// 	});
		// }

		// function updateListSurveys() {
		// 	return pdb.localSurveyDB.allDocs({include_docs: true})
		// 		.then(function (res) {
		// 			return res.rows.map(function (d) {
		// 				d.doc.doc_type_nice = d.doc.doc_type === "schema" ? "Individual" : "Grouped";
		// 				return d.doc;
		// 			}).filter(function (d) {
		// 				return d.active;
		// 			}).sort(function (a, b) {
		// 				// alphabetize list, families on top
		// 				var cat1 = a.doc_type;
		// 				var cat2 = b.doc_type;
		// 				var name1 = a.survey_info.name;
		// 				var name2 = b.survey_info.name;
		// 				if (cat1 > cat2) return -1;
		// 				if (cat1 < cat2) return 1;
		// 				if (name1 < name2) return -1;
		// 				if (name1 > name2) return 1;
		// 				return 0;
		// 			});
		// 		}).catch(function (err) {
		// 			console.log("ERROR", err);
		// 		});
		// }

		// function updateResponseCounts() {
		// 	return pdb.localResponseDB.allDocs({}).then(function (res) {
		// 		return res.total_rows;
		// 	});
		// }
		//
		// function mapDoc(doc) {
		// 	return doc.doc;
		// }
	}
}());
