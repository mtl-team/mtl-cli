const mtldev = require("mtl-dev-sdk");
const shell = require("shelljs");
const fse = require("fs-extra");
const join = require("path").join;
const os = require("os");
const projectConfig = {
  workspace:""
}

function consoleLog(msg) {
  console.log(msg);
}
function isMtlProject() {
  projectConfig.workspace = shell.pwd().toString();
  consoleLog(`MTL-Project workspace ${projectConfig.workspace}`);
  mtldev.initWorkspace(projectConfig.workspace);
  if (mtldev.technologyStack()) {
    return true;
  }
  consoleLog(`The current path is not MTL-Project`);
  return false;
}
function getWorkSpace(){
  return projectConfig.workspace;
}

//校验工程名称
function isVerifyProjectName(projectName) {
  var patrn = /^[A-Za-z0-9]{1,64}$/;
  if (patrn.exec(projectName) && projectName.length <= 64) {
    return true;
  } else {
    return false;
  }
}

const _platformList = [
  {
    type: "list",
    message: "请选择项目平台：1、iOS；2、Android , 用上下箭头选择平台:",
    name: "platform",
    choices: [],
    filter: function(val) {
      // 使用filter将回答变为小写
      return val.toLowerCase();
    }
  }
];

function platformList(mobile) {
  mobile
    ? (_platformList[0].choices = ["iOS", "android"])
    : (_platformList[0].choices = ["iOS", "android", "wx", "dd", "upesn"]);
  return _platformList;
}
function platformListDebug(mobile) {
 
  return _platformList[0].choices = ["iOS", "android", "wx", "dd"];
}

function evalJs(jsfile){
  try {
    let _jsfile = join(getWorkSpace(), jsfile);
    let jsctx = fse.readFileSync(_jsfile, {
      encoding: "utf-8"
    });
    eval(jsctx);
  } catch (e) {
    consoleLog(`可以先执行 mtl cp-s 生成 script `);
    consoleLog(e);
  }
}
function isWindows() {
  let sysType = os.type();
  if (sysType === "Windows_NT") {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  consoleLog,
  isMtlProject,
  isVerifyProjectName,
  platformList,
  getWorkSpace,
  evalJs,
  platformListDebug,
  isWindows
};
