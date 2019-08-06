const shell = require('shelljs');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const utils = require('./mtl').Utils;
const xml2js = require('xml2js');
const configFile = require('./config');
const os = require("os");
var unzip = require("unzip-stream");
const Configstore = require('configstore');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);

const PORT = 3000; // long-running process running on this, e.g. a web-server.
const { kill } = require("cross-port-killer");
// var crypto = require('crypto');
// var md5 = crypto.createHash('md5');
const chokidar = require('chokidar');
const { spawn } = require('child_process');
const debugList = [{
    type: 'list',
    message: '请选择项目平台：1、iOS；2、Android ；3、WX ;4、DD, 用上下箭头选择平台:',
    name: 'platform',
    choices: [
        "iOS",
        "android",
        "WX",
        "DD"
    ],
    filter: function (val) { // 使用filter将回答变为小写
        return val.toLowerCase();
    }
}];
var start = function (platform) {

    if (!utils.isProject()) {
        return utils.reportError("不是MTL工程目录")
    }
    let plat = utils.checkPlatform(platform);
    if (utils.isError(plat)) {
        inquirer.prompt(debugList).then(answers => {
            beginDebug(answers.platform);
        });
    } else {
        beginDebug(plat);
    }
    return utils.SUCCESS;
}

//调试代码的正式入口
function beginDebug(plat) {
    console.log('选用平台：' + plat);
    //utils.copyHosts("debug");
    switch (plat) {
        case utils.Platform.IOS:
            return startIOS();
        case utils.Platform.ANDROID:
            return startAndroid();
        case utils.Platform.WEIXIN:
            return startWX();
        case utils.Platform.DingDing:
            return startDD();
    }
    utils.reportError("不支持的平台 - " + plat);
}


