const shell = require('shelljs');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const utils = require('./mtl').Utils;
const debugList = [{
    type: 'list',
    message: '请选择项目平台：1、iOS；2、Android ；3、WX , 用上下箭头选择平台:',
    name: 'platform',
    choices: [
        "iOS",
        "android",
        "WX"
    ],
    filter: function (val) { // 使用filter将回答变为小写
        return val.toLowerCase();
    }
  }];
var start = function (platform) {
    if(!utils.isProject()) {
        return utils.reportError("不是MTL工程目录")
    }
    let plat = utils.checkPlatform(platform);
    if(platform==undefined || plat=="error"){
        inquirer.prompt(debugList).then(answers => {
        console.log('选用平台：'+answers.platform); // 返回的结果
        
        console.log("开始启动" + answers.platform + "...");
        switch(answers.platform) {
            case utils.Platform.IOS:
                return startIOS();
            case utils.Platform.ANDROID:
                return startAndroid();
            case utils.Platform.WEIXIN:
                return startWX();
            case utils.Platform.E_APP:
                return utils.ERROR;
        }
        });
    }else{
        console.log("开始启动" + plat + "...");
        switch(plat) {
            case utils.Platform.IOS:
                return startIOS();
            case utils.Platform.ANDROID:
                return startAndroid();
            case utils.Platform.WEIXIN:
                return startWX();
            case utils.Platform.E_APP:
                return utils.ERROR;
        }
    } 
    return utils.SUCCESS;
}

function startIOS() {
    console.log("准备开始生成iOS工程...");
    let path = getPathByPlatform(utils.Platform.IOS);
    let objPath = "./" + path +"/";
    copyProjectToOutput(objPath,utils.Platform.IOS);
    
    shell.exec("open \"/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/\"");
    let debugApp = "./" + path + "/../debug.app";
    // if(!fs.existsSync(debugApp)) {
        console.log("开始安装调试应用");
        let cmd = "cp -rf "+debugPath+"debug.app " + debugApp;
        shell.exec(cmd);
        console.log("debugApp:"+debugApp);
        let cmdInstallApp = "xcrun simctl install booted " + debugApp;
        console.log("cmdInstallApp:"+cmdInstallApp);
        shell.exec(cmdInstallApp);
    // }
    console.log("开始运行调试应用");
    shell.exec("xcrun simctl launch booted \"com.yonyou.mtl.debugger\"")

    let appJs = createAppJsFile(path);
    if(fs.exists(appJs, function(exists) {
        if(!exists) {
            return utils.reportError("没有找到app.js");
        }
        startNode(appJs);
        
    }))
    return utils.SUCCESS;
}

// xcrun instruments -w 'iPhone 6 Plus'

// 在已经启动好的模拟器中安装应用：

// xcrun simctl install booted Calculator.app （这里要特别注意，是app，不是ipa 安装时需要提供的是APP的文件路径）

// 例如：xcrun simctl install booted /Users/xiexuemei/Downloads/DingTalk.app

const debugPath = __dirname + "/../res/";

function startAndroid() {
    let path = getPathByPlatform(utils.Platform.ANDROID);
    let objPath = "./" + path +"/";
    console.log(objPath);
    copyProjectToOutput(objPath,utils.Platform.ANDROID);
    let debugApk = "./" + path + "/../debug.apk";
    console.log(debugApk);
    if(!fs.existsSync(debugApk)) {
        let cmd = "cp -rf "+debugPath+"debug.apk " + debugApk;
        console.log("准备安装debug.apk");
        shell.exec(cmd);
        shell.exec("adb install -r " + debugApk);
        shell.exec(cmdRunDebugApk);
        console.log("正在为第一次安装准备文件");
        setTimeout(function() {
            runDebugAndroid(objPath);
        },5000);
    } else {
        runDebugAndroid(objPath);
    }
}

const cmdRunDebugApk = "adb shell am start -S com.yyiuap.summer.preview/com.yyuap.summer.core2.SummerWelcomeActivity";
const adrAppPath="/sdcard/Android/data/com.yyiuap.summer.preview/preview_android/";
// var cmd = "adb install -r " + debugApk;
//     shell.exec(cmd);
function runDebugAndroid(objPath) {
    //运行apk
    var cmd = "adb push " + objPath + "* " + adrAppPath + "www/";
    shell.exec(cmd);
    //console.log("push->" + cmd);
    cmd = "adb push " + objPath + "/project.json " + adrAppPath;
    shell.exec(cmd);
    //console.log("push->" + cmd);
    shell.exec(cmdRunDebugApk);
}

//开始调试微信Web小程序
function startWX() {
    console.log("准备开始生成微信工程...");
    let path = getPathByPlatform(utils.Platform.WEIXIN);
    let objPath = "./" + path +"/";
    let wxproj = objPath + "../proj/";
    if(!fs.existsSync(wxproj)) {
        shell.exec("mkdir -p " + wxproj);
        console.log("mkdir -p " + wxproj);
    }
    // 拷贝 添加页面到 wx/proj  目录下
    let cmd = "cp -rf " + __dirname + "/../res/debug.wx/ " + wxproj;
    shell.exec(cmd); //复制wx测试工程
    let projPath = "output/debug/" + utils.Platform.WEIXIN + "/proj/";
    fs.ensureDirSync(projPath);
    if(fs.existsSync("./wx/")) {
        shell.exec("cp -rf ./wx/* " + projPath); //复制wx mdd页面到工程
    }
    
   


    copyProjectToOutput(objPath,utils.Platform.WEIXIN);
    let appJs = createAppJsFile(path);
    // console.log(appJs);
    if(fs.exists(appJs, function(exists) {
        if(!exists) {
            return utils.reportError("没有找到app.js");
        }
        startNode(appJs);
    }))
    return utils.SUCCESS;
}

function getPathByPlatform(platform) {
    return "output/debug/" + platform + "/app";
}

function copyProjectToOutput(objPath, platform) {
    //开始复制文件
    shell.exec("mkdir -p " + objPath); //创建输出目录
    shell.exec("cp -rf ./app/* " + objPath);
    let pltPath = "./" + platform + "/";
    if(fs.existsSync(pltPath)) {
        console.log("cp -rf "+pltPath+"* " + objPath);
        shell.exec("cp -rf "+pltPath+"* " + objPath);
    }
    shell.exec("cp -rf ./project.json " + objPath);
}

function startNode(appJs) {
    console.log("开始启动node");
    shell.exec("npm --save install express")
    shell.exec("node " + appJs);
}

function createAppJsFile(path) {
    let appJs = "./" + path+"/app-node.js";
    if(!fs.existsSync(appJs)) {
        //创建appJs
        console.log("正在为第一次启动作准备……");
        console.log(appJs);
        var content = "const express = require('express');\r";
        content+="const app = express();\r";
        content+="app.use(express.static('"+ path +"'));\r";
        content+="app.listen(3000, () => console.log('Debug the App listening on port 3000!'));";
        fs.writeFileSync(appJs,content);
        console.log("app-node.js创建完成");
    }
    return appJs;
}


exports.start = start