cordova.define("summer-plugin-apm.SummerAPM", function(require, exports, module) {
var cordova = require('cordova');

module.exports = {
	getPluginVersion: function(args, successCallback, errorCallback) {
		cordova.exec(successCallback, errorCallback, "SummerAPM", "getPluginVersion", args);
	},

	insertAction: function(args, successCallback, errorCallback) {
		var argsParam = args[1];
		if (typeof argsParam == "object") {
			args[1] = JSON.stringify(argsParam)
		}
		cordova.exec(successCallback, errorCallback, "SummerAPM", "insertAction", args);
	},

//两个参数
	insertActionIDWithParams: function(actionId, actionParams, successCallback, errorCallback) {
		
		var args = [
			actionId,
			JSON.stringify(argsParam)
		];

		cordova.exec(successCallback, errorCallback, "SummerAPM", "insertAction", args);
	}
};
});
