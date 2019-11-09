const fse = require("fs-extra"); // fs-extra 扩展包
const mtldev = require("mtl-dev-sdk");
const utils = require("./m_util.js");
const inquirer = require("inquirer");
const shell = require("shelljs");
const join = require("path").join;

const promptList = [
  {
    type: "list",
    message: "请选择工程模板:",
    name: "name",
    choices: ["html", "react"],
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
  if (!utils.isVerifyProjectName(an)) {
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
  getProjectOptionByTl(tl, projects, an);
}
/**
 * 选择模板，生成配置文件
 */
function getProjectOptionByTl(tl, projects, an) {
  let options = {
    ...defConfig,
    projectName: an
  };
  if (tl) {
    downloadProject(tl, options);
    return;
  }
  let list = Object.keys(projects);
  utils.consoleLog(list);
  promptList[0].choices = list;
  inquirer.prompt(promptList).then(answers => {
    options.staticFilePath = answers.name == "react" ? "build/" : "app/";
    promptList[0].choices = Object.keys(projects[answers.name]);
    inquirer.prompt(promptList).then(answers => {
      utils.consoleLog(answers.name);
      downloadProject(answers.name, options);
    });
  });
}

//根据模板下载工程
function downloadProject(tl, options) {
  let workspace = shell.pwd().toString();
  mtldev.initWorkspace(workspace);
  let result = mtldev.downloadProjectByTemplate(workspace, tl, options);
  let code = result.code;
  if (code == 200) {
    utils.consoleLog(`工程创建完成： ${options.projectName}`);

    cpScript(join(workspace,options.projectName));
    utils.consoleLog("脚本更新完成");
    fse.removeSync(join(workspace,options.projectName,".git"));
  } else {
    utils.consoleLog(JSON.stringify(result));
  }
}

function cpScript(workspace){
  workspace = workspace || shell.pwd().toString();
  utils.consoleLog(`正在更新脚本`);
  fse.copySync(
    join(__dirname, `../res/script/${mtldev.technologyStack()}`),
    join(workspace, "script")
  );
 
}

function updateRegistry(){
  mtldev.updateRegistry(res =>{
    utils.consoleLog(res);
  });
}

const defConfig = {
  setStatusBar: {
    showStatusBar: true,
    isScreenEdge: false,
    color: "",
    isStatusBarDefault: true
  },
  serviceUrl: {
    uploadUrl:
      "https://mdoctor.yonyoucloud.com/mtldebugger/mtl/file/uploadToOSS",
    downloadUrl:
      "https://mdoctor.yonyoucloud.com/mtldebugger/mtl/stream/download"
  },
  userInfo: {
    userName: "ump",
    passWord: "",
    appCode: ""
  },
  debugServerAddress: "mdoctor.yonyoucloud.com",
  buildServerAddress: "mtlb.yyuap.com",
  buildServerAddressPort: "8050",
  IOSCerAndProvision: {
    name: "UAPMOBILE_DIS_299",
    pwd: ""
  },
  AndroidCer: {
    name: "ump",
    pwd: ""
  }
};

module.exports = {
  createApp,
  cpScript,
  updateRegistry
};
