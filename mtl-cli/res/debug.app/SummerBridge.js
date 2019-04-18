// 定义 SummerBridge
function SummerBridge() {
    this.syncPrefix = "__SummerBridge__"; // WKWebView+Summer 文件中动态替换
    this.callSync = function(action, params) {
        if (typeof params == 'object') {
            params = JSON.stringify(params);
        }
        return prompt(this.syncPrefix + action, params);
    }
};
var summerBridge = new SummerBridge();

window.localStorage.getItem = function(key) {
    return summerBridge.callSync("SummerStorage.readConfigure", {
        "key": key
    });
};
window.localStorage.setItem = function(key, value) {
    return summerBridge.callSync("SummerStorage.writeConfigure", {
        "key": key,
        "value": value
    });
};
window.localStorage.removeItem = function(key) {
    return summerBridge.callSync("SummerStorage.writeConfigure", {
        "key": key,
        "value": null
    });
};
window.localStorage.clear = function() {
    return summerBridge.callSync("SummerStorage.clearConfigure", {});
};
