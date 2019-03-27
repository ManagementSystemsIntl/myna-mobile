"use strict";

(function () {
	angular
		.module("egra")
		.service("connectionUtils", utilities);

// , "dbInfo", "ls", "nav", "pdb"

	utilities.$inject = ["$cordovaDevice", "$http", "$q", "$rootScope", "ls", "pdb", "version"];
	function utilities($cordovaDevice, $http, $q, $rootScope, ls, pdb, version) {
		var utils = {
			// cancel: cancelConnection,
			connect: connect,
			checkin: checkin,
			doCheck: doCheck,
			// connected: checkConnection(),
			// error: false
		};
		return utils;

    function connect(params) {
      return attemptConnection(params).then(function (res) {
        var connection = formatConnection(params, res.data);
        ls.set("connection", connection);
				$rootScope.$broadcast("connection:updated", connection);
        return pdb.resetDBs();
      }).then(function (res) {
				ls.reset();
				return pdb.init();
			}).then(function (res) {
				return res ? pdb.setup() : "i dunno";
			});
    }

    function attemptConnection(params) {
    	var device = getDeviceInfo();
    	var baseUrl = validateConnection(params.url, params.code);
    	if (!baseUrl) {
    		var deferred = $q.defer();
    		deferred.reject({error: "Already connected to group."});
    		return deferred.promise;
    	}
    	return $http({
    		method: "POST",
    		url: baseUrl + "/api/connect/" + params.code + "/device/" + device.serial,
    		data: device,
    		transformRequest: function (obj) {
    			var str = [];
    			for (var p in obj) {
    				if (obj.hasOwnProperty(p)) {
    					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    				}
    			}
    			return str.join("&");
    		},
    		headers: {"Content-Type": "application/x-www-form-urlencoded"}
    	});
    }

    function formatConnection(params, info) {
      return {
        db_name: info.db_name,
        pwd: info.pwd,
        username: info.username,
        group_name: info.group_name,
        group_id: info.survey_group_id,
				couch_url: info.db_address,
        url: params.url,
        code: params.code
      };
    }

		function doCheck() {
			if (!ls.get("connection")) return false;
			if (!ls.get("fb-checkin")) return true;
			var lastCheck = new Date(ls.get("fb-checkin")).getTime();
			var now = new Date().getTime();
			return (now - lastCheck)/1000/60/60 > 1;
		}

		function checkin() {
			var check = doCheck();
			if (!check) return;
			
			var device = getDeviceInfo();
			var connection = ls.get("connection");
			var baseUrl = validateConnection(connection.url, connection.code, true);

			return $http({
				method: "POST",
				url: baseUrl + "/api/connect/" + connection.code + "/device/" + device.serial,
				data: device,
				transformRequest: function (obj) {
					var str = [];
					for (var p in obj) {
						if (obj.hasOwnProperty(p)) {
							str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
						}
					}
					return str.join("&");
				},
				headers: {"Content-Type": "application/x-www-form-urlencoded"}
			}).then(function (res) {
				var checked = formatConnection(connection, res.data);
        ls.set("connection", checked);
				ls.set("fb-checkin", new Date());
				return checked;
			});
		}

		function validateConnection(url, code, checkin) {
      var existing = ls.get("connection") || {};
			if (url === existing.url && code === existing.code && !checkin) {
				return false;
			}
			var urlReg = new RegExp("(https://|http://|www.)", "g");
			var url = "https://" + url.replace(urlReg, "");
			if (url === "https://localhost:3000") {
				url = "http://localhost:3000";
			}
			return url;
		}

		function getDeviceInfo() {
			try {
				var info = $cordovaDevice.getDevice();
				info.app_version = version;
				return info;
			} catch (err) {
				return {
					serial: "99999999",
					app_version: version
				};
			}
		}

	}
}());