function chokidarWatch() {

    let dir = shell.pwd() + "/app/";
    // Initialize watcher.
    const watcher = chokidar.watch(dir, {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    // Something to use when events are received.
    const log = console.log.bind(console);
    // Add event listeners.

    watcher
        .on('add', function (path) {
            // log('File', path, 'has been added');

        })
        .on('addDir', function (path) {
            // log('Directory', path, 'has been added'); 

        })
        .on('change', function (path) {
            log('File', path, 'has been changed');
            let pwd = shell.pwd().split(path.sep).join('/');
            // let end = path.lastIndexOf("/", path.length - 1);
            let start = path.indexOf("/app/");
            console.log("文件目录起始位置：" + start);
            // console.log("文件目录结束位置：" + end);
            let relativeFileDir = path.substring(start);
            console.log("目的修改文件的相对文件路径：" + relativeFileDir);
            if (fs.existsSync(shell.pwd() + "/output/wx/debug/proj/project.config.json")) {
                // copyAndDebugWeixin("false");
                let absoluteFileDir = pwd + "/output/wx/debug" + relativeFileDir;
                console.log("wx目的修改文件的绝对文件路径：" + absoluteFileDir);
                fs.copySync(path, absoluteFileDir);

            }
            if (fs.existsSync(shell.pwd() + "/output/ios/debug/debug.app")) {
                copyAndInstallDebugIOS("false");
                let absoluteFileDir = pwd + "/output/ios/debug" + relativeFileDir;
                console.log("ios目的修改文件的绝对文件路径：" + absoluteFileDir);
                fs.copySync(path, absoluteFileDir);
            }
            if (fs.existsSync(shell.pwd() + "/output/android/debug/debug.apk")) {
                let absoluteFileDir = pwd + "/output/android/debug" + relativeFileDir;
                console.log("android目的修改文件的绝对文件路径：" + absoluteFileDir);
                fs.copySync(path, absoluteFileDir);
                // copyAndInstallDebugAndroid("false");
            }
            if (fs.existsSync(shell.pwd() + "/output/dd/debug/proj/app.js")) {
                let absoluteFileDir = pwd + "/output/dd/debug" + relativeFileDir;
                console.log("dd目的修改文件的绝对文件路径：" + absoluteFileDir);
                fs.copySync(path, absoluteFileDir);
                // copyAndDebugDD("false");
            }

        })

    const watcherProjectJson = chokidar.watch(shell.pwd() + "/project.json", {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    watcherProjectJson
        .on('add', function (path) {
            // log('File', path, 'has been added');

        })
        .on('addDir', function (path) {
            // log('Directory', path, 'has been added'); 

        })
        .on('change', function (path) {
            log('File', path, 'has been changed');
            let pwd = shell.pwd().split(path.sep).join('/');
            if (fs.existsSync(shell.pwd() + "/output/wx/debug/proj/project.config.json")) {
                // copyAndDebugWeixin("false");
                let absoluteFileDir = pwd + "/output/wx/debug/app/project.json";
                console.log("wx目的修改文件的绝对文件路径：" + absoluteFileDir);
                fs.copySync(path, absoluteFileDir);
            }
            if (fs.existsSync(shell.pwd() + "/output/ios/debug/debug.app")) {
                // copyAndInstallDebugIOS("false");
                let absoluteFileDir = pwd + "/output/ios/debug/app/project.json";
                console.log("ios目的修改文件的绝对文件路径：" + absoluteFileDir);
                fs.copySync(path, absoluteFileDir);
            }
            if (fs.existsSync(shell.pwd() + "/output/android/debug/debug.apk")) {
                // copyAndInstallDebugAndroid("false");
                let absoluteFileDir = pwd + "/output/android/debug/app/project.json";
                console.log("android目的修改文件的绝对文件路径：" + absoluteFileDir);
                fs.copySync(path, absoluteFileDir);
            }
            if (fs.existsSync(shell.pwd() + "/output/dd/debug/proj/app.js")) {
                let absoluteFileDir = pwd + "/output/dd/debug/app/project.json";
                console.log("dd目的修改文件的绝对文件路径：" + absoluteFileDir);
                fs.copySync(path, absoluteFileDir);
                // copyAndDebugDD("false");
            }
            //  更新云端project.json 文件

            // zipFileAndUploadcloud(path,"true");
            // uploadFileToCloud(path,"true");
        })
}

function chokidarWatchOutputDebugDir(platform) {
    var dir = null;
    console.log("chokidarWatchOutputDebugDir_platform==" + platform);
    switch (platform) {
        case utils.Platform.IOS:
            dir = shell.pwd() + "/output/ios/debug/app/";
            break;
        case utils.Platform.ANDROID:
            dir = shell.pwd() + "/output/android/debug/app/";
            break;
        case utils.Platform.WEIXIN:
            dir = shell.pwd() + "/output/wx/debug/app/";
            break;
        case utils.Platform.DingDing:
            dir = shell.pwd() + "/output/dd/debug/app/";
            break;
    }


    // Initialize watcher.
    const watcher = chokidar.watch(dir, {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    // Something to use when events are received.
    const log = console.log.bind(console);
    // Add event listeners.

    watcher
        .on('add', function (path) {
            // log('File', path, 'has been added');

        })
        .on('addDir', function (path) {
            // log('Directory', path, 'has been added'); 

        })
        .on('change', function (path) {
            log('outputFile', path, 'has been changed');


        })

}


function updateIosPlistFile(plistDir) {

    var plist = require('simple-plist');

    // var data = plist.readFileSync(plistDir);
    var data = JSON.parse(JSON.stringify(plist.readFileSync(plistDir)));


    data.CFBundleIdentifier = "com.cscec3.mdmpush";
    console.log(" data.CFBundleIdentifier:" + data.CFBundleIdentifier);
    console.log("end:::::readFileSync data:" + JSON.stringify(data));

    // Write data to a plist file (synchronous)
    plist.writeFileSync(plistDir, data);
}
function startIOS() {
    if (os.platform() != "darwin") {
        console.log("ios debug调试程序必须在苹果电脑系统下运行！！！");
        return;
    }

    //  监听工程源码 ，给debug 实时更新
    chokidarWatch();
    // 启动debug 程序

    let pwd = shell.pwd().split(path.sep).join('/');
    //  第一次启动debug 开始下载debug 程序
    if (!fs.existsSync(pwd + "/iOSDebug/debug.app")) {

        if (conf.get('localResource') == "true") {
            fs.copySync(configFile.CONFIG_IOS_DEBUG_PATH , "./iOSDebug");
    
        } else {

            console.log("开始下载android调试程序,请稍后...");
            let debugLibs = require("../res/debug.json");
            shell.exec("git clone " + debugLibs.iOSDebug + " --progress ");
        }
    }
    copyAndInstallDebugIOS("true");
    // }

}

// xcrun instruments -w 'iPhone 6 Plus'

// 在已经启动好的模拟器中安装应用：

// xcrun simctl install booted Calculator.app （这里要特别注意，是app，不是ipa 安装时需要提供的是APP的文件路径）

// 例如：xcrun simctl install booted /Users/xiexuemei/Downloads/DingTalk.app

// const debugPath = __dirname + "/../res/";

function startAndroid() {
    let pwd = shell.pwd().split(path.sep).join('/');

    //  第一次启动debug 开始下载debug 程序
    if (!fs.existsSync(pwd + "/androidDebug/debug.apk")) {

        if (conf.get('localResource') == "true") {
            fs.copySync(configFile.CONFIG_ANDROID_DEBUG_PATH , "./androidDebug");
        } else {
            console.log("开始下载android调试程序,请稍后...");
            let debugLibs = require("../res/debug.json");
            shell.exec("git clone " + debugLibs.androidDebug + " --progress ");
        }
    }
    chokidarWatch();
    copyAndInstallDebugAndroid("true");
    // }
}

// const cmdRunDebugApk = "adb shell am start -S com.yyiuap.summer.preview/com.yyuap.summer.core2.SummerWelcomeActivity";
// const adrAppPath="/sdcard/Android/data/com.yyiuap.summer.preview/preview_android/";

const cmdRunDebugApk = "adb shell am start -S com.yonyou.mtlandroid.debug/com.yonyou.myapis.DebugActivity";
const adrAppPath = "/sdcard/Android/data/com.yonyou.mtlandroid/preview_android/";
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

function copyAndInstallDebugIOS(isStartNode) {
    let path = getPathByPlatform(utils.Platform.IOS);
    let objPath = "./" + path + "/";
    copyProjectToOutput(objPath, utils.Platform.IOS);

    var debugApp = "./" + path + "/../debug.app";

    if (!fs.existsSync(debugApp)) {
        let pwd = shell.pwd().split(path.sep).join('/');
        // let cloudDebugApkPath = pwd + "/output/android/debug/export/debug.apk";
        fs.copySync(pwd + "/iOSDebug/debug.app", debugApp);
        // fs.copySync(__dirname.split(path.sep).join('/') + '/../res/android/debug.apk', debugApk);
    }
    if (isStartNode == "true") {
        shell.exec("open \"/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/\"");
        // let debugApp = "./" + path + "/../debug.app";
        // if(!fs.existsSync(debugApp)) {
        console.log("开始安装调试应用");
        // let cmd = "cp -rf "+debugPath+"debug.app " + debugApp;
        // shell.exec(cmd);
        let cmdInstallApp = "xcrun simctl install booted " + debugApp;
        shell.exec(cmdInstallApp);
        // }
        console.log("开始运行调试应用");
        shell.exec("xcrun simctl launch booted \"com.cscec3.mdmpush\"");
        // zipAndUploadcloud("ios");
        let appJs = createAppJsFile(path);
        if (fs.exists(appJs, function (exists) {
            if (!exists) {
                return utils.reportError("没有找到app-node.js");
            }
            startNode(appJs);
        }));

    } else {
        console.log("请到iOS模拟器刷新进行调试");
    }

    return utils.SUCCESS;

}

function copyAndInstallDebugAndroid(isStartNode) {
    let path = getPathByPlatform(utils.Platform.ANDROID);
    let objPath = "./" + path + "/";

    copyProjectToOutput(objPath, utils.Platform.ANDROID);
    let debugApk = "./" + path + "/../debug.apk";

    if (!fs.existsSync(debugApk)) {
        let pwd = shell.pwd().split(path.sep).join('/');
  
        fs.copySync(pwd + "/androidDebug/debug.apk", debugApk);
    }
    console.log("开始安装debug 调试程序");
    //shell.exec(cmd);
    shell.exec("adb install -r " + debugApk);

    if (isStartNode == "true") {
        let appJs = createAppJsFile(path);
        if (fs.exists(appJs, function (exists) {
            if (!exists) {
                return utils.reportError("没有找到app-node.js");
            }
            startNode(appJs);

        }));

        setTimeout(function () {
            shell.exec(cmdRunDebugApk);
        }, 5000);
        // zipAndUploadcloud("android");
    } else {
        shell.exec(cmdRunDebugApk);
        console.log("请到android刷新进行调试");
    }
}

function copyAndDebugWeixin(isStartNode) {
    console.log("准备开始生成微信工程...");
    let path = getPathByPlatform(utils.Platform.WEIXIN);
    let objPath = "./" + path + "/";
    let wxproj = objPath + "../proj/";
    fs.ensureDirSync(objPath);
    fs.ensureDirSync(wxproj);

    // 拷贝 添加页面到 wx/proj  目录下
    // fs.copySync(__dirname.split(path.sep).join('/')+ '/../res/debug.wx/', wxproj);

    if (!fs.existsSync(wxproj + "/app.json")) {
        fs.copySync(__dirname.split(path.sep).join('/') + '/../res/debug.wx/', wxproj);

        console.log("WX proj 工程创建完毕！");
    } else {
        console.log("WX proj 工程已经存在！");
    }


    let projPath = "output/" + utils.Platform.WEIXIN + "/debug/proj/";
    fs.ensureDirSync(projPath);
    if (fs.existsSync("./wx/")) {
        //shell.exec("cp -rf ./wx/* " + projPath); //复制wx mdd页面到工程
        fs.copySync('./wx/', projPath);
    }

    copyProjectToOutput(objPath, utils.Platform.WEIXIN);
    // if(isStartNode=="true"){
    //     zipAndUploadcloud("wx");
    // }else{
    //     console.log("请到微信小程序工具刷新进行调试");  
    // }

    if (isStartNode == "true") {
        let appJs = createAppJsFile(path);
        // console.log(appJs);
        if (fs.exists(appJs, function (exists) {
            if (!exists) {
                return utils.reportError("没有找到app.js");
            }
            startNode(appJs);
        }));
    } else {
        console.log("请到微信小程序工具刷新进行调试");
    }
    // 开始上传云端  10.3.13.7 服务器debugger

}


function copyAndDebugDD(isStartNode) {
    console.log("准备开始生成钉钉工程...");
    let path = getPathByPlatform(utils.Platform.DingDing);
    let objPath = "./" + path + "/";
    let ddproj = objPath + "../proj/";
    fs.ensureDirSync(objPath);
    fs.ensureDirSync(ddproj);

    // 拷贝 添加页面到 dd/proj  目录下


    if (!fs.existsSync(ddproj + "/app.json")) {
        fs.copySync(__dirname.split(path.sep).join('/') + '/../res/debug.dd/', ddproj);
        console.log("DD proj 工程创建完毕！");
    } else {
        console.log("DD proj 工程已经存在！");
    }

    let projPath = "output/" + utils.Platform.DingDing + "/debug/proj/";
    fs.ensureDirSync(projPath);
    if (fs.existsSync("./dd/")) {
        //复制dd 页面到工程
        fs.copySync('./dd/', projPath);
    }

    copyProjectToOutput(objPath, utils.Platform.DingDing);
    if (isStartNode == "true") {
        let appJs = createAppJsFile(path);
        // console.log(appJs);
        if (fs.exists(appJs, function (exists) {
            if (!exists) {
                return utils.reportError("没有找到app.js");
            }
            startNode(appJs);
        }));
        // zipAndUploadcloud("dd");

    } else {
        console.log("请到钉钉小程序工具刷新进行调试");
    }
}
function zipDir(platform) {
    var archiver = require('archiver');
    var output = fs.createWriteStream('app.zip');

    let archive = archiver('zip', {
        zlib: { level: 9 } // 设置压缩级别
    })

    // 存档警告
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.warn('stat故障和其他非阻塞错误')
        } else {
            throw err
        }
    })
    // listen for all archive data to be written 
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        uploadAppCloud(platform);
    });
    // 存档出错
    archive.on('error', function (err) {
        throw err
    })
    archive.pipe(output);

    // 从子目录追加文件并将其命名为“新子dir”在存档中


    var dir = null;
    switch (platform) {
        case utils.Platform.IOS:
            dir = "./output/ios/debug/app/";
            break;
        case utils.Platform.ANDROID:
            dir = "./output/android/debug/app/";
            break;
        case utils.Platform.WEIXIN:
            dir = "./output/wx/debug/app/";
            break;
        case utils.Platform.DingDing:
            dir = "./output/dd/debug/app/";
            break;
    }


    archive.directory(dir, 'app')
    archive.finalize();

}


function zipFile(filePath, isProjectJson) {
    var archiver = require('archiver');
    var output = fs.createWriteStream('file.zip');

    let archive = archiver('zip', {
        zlib: { level: 9 } // 设置压缩级别
    })

    // 存档警告
    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            console.warn('stat故障和其他非阻塞错误')
        } else {
            throw err
        }
    })
    // listen for all archive data to be written 
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');



        uploadFileToCloud(filePath, isProjectJson);

    });
    // 存档出错
    archive.on('error', function (err) {
        throw err
    })
    archive.pipe(output);

    let FileNameStart = filePath.lastIndexOf("/", filePath.length - 1);

    let FileName = filePath.substring(FileNameStart + 1);
    console.log("文件名称：" + FileName);

    archive.file(filePath, { name: FileName });

    archive.finalize();

}





