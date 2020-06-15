const fse = require("fs-extra"); // fs-extra 扩展包
const mtldev = require("mtl-dev-sdk");
const utils = require("./m_util.js");
const inquirer = require("inquirer");
const shell = require("shelljs");
const promptList = [
  {
    type: "list",
    message: "请选择升级模式: promptUpgrade 代表的是提示升级 | forceUpgrade 代表的是强制升级 ",
    name: "upgradeType",
    choices: ["promptUpgrade", "forceUpgrade"],
    filter: function(val) {
      // 使用filter将回答变为小写
      return val;
    }
  }
];

/**
 * MTL工程 验证工程名称是否正确
 * @param {String} projectName
 *
 */

async function setUpgrade() {
 
  if (!utils.isMtlProject()) {
    return;
  }
  selectUpgradeType();
}
/**
 * 选择模板，生成配置文件
 */
function selectUpgradeType() {

  inquirer.prompt(promptList).then(answers => {
    utils.consoleLog(answers.upgradeType);
    setProjectConfig(answers.upgradeType);
  });
}

//根据升级模式设置工程配置文件
function setProjectConfig(upgradeType) {
  let projDir = shell.pwd().toString();
  let result = mtldev.setUpgradeApp( projDir,upgradeType);
  let code = result.code;
  if (code == 200) {
    utils.consoleLog(`更新完成APP升级配置!`);
  } else {
    utils.consoleLog(JSON.stringify(result));
  }
}

module.exports = {
  setUpgrade
};
