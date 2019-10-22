
const mtldev = require("mtl-dev-sdk");
const utils = require("./m_util.js");
const inquirer = require('inquirer');
const fse = require('fs-extra');



function build(platform) {
  if (!utils.isMtlProject()) {
    return;
  }
  if (platform == "android" || platform == "ios") {
    buildPlat(platform);
    return
  }
  let buildList = utils.platformList(true);
  inquirer.prompt(buildList).then(answers => {
    utils.consoleLog('选用平台：' + answers.platform); // 返回的结果
    buildPlat(answers.platform);
  });
}

function buildPlat(platform){

  if(platform ==  "ios"){
    utils.evalJs(`./script/build/mtl_ios.js`);
  }else{
    utils.evalJs(`./script/build/mtl_android.js`);
  }
}

function callback(res) {

  utils.consoleLog(JSON.stringify(res));

  if(res.code != 200){
    return
  }
  if (!res.data.app) {
    utils.consoleLog(fse.readFileSync(res.data.log, "utf-8")); //打印日志
  } else {
    utils.consoleLog(`app 生成目录: ${res.data.app} 安装到手机, `); //如果有app 输出APP
  }

}

module.exports = {
  build
}