function uploadFileToCloud(filePath, isProjectJson) {

    var FormData = require('form-data');
    var http = require('https');
    var form = new FormData();
    var file = "project.json";
    var result = JSON.parse(fs.readFileSync(file));
    var projectName = result.config.projectName;
    //   var startPage = result.config.startPage;
    var gitUrl = result.config.gitUrl;
    form.append('appId', projectName);
    // 处理文件目录
    if (isProjectJson == "true") {
        // 处理projectjson 文件

        form.append('path', "/app/");
    } else {
        // 工程源码文件
        let end = filePath.lastIndexOf("/", filePath.length - 1);
        let start = filePath.indexOf("/app/");
        console.log("文件目录起始位置：" + start);
        console.log("文件目录结束位置：" + end);
        let cloudFilePath = filePath.substring(start, end + 1);
        console.log("云端调试文件路径：" + cloudFilePath);
        form.append('path', cloudFilePath);
    }


    // form.append('startPage',projectName+"/app/"+startPage);
    form.append('file', fs.createReadStream("./file.zip"));  //大文件时读取不全。


    form.append("Content-Type", "application/x-www-form-urlencoded");
    var headers = form.getHeaders();//这个不能少
    var request = http.request({
        method: 'POST',
        hostname: 'mdoctor.yonyoucloud.com',
        path: '/mtldebugger/mtl/file/uploadZip',
        headers: headers
    }, (res) => {
        res.on('data', (buffer) => {
            console.log("data=" + buffer);
            // 删除压缩文件
            fs.removeSync('file.zip');
            //   var responseResult=JSON.parse(buffer);
            //   if(responseResult.msg="success"){

            //   }
        });
        res.on('end', () => {
            console.log("end");
        });
    });

    request.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });
    form.pipe(request);
}



