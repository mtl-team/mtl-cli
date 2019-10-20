
const mtldev = require("mtl-dev-sdk");
const utils = require("./m_util.js");
const inquirer = require('inquirer');
const fse = require('fs-extra');

const buildList = [{
  type: 'list',
  message: '请选择项目平台：1、iOS；2、Android , 用上下箭头选择平台:',
  name: 'platform',
  choices: [
    "iOS",
    "android"
  ],
  filter: function (val) { // 使用filter将回答变为小写
    return val.toLowerCase();
  }
}];

function build(platform) {
  if (!utils.isMtlProject()) {
    return;
  }
  if (platform == "android" || platform == "ios") {
    mtldev.build(platform, callback);
    return
  }
  inquirer.prompt(buildList).then(answers => {
    utils.consoleLog('选用平台：' + answers.platform); // 返回的结果
    mtldev.build(answers.platform, callback);
  });
}

function callback(res) {
  utils.consoleLog(JSON.stringify(res));
  if (!res.data.app) {
    utils.consoleLog(fse.readFileSync(res.data.log, "utf-8")); //打印日志
  } else {
    utils.consoleLog(`app 生成目录: ${res.data.app} 安装到手机, `); //如果有app 输出APP
  }

}

module.exports = {
  build
}