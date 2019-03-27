"use strict";

(function () {
	angular
		.module("app.translations", [])
    .filter("i18n", i18n)
		.constant("i18nTrans", {
			config: {
				EN: {
					language: "English",
					display: "English",
					style: "app-language-ltr",
					dateFormat: "MM/dd/yyyy hh:mm:ss a"
				},
				// AR: {
				// 	language: "Arabic",
				// 	display: "عربى",
				// 	style: "app-language-rtl",
				// 	dateFormat: "dd/MM/yyyy HH:mm:ss"
				// }
			},
			EN: {
				RESET_GRID_WARNING: "Resetting this grid will erase all answers. Are you sure you want to continue?",
				NO_GRADE: "No Grade",
				VIEW_INFO: "View Response Metadata",
				SUBMIT_BTN: "Next",
				GRID_AUTOSTOP_EXISTS: "Grid Auto Stop",
				INCOMPLETE_SUBTASK: "Incomplete Subtask",
				SKIPPED_GRID: "The following Grids need to be completed:",
				INCOMPLETE: "The following questions are blank:",
				INVALID_VALUE: "The following questions are invalid:",
				INVALID_NUMBER: "The following questions are outside the range:",
				END_TIMER: "Time is up.",
				GRID_AUTOSTOP: "Auto stop triggered. Please continue.",
				AUTOSTOP_TRIGGERED: "Auto stop triggered. Please continue.",
				GRID_LAST_READ: "Time is up. Please select the last item read.",
				TIMER_START: "Start",
				TIMER_RESET: "Reset",
				true: "TRUE",
				false: "FALSE",
				START_TIME: "Start Time",
				ARE_YOU_SURE_SKIP: "If you skip this task, you will NOT be able to complete it later. Are you sure you want to skip this task?",
				INCOMPLETE_QUESTIONS: "The following questions need to be answered:",
				LAST_UPDATED: "Last updated",
				NEXT_SUBTASK: "Next subtask",
				IN_PROGRESS: "*** RESUME ***",
				ARE_YOU_SURE_CONSENT: "Consent has not been granted. Is this correct?",
				ARE_YOU_SURE_RESUME: "Are you sure you want to resume this assessment?",
				PUPILS_MODAL: "Search Unique Codes",
				FIND_STUDENT: "Set Unique Code",
				EARLY_EXIT: "*** EARLY EXIT ***",
				RESPONSE_ID: "Response ID",
				SURVEY_NAME: "Survey",
				SURVEY_SUBMITTED: "Submitted",
				UNSYNCED_MODIFICATIONS: "Unsynced Changes",
				EXISTING_SURVEYS: "Incomplete Surveys",
				NEW_SURVEY: "New Survey",
				PAUSE_WARNING: "Pausing this survey will allow to resume from this point. Answers collected for this subtask will not be recorded. Are you sure you want to do this?",
				QUIT_WARNING: "Quitting this survey will omit it from data collection. Are you sure you want to do this?",
				GRADE: "Grade",
				RESUME_SURVEY: "Resume Survey",
				PICKNEXT_SURVEY: "Pick Next Survey",
				NEXT_SURVEY: "Next Survey:",
				SURVEY_FINISHED: "Survey Finished",
				THANK_YOU: "Thank you for your participation.",
				RETURN_HOME: "Return",
				SKIP_TASK: "Skip Task",
				NEXT_TASK: "Next Task",
				PREVIOUS_TASK: "Previous Task",
				LEAVE_SURVEY: "Pause Survey",
				QUIT_SURVEY: "Quit Survey",
				TIME_ELAPSED: "Subtask Time",
				SURVEY_INFO: "Survey Info",
				HINT: "Help",
				MYNA: "MSI EGRA",
				GENERATE_STUDENT_CODE: "Generate Unique Code",
				STUDENT_CODE: "Unique Code",
				HISTORY: "Response History",
				POST_RESPONSES: "Sync Responses",
				POSTING_RESPONSES: "Syncing Responses...",
				RESPONSES_LAST_POSTED: "Responses Last Synced:",
				RECENT_RESPONSES: "Responses",
				NO_ENTRIES: "No entries.",
				NEVER: "Never",
				RESPONSE_SYNCED_COUNT: "Responses Synced",
				RESPONSE_DEVICE_COUNT: "Responses on Device",
				SELECT_GRADE: "Select a grade:",
				CHOOSE_GRADE: "-- choose a grade --",
				SELECT_SURVEY: "Select a survey:",
				CHOOSE_SURVEY: "-- choose a survey --",
				SELECT_TRAINING: "Select a training type:",
				CHOOSE_TRAINING: "-- choose a training type --",
				TRAINING_ENTRY: "Training Entry",
				IRR_ENTRY: "IRR Entry",
				IRR_CODE: "IRR Unique Code",
				IRR_CODE_CONFIRM: "Confirm IRR Unique Code",
				START_SURVEY: "Start Survey",
				HOME_PAGE: "Home",
				CONNECTION_SETTINGS: "Connection Settings",
				ENUMERATOR_ID: "Enumerator ID",
				ENUMERATOR_NAME: "Enumerator Name",
				ENUMERATOR_MODAL: "Enumerator",
				SAVE: "Save",
				GEO_MODAL: "Location",
				GEO_SCHOOL_CODE: "School Code",
				GEO_SCHOOL_CODE_CONFIRM: "Confirm School Code",
				GEO_LATITUDE: "Latitude",
				GEO_LONGITUDE: "Longitude",
				GEO_FETCHING: "Fetching GPS location. This can take up to 15 seconds...",
				COHORT_INFO: "Cohort Info",
				TOGGLE_GEO_MODAL: "Update Location",
				TOGGLE_ENUMERATOR_MODAL: "Update Enumerator",
				TOGGLE_CONNECTION_SETTINGS: "Change Cohort",
				UPDATE_SURVEYS: "Update Surveys",
				UPDATING_SURVEYS: "Updating Surveys...",
				SURVEYS_LAST_SYNCED: "Surveys Last Updated:",
				SURVEYS_AVAILABLE: "Available Surveys",
				COHORT: "Cohort",
				COHORT_DOMAIN: "Domain",
				COHORT_CODE: "Cohort Code",
				VERSION: "App version",
				CONNECT: "Connect",
				NOT_FOUND: "Not found",
				LAT_LNG: "Lat/Lng",
				CANCEL: "Cancel"
			}
    });

  i18n.$inject = ["$rootScope", "i18nTrans", "ls"];
  function i18n($rootScope, i18nTrans, ls) {
    return function (key, language) {
      var lang = language || ls.get("app_language");
      try {
        var value = i18nTrans[lang][key] || key;
      } catch (err) {
        var value = key;
      }
      return value;
		};
  }
}());