function uploadAppCloud(platform) {
    //  var FormData = require('form-data');
    //   var https = require('https');
    //  var form = new FormData();
    // var file="project.json";
    // var result=JSON.parse(fs.readFileSync(file));
    // var projectName = result.config.projectName;
    // form.append('file', fs.createReadStream("./app.zip",{encoding:"utf8"}));
    // form.append('appid',projectName); 
    // form.append('path',"sdfsdaf");
    // var headers = form.getHeaders();//这个不能少
    // var httpsRequest = require('https-request');
    // var options = {
    //     hostname: 'mdoctor.yonyoucloud.com',
    //     path: '/mtldebugger/mtl/file/upload'
    // };
    // var request = httpsRequest(options, headers, form, function(err, data){
    //     if(!err){
    //         console.log(data);
    //     }else{
    //         console.log(err);
    //     }
    // });
    var FormData = require('form-data');
    var http = require('https');
    var form = new FormData();
    var file = "project.json";
    var result = JSON.parse(fs.readFileSync(file));
    var projectName = result.config.projectName;
    var startPage = result.config.startPage;
    var gitUrl = result.config.gitUrl;
    form.append('appId', projectName);
    form.append('path', projectName + "/app");
    // form.append('startPage',projectName+"/app/"+startPage);
    form.append('file', fs.createReadStream("./app.zip"));
    form.append("Content-Type", "application/x-www-form-urlencoded");
    var headers = form.getHeaders();//这个不能少
    var request = http.request({
        method: 'POST',
        hostname: 'mdoctor.yonyoucloud.com',
        path: '/mtldebugger/mtl/file/uploadApp',
        headers: headers
    }, (res) => {
        res.on('data', (buffer) => {
            console.log("data=" + buffer);

            var responseResult = JSON.parse(buffer);
            if (responseResult.msg = "success") {
                // 打开浏览器 ，形成二维码
                var openbrowser = require('openbrowser');
                openbrowser("https://mdoctor.yonyoucloud.com/mtldebugger/mtl/qr/build?code=https://mdoctor.yonyoucloud.com/debugger/" + projectName + "/app/" + startPage);
                // 开始监听output debug 工程
                // chokidarWatchOutputDebugDir(platform);
                // 删除压缩文件
                fs.removeSync('file.zip');
            }
        });
        res.on('end', () => {
            console.log("end");
        });
    });

    request.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });
    form.pipe(request);
}
function zipAndUploadcloud(selectedPlatform) {

    (async function () {
        try {
            await zipDir(selectedPlatform);
        } catch (e) {
            console.log(e)
        }
    })();
}


