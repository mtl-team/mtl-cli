const mtldev = require("mtl-dev-sdk");
const utils = require("./m_util.js");
const inquirer = require("inquirer");

function start(platform) {
    if (!utils.isMtlProject()) {
        return;
    }
   
    if (platform) {
        utils.consoleLog(platform);
        debug(platform);
        return;
    }
    let preList = utils.platformList();

    inquirer.prompt(preList).then(answers => {
        utils.consoleLog("选用平台：" + answers.platform); // 返回的结果
        debug(answers.platform);
    });
}

function debug(platform) {
    if (mtldev.technologyStack() != "html") {
        let res = mtldev.compile(platform);
        utils.consoleLog(`编译完成 ${JSON.stringify(res)}`);
        return utils.consoleLog("请使用该平台对应的服务启动debug, npm run start \n mtl start ios/android 启动模拟器");
    }
    utils.consoleLog(`debug platform: ${platform}`);
    utils.evalJs(`./script/debug/${platform}.js`);
}

function startEmulator(platform){

    if(!utils.isMtlProject()){
        return
    }
    if(platform == "android"){
        utils.evalJs(`./script/util/startAndroidEmulator.js`);
        return
    }
    if(platform == "ios"){
        utils.evalJs(`./script/util/startiosEmulator.js`);
        return
    }
    return utils.consoleLog(`not platform: ${platform}`);
    
}

module.exports = {
    start,
    startEmulator
};
