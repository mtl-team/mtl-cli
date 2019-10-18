const fse = require("fs-extra"); // fs-extra 扩展包
const mtldev = require("mtl-dev-sdk");
const utils = require("./m_util.js");
const inquirer = require("inquirer");

const promptList = [
  {
    type: "list",
    message: "请选择工程模板:",
    name: "name",
    choices: ["empty", "ERP"],
    filter: function(val) {
      // 使用filter将回答变为小写
      return val.toLowerCase();
    }
  }
];

/**
 * MTL工程 验证工程名称是否正确
 * @param {String} projectName
 *
 */

async function createApp(an, tl) {
  if (!an) {
    return utils.consoleLog(" 必须录入工程名称 ，例如 ：mtl c demo");
  }
  if (isVerifyProjectName(an) == "false") {
    return utils.consoleLog("工程名称不能包含特殊字符，长度不能超过64位。");
  }
  if (fse.existsSync(an)) {
    return utils.consoleLog(
      "本地已存在- " + an + " -工程 ,同一目录下工程不能重名！！！"
    );
  }
  let projects = mtldev.getProjectInfos();
  if (!projects) {
    return utils.consoleLog("当前没有模板");
  }
  let list = Object.keys(projects);
  utils.consoleLog(list);
  promptList[0].choices = list;
  inquirer.prompt(promptList).then(answers => {
    promptList[0].choices = Object.keys(projects[answers.name]);
    inquirer.prompt(promptList).then(answers => {
      utils.consoleLog(answers.name);
    });
  });
}



function isVerifyProjectName(projectName) {
  var patrn = /^[A-Za-z0-9]{1,64}$/;
  if (patrn.exec(projectName) && projectName.length <= 64) {
    return "true";
  } else {
    return "false";
  }
}


module.exports = {
  createApp
};