function zipFileAndUploadcloud(filePath, isProjectJson) {

    (async function () {
        try {
            await zipFile(filePath, isProjectJson);
        } catch (e) {
            console.log(e)
        }
    })();
}



function cloudBuildAndUnzip(selectedPlatform) {
    // 接口请求
    var FormData = require('form-data');
    var http = require('http');
    var form = new FormData();

    var file = "project.json";
    var result = JSON.parse(fs.readFileSync(file));
    var projectName = result.config.projectName;
    var gitUrl = result.config.gitUrl;

    form.append('userName', 'ump');
    form.append('buildType', selectedPlatform);
    // form.append('certName',certName); 
    form.append('certName', '');

    // form.append('request', fs.createReadStream("./test.zip"));//'request'是服务器接受的key
    form.append('projectName', projectName);
    form.append('gitUrl', gitUrl);
    form.append('gitBranch', '');
    form.append('isDebug', "true");
    var headers = form.getHeaders();//这个不能少
    // headers.Cookie = cookie;//自己的headers属性在这里追加
    var request = http.request({
        method: 'POST',
        host: configFile.CONFIG_BUILDSERVER_URL,
        port: configFile.CONFIG_BUILDSERVER_PORT,
        path: configFile.CONFIG_BUILDPROJECT_API,
        headers: headers
    }, (res) => {
        var outFile = selectedPlatform + 'Debug.zip'
        let ws = fs.createWriteStream(outFile, {
            highWaterMark: 1
        })

        res.on('data', (buffer) => {
            ws.write(buffer);
        });
        res.on('end', () => {

            //文件下载结束
            ws.end();
            if (selectedPlatform == 'android') {
                fs.exists("androidDebug.zip", function (exists) {
                    if (exists) {
                        // 删除已有的文件
                        fs.removeSync('./output/android/debug');
                        (async function () {
                            try {
                                await unzipSync('androidDebug.zip', './output/android/debug')
                                // 获取android 目录下的文件目录
                                let pwd = shell.pwd().split(path.sep).join('/');
                                let filePath = pwd + "/output/android/debug";
                                let filesDir = getFilesDir(filePath);
                                //  验证android目录文件
                                let len = filesDir.length;

                                let apkPath;
                                for (let i = 0; i < len; ++i) {

                                    if (filesDir[i].indexOf(".apk") >= 0) {
                                        apkPath = filesDir[i];
                                    }
                                }
                                if (apkPath != null) {
                                    let debugApkPath = filePath + '/export/debug.apk';
                                    fs.move(apkPath, debugApkPath, function (err) {
                                        if (err) return console.error(err)
                                        console.log('android 云端构建调试程序完成 🎉  🎉  🎉 ！');
                                        copyAndInstallDebugAndroid("true");
                                    });
                                } else {
                                    console.log('android 云端构建调试程序失败 😢 😢 😢 !');
                                }

                            } catch (e) {
                                console.log(e)
                            }
                        })();
                        fs.removeSync('androidDebug.zip');
                    }
                    if (!exists) {
                        console.log("android 云端构建调试程序失败 😢 😢 😢 !");
                    }
                })

            } else {
                fs.exists("iosDebug.zip", function (exists) {
                    if (exists) {
                        // 删除已有的文件
                        fs.removeSync('output/ios/debug');
                        (async function () {
                            try {
                                await unzipSync('iosDebug.zip', './output/ios/debug')
                                // 生成debug APP 程序
                                let pwd = shell.pwd().split(path.sep).join('/');
                                let projectDir = pwd + "/output/ios/debug/export";
                                updateIosPlistFile(projectDir + "/" + projectName + "/" + projectName + "-info.plist");
                                // 在npm 包res/ios目录中copy AppDelegate.m ViewController.m 到调试程序中 

                                fs.copySync(__dirname.split(path.sep).join('/') + '/../res/ios/', projectDir + "/" + projectName + "/Classes/");
                                // xcodebuild debug 工程
                                let workspaceDir = projectDir + "/" + projectName + ".xcworkspace";

                                let cmd = "xcodebuild -workspace " + workspaceDir + " -scheme " + projectName + " -sdk iphonesimulator12.2";
                                shell.exec(cmd);
                                let derivedDataDir = os.homedir() + "/Library/Developer/Xcode/DerivedData/";

                                // 获取DerivedData目录下的目录列表
                                let componentsList = [];
                                const files = fs.readdirSync(derivedDataDir);
                                files.forEach(function (item, index) {
                                    let stat = fs.lstatSync(derivedDataDir + item);
                                    if (stat.isDirectory() === true) {
                                        componentsList.push(item);
                                    }
                                })
                                //  获取iOS debug.app 目录
                                let len = componentsList.length;
                                var debugAppPath;
                                for (let i = 0; i < len; ++i) {

                                    if (componentsList[i].indexOf(projectName + "-") >= 0) {
                                        debugAppPath = derivedDataDir + componentsList[i] + "/Build/Products/Debug-iphonesimulator/" + projectName + ".app";
                                    }
                                }
                                // debug app  程序移动指定output 目录
                                if (debugAppPath != null) {
                                    let pwd = shell.pwd().split(path.sep).join('/');
                                    fs.move(debugAppPath, pwd + "/output/ios/debug/debug.app", function (err) {
                                        if (err) return console.error(err)
                                        // 执行 debug 程序
                                        copyAndInstallDebugIOS("true");
                                    });
                                } else {
                                    console.log('云端ios构建调试程序失败');
                                }

                            } catch (e) {
                                console.log(e)
                            }
                        })();
                        fs.removeSync('iosDebug.zip');

                    }
                    if (!exists) {
                        console.log("云端构建调试程序失败");
                    }
                })

            }

        });

    });

    request.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });
    form.pipe(request);
}

