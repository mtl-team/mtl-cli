/**
 * 检测当前是否有新版本，给出提示升级mtl
 * @url http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/uba/ucf-cli-version.json
 */

const updateNotifier = require("update-notifier");
const pkg = require("../package.json");

function checkVersion() {
  const notifier = updateNotifier({ pkg, updateCheckInterval: 0 });

  if (notifier.update) {
    notifier.notify();
  }
}

module.exports = {
  checkVersion
};
