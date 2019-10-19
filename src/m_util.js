const mtldev = require("mtl-dev-sdk");
const shell = require('shelljs');



function consoleLog(msg) {
  console.log(msg);
}
function isMtlProject(){

  let workspace = shell.pwd().toString();
  mtldev.initWorkspace(workspace);
  if(mtldev.technologyStack()){
    return true;
  }
  consoleLog(`The current path is not MTL-Project`);
  return false;
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

module.exports = {
    consoleLog,
    isMtlProject,
    isVerifyProjectName
};