/**
* 格式化输出JSON对象，返回String
* @param {String} fileName 
* @param {String} mbDir 
*/
function unzipSync(fileName, mbDir) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(fileName).pipe(unzip.Extract({
            path: mbDir
        })).on('close', () => {
            console.log('stream close')
            resolve()
        }).on('error', (err) => {
            reject(err)
        })
    })
}

function getFilesDir(filePath) {
    // console.log('filePath:'+filePath);
    var join = require('path').join;
    let filesDir = [];
    function findFile(path) {
        let files = fs.readdirSync(path);
        files.forEach(function (item, index) {
            let fPath = join(path, item);
            let stat = fs.statSync(fPath);
            if (stat.isDirectory() === true) {
                findFile(fPath);
            }
            if (stat.isFile() === true) {
                filesDir.push(fPath);
            }
        });
    }
    findFile(filePath);
    //   console.log(filesDir);
    return filesDir;
}

function updateConfigFileToDebug() {
    // 修改project.json  
    var proj = JSON.parse(fs.readFileSync("./project.json").toString());
    // proj.config.appName ="快速预览";
    // proj.config.packageName="com.yyiuap.summer.preview";
    proj.config.debuggerEnable = "true";
    // proj.config.packageName ="com.yonyou.mtl.debugger";
    fs.writeFileSync("./project.json", formatJson(proj), { flag: 'w', encoding: 'utf-8', mode: '0666' });
    //修改./app/config.xml
    // let xmlFile = "./app/config.xml";
    // var builder = new xml2js.Builder();
    // var xml = builder.buildObject(proj);
    // fs.writeFileSync(xmlFile, xml, { flag: 'w', encoding: 'utf-8', mode: '0666' });
}

