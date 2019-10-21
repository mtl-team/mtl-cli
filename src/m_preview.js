const mtldev = require("mtl-dev-sdk");
const utils = require("./m_util.js");
const inquirer = require("inquirer");

function start(platform) {
  if (!utils.isMtlProject()) {
    return;
  }
  if (platform) {
    utils.consoleLog(platform);
    return;
  }
  let preList = utils.platformList();

  inquirer.prompt(preList).then(answers => {
    utils.consoleLog("选用平台：" + answers.platform); // 返回的结果
    preview(mtldev.technologyStack());
  });
}

function preview(technologyStack) {
  utils.consoleLog(`technologyStack: ${technologyStack}`);
  utils.evalJs(`./script/preview/preview.js`);
}

module.exports = {
  start
};