/**
 * MTL工程 提交远程仓库
 * 
 */
function commitAndPushConfigFile() {
    let pwd = shell.pwd().split(path.sep).join('/');
    console.log('调试程序源码正在整理中，请稍候 🚀 🚀 🚀 ...');
    if (!fs.existsSync(".git")) {
        return utils.reportError("未找到远程git仓库 ,请执行: mtl pushRemote 命令创建远程代码托管后，再进行debug。  ");
    }
    //first commit
    shell.exec("git add -A");
    shell.exec("git commit -m update  -q");
    shell.exec("git push");

    return utils.SUCCESS;

}



/**
 * 格式化输出JSON对象，返回String
 * @param {JSON} data 
 */
function formatJson(data) {
    let LN = "\r";
    let TAB = "\t";
    var rep = "~";
    var jsonStr = JSON.stringify(data, null, rep)
    var str = "";
    for (var i = 0; i < jsonStr.length; i++) {
        var text2 = jsonStr.charAt(i)
        if (i > 1) {
            var text = jsonStr.charAt(i - 1)
            if (rep != text && rep == text2) {
                str += LN
            }
        }
        str += text2;
    }
    jsonStr = "";
    for (var i = 0; i < str.length; i++) {
        var text = str.charAt(i);
        if (rep == text)
            jsonStr += TAB;
        else {
            jsonStr += text;
        }
        if (i == str.length - 2)
            jsonStr += LN
    }
    return jsonStr;
}

//开始调试微信Web小程序
function startWX() {
    // console.log("准备开始生成微信工程...");
    // let path = getPathByPlatform(utils.Platform.WEIXIN);
    // let objPath = "./" + path +"/";
    // let wxproj = objPath + "../proj/";
    // fs.ensureDirSync(objPath);
    // fs.ensureDirSync(wxproj);

    // // 拷贝 添加页面到 wx/proj  目录下
    // fs.copySync(__dirname.split(path.sep).join('/')+ '/../res/debug.wx/', wxproj);

    // let projPath = "output/" + utils.Platform.WEIXIN + "/debug/proj/";
    // fs.ensureDirSync(projPath);
    // if(fs.existsSync("./wx/")) {
    //     //shell.exec("cp -rf ./wx/* " + projPath); //复制wx mdd页面到工程
    //     fs.copySync('./wx/', projPath);
    // }

    // copyProjectToOutput(objPath,utils.Platform.WEIXIN);
    // let appJs = createAppJsFile(path);
    // // console.log(appJs);
    // if(fs.exists(appJs, function(exists) {
    //     if(!exists) {
    //         return utils.reportError("没有找到app.js");
    //     }
    //     startNode(appJs);
    // }))
    //  监听工程源码 ，给debug 实时更新
    chokidarWatch();
    copyAndDebugWeixin("true");
    return utils.SUCCESS;
}


//开始调试钉钉Web小程序
function startDD() {

    //  监听工程源码 ，给debug 实时更新
    chokidarWatch();
    copyAndDebugDD("true");
    return utils.SUCCESS;
}


function getPathByPlatform(platform) {
    return "output/" + platform + "/debug/app";
}

function copyProjectToOutput(objPath, platform) {
    //开始复制文件
    fs.copySync('./app/', objPath);
    let pltPath = "./" + platform + "/";
    if (fs.existsSync(pltPath)) {
        fs.copySync(pltPath, objPath);
    }

    fs.copySync('project.json', objPath + '/project.json');
}
var cp1;
async function startNode(appJs) {

    kill(PORT).then(pids => {
        console.log(pids);
        console.log("开始启动node");
        //shell.exec("npm --save install express")
        // shell.exec("node " + appJs);

        cp1 = spawn('node', [appJs], {
            cwd: process.cwd(),
            env: process.env,

            detached: true,
            silent: true
        });

        cp1.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        cp1.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        cp1.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    })

}

function createAppJsFile(path) {
    let appJs = "./" + path + "/app-node.js";
    if (!fs.existsSync(appJs)) {
        //创建appJs
        // console.log("正在为第一次启动作准备……");
        // console.log(appJs);
        var content = "const express = require('express');\r";
        content += "const app = express();\r";
        content += "app.use(express.static('" + path + "'));\r";
        content += "app.listen(3000, () => console.log('Debug the App listening on port 3000!'));";
        fs.writeFileSync(appJs, content);
        console.log("app-node.js创建完成");
    }
    return appJs;
}


exports.start = start