const shell = require('shelljs');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const utils = require('./mtl').Utils;
const xml2js = require('xml2js');
const configFile = require('./config');
const os = require("os");
var unzip = require("unzip-stream");


const PORT = 3000; // long-running process running on this, e.g. a web-server.
const { kill } = require("cross-port-killer");
// var crypto = require('crypto');
// var md5 = crypto.createHash('md5');
const chokidar = require('chokidar');
const { spawn } = require('child_process');
const iconv = require('iconv-lite');
const previewList = [{
    type: 'list',
    message: '请选择项目平台：1、iOS；2、Android ；3、WX ;4、DD ; 5、Upesn, 用上下箭头选择平台:',
    name: 'platform',
    choices: [
        "iOS",
        "android",
        "WX",
        "DD",
        "Upesn"
    ],
    filter: function (val) { // 使用filter将回答变为小写
        return val.toLowerCase();
    }
}];


/**
* 执行preview react 工程构建
*/
function previewReactProject() {
    
    try {
      shell.exec(" npm run  preview  > compile.log");
        // shell.exec("npm run build");
    } catch (e) {
        console.log(e);
        return utils.ERROR;
    }
    if (fs.existsSync("./compile.log")) {
        var compileFile = fs.readFileSync("./compile.log");
        if (compileFile.indexOf("Failed to compile") >= 0){
            console.log("预览编译报错 ，预览失败！！");
            return utils.ERROR;
        }
    }
    
    if (fs.existsSync("./project.json")) {
        fs.copySync('./project.json', "./build/project.json");
    }else{
        console.log("不是mtl工程 ，找不到 project.json 文件！！！！！！");
        return utils.ERROR;
    }
    return utils.SUCCESS;
}

/**
* 安装服务
*/
function installServeForReact() {
    if(shell.exec("npm ls serve -g").code !== 0){
        shell.exec("npm -g install serve");
    }
}

async function deployServerForBuild(projectType) {

    kill(5000).then(pids => {
        console.log(pids);
        console.log("开始启动 debug:server");
        // shell.exec("serve build ");
        let deployServer,
            option = {
                cwd: process.cwd(),
                env: process.env,
                shell: process.platform === 'win32',
                detached: true,
                silent: true
            };
        if(projectType === 'react'){
            deployServer = spawn('serve', ["build"], option);
            // deployServer = spawn('serve', ["dist"], option);
        }else if(projectType === 'mdf'){
            deployServer = spawn('npm run startMobileProxy', [], option);
        }

        deployServer.stdout.on('data', (data) => {
            console.log('stdout', iconv.decode(data, 'cp936'));
        });

        deployServer.stderr.on('data', (data) => {
            console.log('stderr', iconv.decode(data, 'cp936'));
        });

        deployServer.on('close', (code) => {
            console.log(`子进程使用代码 ${code} 退出 `);
        });

    })

}

var start = function (platform) {

    if (!utils.isProject()) {
        return utils.reportError("不是MTL工程目录")
    }

    let plat = utils.checkPlatform(platform);
    if (platform == undefined || plat == "error") {
        inquirer.prompt(previewList).then(answers => {
            beginPreview(answers.platform);
        });
    } else {
        beginPreview(plat);
    }
    return utils.SUCCESS;
}


function registerProxyHost() {
    var ipAddr = utils.getIP();
    console.log('ipAddress：' + ipAddr);
    // shell.exec("yarn build");
    var ipHost = [];
    ipHost.push("http://" + ipAddr + ":5000");
    var FormData = require('form-data');
    var http = require('https');

    var form = new FormData();
    form.append("host", JSON.stringify(ipHost));
    form.append("Content-Type", "application/x-www-form-urlencoded");
    var headers = form.getHeaders();//这个不能少
    var request = http.request({
        method: 'POST',
        hostname: configFile.CONFIG_PREVIEW_URL,
        path: configFile.CONFIG_PREVIEW_REGISTER_PROXY_HOST,
        headers: headers
    }, (res) => {
        res.on('data', (buffer) => {
            console.log("data=" + buffer);
            var responseResult = JSON.parse(buffer);
            if (responseResult.msg = "success") {
                var data = responseResult.data;
                console.log(Object.values(data)[0]);
                updatePackageJsonFileForPreview(Object.values(data)[0],'react');
                //工程生成预览静态资源
               var isCompileSuccess = previewReactProject();
               if(isCompileSuccess == utils.ERROR){
                   return;
               }
                // 下载serve 以及部署静态资源
                installServeForReact();
              
                deployServerForBuild('react');
                //生成二维码
                //  接口请求生成二维码图片 ，并下载到本地
                console.log("开始生成二维码图片");
                cloudCreateQRAndDownload("proxy", "https://mdoctor.yonyoucloud.com" + "/mtldebugger/solr/" + Object.values(data)[0] + "/" + "?projectJson=https://mdoctor.yonyoucloud.com/mtldebugger/solr/" + Object.values(data)[0] + "/project.json");
             }
        });
        res.on('end', () => {
            console.log("end");
        });
    });

    request.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        console.log("预览代理请求报错，代理失败！！！");
    });
    form.pipe(request);
}

function updatePackageJsonFileForPreview(hostAlias,projectType) {

    var packageFile = fs.readJSONSync("./package.json");
    //update
    if(projectType === 'react'){
        packageFile.scripts.preview = `cross-env PUBLIC_URL='/mtldebugger/solr/${hostAlias}' react-scripts build`;
        // packageFile.scripts.preview = `cross-env PUBLIC_URL='/mtldebugger/solr/${hostAlias}' npm run start`;
    }else if(projectType === 'mdf'){
        // packageFile.scripts.preview = `cross-env NODE_ENV=production SERVER_ENV=prod PUBLIC_URL='/mtldebugger/solr/${hostAlias}' babel-node --only=src,node_modules/@mdf bin/mobile/server/index.js`;
        packageFile.scripts.buildMobileServer4Proxy =  `cross-env BABEL_ENV=production NODE_ENV=production MDF_TARGET=mobile babel src -d bin --ignore client && echo '后端程序：编译完成'`;
        packageFile.scripts.buildMobileClient4Proxy =  `cross-env BABEL_ENV=production NODE_ENV=production PROXY_URL='https://mdoctor.yonyoucloud.com/mtldebugger/solr/${hostAlias}'  MDF_TARGET=mobile webpack --config webpack.config.js --colors --progress && echo '移动程序：编译完成'`;
        packageFile.scripts.build4Proxy =  "concurrently \"npm run buildMobileServer4Proxy\" \"npm run buildMobileClient4Proxy\"";
        packageFile.scripts.startMobileProxy =  `cross-env NODE_ENV=production SERVER_ENV=prod PROXY_URL='https://mdoctor.yonyoucloud.com/mtldebugger/solr/${hostAlias}' babel-node --only=src,node_modules/@mdf bin/mobile/server/index.js`;
    }
    fs.writeFileSync("./package.json", formatJson(packageFile), { flag: 'w', encoding: 'utf-8', mode: '0666' });
}
function formatJson(data) {
    return JSON.stringify(data, null, 4);
}

function beginProxyPreview() {

    if(!fs.existsSync("./node_modules/")){
        return utils.reportError("react 工程没有添加依赖包，请在工程更目录下执行 npm install  命令安装依赖！！！");
        //     

    }
    // 首先删除build 目录
    fs.removeSync("./build/");
    (async function () {
        try {
            await registerProxyHost();
        } catch (e) {
            console.log(e);
            console.log("preview 预览异常，已经退出介绍！！！");
            return;
        }
    })();
}

function beginPreview(plat) {
    //utils.copyHosts("preview");
    console.log('选用平台：' + plat);
    var proj = fs.readJsonSync("./project.json");
    let technologyStack = proj.config.technologyStack;
    console.log('technologyStack：' + proj.config.technologyStack);
    if (technologyStack == "react") {
        console.log('react工程。');
        beginProxyPreview();
    } else if(technologyStack === 'mdf' ){
        console.log('preview mdf');
        registerProxyHostPromise().then(proxyStr=>{
            console.log('rp proxyStr===',proxyStr);
            updatePackageJsonFileForPreview(proxyStr,'mdf');
            //工程生成预览静态资源
            buildProject('mdf');
            // 下载server 以及部署静态资源
            // installServeForReact();

            deployServerForBuild('mdf');
            //生成二维码
            //  接口请求生成二维码图片 ，并下载到本地
            console.log("开始生成二维码图片");
            cloudCreateQRAndDownload("proxy", "https://mdoctor.yonyoucloud.com" + "/mtldebugger/solr/" + proxyStr + "/" + "?projectJson=https://mdoctor.yonyoucloud.com/mtldebugger/solr/" + proxyStr + "/project.json");
        }).catch(err=>{
            console.log('rp err===',err);
        });
    }else {
        switch (plat) {
            case utils.Platform.IOS:
                return startIOS();
            case utils.Platform.ANDROID:
                return startAndroid();
            case utils.Platform.WEIXIN:
                return startWX();
            case utils.Platform.DingDing:
                return startDD();
            case utils.Platform.Upesn:
                return startUpesn();
        }
    }
}

function registerProxyHostPromise() {
    let ipAddr = utils.getIP();
    let ipHost = [];
    ipHost.push("http://" + ipAddr + ":5000");
    let rp = require('request-promise');
    let option = {
        method: 'POST',
        uri: 'https://' + configFile.CONFIG_PREVIEW_URL + configFile.CONFIG_PREVIEW_REGISTER_PROXY_HOST ,
        form: {
            host: JSON.stringify(ipHost)
        },
        json: true // Automatically stringifies the body to JSON
    }
    // return rp(option);
   return rp(option).then(res=>{
       console.log('registerProxyHostPromise res===',res);
        if(res.code === 0){
            let data = res.data;
            let proxyStr = Object.values(data)[0];
            return Promise.resolve(proxyStr)
        }else{
            return Promise.reject(res);
        }
    }).catch(err=>{
        return Promise.reject(err);
    });
}

function buildProject(projectType){
    if(projectType === 'mdf'){
        if (fs.existsSync("./project.json")) {
            fs.copySync('./project.json', "./build/project.json");
        }else{
            console.log("不是mtl工程 ，找不到 project.json 文件！！！！！！");
        }
        shell.exec("npm run build4Proxy");
    }
}

function chokidarWatch() {

    let dir = shell.pwd() + "/app/";
    // Initialize watcher.
    const watcher = chokidar.watch(dir, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true 
    });

    // Something to use when events are received.
    const log = console.log.bind(console);
    // Add event listeners.

    watcher
        .on('add', function (path) {
            log('File', path, 'has been added');
            zipFileAndUploadcloud(path, "false");
        })
        .on('addDir', function (path) {
            log('Directory', path, 'has been added'); 
            zipFileAndUploadcloud(path, "false");
        })
        .on('change', function (path) {
            log('File', path, 'has been changed');
           
            //  更新云端工程文件
            if (utils.isWindows()) {
                // win 
                console.log("WIN 系统");
                path = path.replace(/\\/g, '/');
                console.log("update file path:" + path);
            } else {
                // mac do nothing
            }
            zipFileAndUploadcloud(path, "false");
            
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
            //  更新云端project.json 文件
            zipFileAndUploadcloud(path, "true");
            
        })
}

// function chokidarWatchOutputDebugDir(platform) {
//     var dir = null;
//     console.log("chokidarWatchOutputDebugDir_platform==" + platform);
//     switch (platform) {
//         case utils.Platform.IOS:
//             dir = shell.pwd() + "/output/ios/debug/app/";
//             break;
//         case utils.Platform.ANDROID:
//             dir = shell.pwd() + "/output/android/debug/app/";
//             break;
//         case utils.Platform.WEIXIN:
//             dir = shell.pwd() + "/output/wx/debug/app/";
//             break;
//         case utils.Platform.DingDing:
//             dir = shell.pwd() + "/output/dd/debug/app/";
//             break;
//     }


//     // Initialize watcher.
//     const watcher = chokidar.watch(dir, {
//         ignored: /(^|[\/\\])\../,
//         persistent: true
//     });

//     // Something to use when events are received.
//     const log = console.log.bind(console);
//     // Add event listeners.

//     watcher
//         .on('add', function (path) {
//             // log('File', path, 'has been added');

//         })
//         .on('addDir', function (path) {
//             // log('Directory', path, 'has been added'); 

//         })
//         .on('change', function (path) {
//             log('outputFile', path, 'has been changed');


//         })

// }


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
    // copyAndInstallDebugIOS("true");
    (async function () {
        try {
            await zipAndUploadcloud("ios");
        } catch (e) {
            console.log(e)
        }
    })();
    //  监听工程源码 ，给debug 实时更新
    chokidarWatch();

}

function startAndroid() {
    // let pwd = shell.pwd().split(path.sep).join('/');
    
    // copyAndInstallDebugAndroid("true");
    
    (async function () {
        try {
            await zipAndUploadcloud("android");
        } catch (e) {
            console.log(e)
        }
    })();
    //  监听工程源码 ，给debug 实时更新
    chokidarWatch();
}

function startUpesn() {
    // copyAndInstallDebugUpesn("true");
    (async function () {
        try {
            await zipAndUploadcloud("upesn");
        } catch (e) {
            console.log(e)
        }
    })();
    //  监听工程源码 ，给debug 实时更新
    chokidarWatch();
}

// function copyAndInstallDebugUpesn(isStartNode) {
//     let path = getPathByPlatform(utils.Platform.Upesn);
//     let objPath = "./" + path + "/";

//     copyProjectToOutput(objPath, utils.Platform.Upesn);

//     if (isStartNode == "true") {

//         zipAndUploadcloud("upesn");
//     } else {
//         console.log("请到upesn刷新进行调试");
//     }
// }



// const cmdRunDebugApk = "adb shell am start -S com.yyiuap.summer.preview/com.yyuap.summer.core2.SummerWelcomeActivity";
// const adrAppPath="/sdcard/Android/data/com.yyiuap.summer.preview/preview_android/";

const cmdRunDebugApk = "adb shell am start -S com.yonyou.mtlandroid/com.yonyou.myapis.DebugActivity";
const adrAppPath = "/sdcard/Android/data/com.yonyou.mtlandroid/preview_android/";

// function runDebugAndroid(objPath) {
//     //运行apk
//     var cmd = "adb push " + objPath + "* " + adrAppPath + "www/";
//     shell.exec(cmd);
//     //console.log("push->" + cmd);
//     cmd = "adb push " + objPath + "/project.json " + adrAppPath;
//     shell.exec(cmd);
//     //console.log("push->" + cmd);
//     shell.exec(cmdRunDebugApk);
// }

// function copyAndInstallDebugIOS(isStartNode) {
//     let path = getPathByPlatform(utils.Platform.IOS);
//     let objPath = "./" + path + "/";
//     copyProjectToOutput(objPath, utils.Platform.IOS);
//     if (isStartNode == "true") {
//         // shell.exec("open \"/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/\"");
//         let debugApp = "./" + path + "/../debug.app";
//         // if(!fs.existsSync(debugApp)) {
//         console.log("开始安装调试应用");
//         // let cmd = "cp -rf "+debugPath+"debug.app " + debugApp;
//         // shell.exec(cmd);
//         let cmdInstallApp = "xcrun simctl install booted " + debugApp;
//         // shell.exec(cmdInstallApp);
//         // }
//         console.log("开始运行调试应用");
//         // shell.exec("xcrun simctl launch booted \"com.cscec3.mdmpush\"");
//         zipAndUploadcloud("ios");

//     } else {
//         console.log("请到iOS模拟器刷新进行调试");
//     }
//     return utils.SUCCESS;

// }

// function copyAndInstallDebugAndroid(isStartNode) {
//     let path = getPathByPlatform(utils.Platform.ANDROID);
//     let objPath = "./" + path + "/";

//     copyProjectToOutput(objPath, utils.Platform.ANDROID);
//     let debugApk = "./" + path + "/../debug.apk";

//     if (isStartNode == "true") {
//         zipAndUploadcloud("android");
//     } else {
//         console.log("请到android刷新进行调试");
//     }
// }

// function copyAndDebugWeixin(isStartNode) {
//     console.log("准备开始生成微信工程...");
//     let path = getPathByPlatform(utils.Platform.WEIXIN);
//     let objPath = "./" + path + "/";
//     let wxproj = objPath + "../proj/";
//     fs.ensureDirSync(objPath);
//     fs.ensureDirSync(wxproj);

//     // 拷贝 添加页面到 wx/proj  目录下
//     fs.copySync(__dirname.split(path.sep).join('/') + '/../res/preview.wx/', wxproj);

//     let projPath = "output/" + utils.Platform.WEIXIN + "/debug/proj/";
//     fs.ensureDirSync(projPath);
//     if (fs.existsSync("./wx/")) {
//         fs.copySync('./wx/', projPath);
//     }

//     copyProjectToOutput(objPath, utils.Platform.WEIXIN);
//     if (isStartNode == "true") {
//         zipAndUploadcloud("wx");
//     } else {
//         console.log("请到微信小程序工具刷新进行调试");
//     }
//     // 开始上传云端  10.3.13.7 服务器debugger

// }

// function copyAndDebugDD(isStartNode) {
//     console.log("准备开始生成钉钉工程...");
//     let path = getPathByPlatform(utils.Platform.DingDing);
//     let objPath = "./" + path + "/";
//     let ddproj = objPath + "../proj/";
//     fs.ensureDirSync(objPath);
//     fs.ensureDirSync(ddproj);

//     // 拷贝 添加页面到 dd/proj  目录下
//     fs.copySync(__dirname.split(path.sep).join('/') + '/../res/debug.dd/', ddproj);

//     let projPath = "output/" + utils.Platform.DingDing + "/debug/proj/";
//     fs.ensureDirSync(projPath);
//     if (fs.existsSync("./dd/")) {
//         //复制dd 页面到工程
//         fs.copySync('./dd/', projPath);
//     }

//     copyProjectToOutput(objPath, utils.Platform.DingDing);
//     if (isStartNode == "true") {
//         zipAndUploadcloud("dd");
//     } else {
//         console.log("请到钉钉小程序工具刷新进行调试");
//     }
// }
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
        fs.removeSync("./app/project.json");
        uploadAppCloud(platform);
    });
    // 存档出错
    archive.on('error', function (err) {
        throw err
    })
    archive.pipe(output);

    // 从子目录追加文件并将其命名为“新子dir”在存档中

    fs.copySync('project.json',  './app/project.json');
    var dir = "./app/";
    // switch (platform) {
    //     case utils.Platform.IOS:
    //         dir = "./output/ios/debug/app/";
    //         break;
    //     case utils.Platform.ANDROID:
    //         dir = "./output/android/debug/app/";
    //         break;
    //     case utils.Platform.WEIXIN:
    //         dir = "./output/wx/debug/app/";
    //         break;
    //     case utils.Platform.DingDing:
    //         dir = "./output/dd/debug/app/";
    //         break;
    //     case utils.Platform.Upesn:
    //         dir = "./output/upesn/debug/app/";
    //         break;
    // }

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
        hostname: configFile.CONFIG_PREVIEW_URL,
        path: configFile.CONFIG_PREVIEW_UPLOAD_FILE_API,
        headers: headers
    }, (res) => {
        res.on('data', (buffer) => {
            console.log("data=" + buffer);
            // 删除压缩文件
            fs.removeSync('file.zip');

        });
        res.on('end', () => {
            console.log("end");
        });
    });

    request.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        // 删除压缩文件
        fs.removeSync('file.zip');
    });
    form.pipe(request);
}

function uploadAppCloud(platform) {

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
        hostname: configFile.CONFIG_PREVIEW_URL,
        path: configFile.CONFIG_PREVIEW_UPLOAD_APP_API,
        headers: headers
    }, (res) => {
        res.on('data', (buffer) => {
            console.log("data=" + buffer);

            var responseResult = JSON.parse(buffer);
            if (responseResult.msg = "success") {
                // 打开浏览器 ，形成二维码
                // var openbrowser = require('openbrowser');
                // openbrowser("https://mdoctor.yonyoucloud.com/mtldebugger/mtl/qr/build?code=https://mdoctor.yonyoucloud.com/debugger/" + projectName + "/app/" + startPage);

                //  接口请求生成二维码图片 ，并下载到本地
                // cloudCreateQRAndDownload(platform,"https://mdoctor.yonyoucloud.com/debugger/" + projectName + "/app/" + startPage);
                cloudCreateQRAndDownload(platform, "https://mdoctor.yonyoucloud.com/debugger/" + projectName + "/app/" + startPage + "?projectJson=https://mdoctor.yonyoucloud.com/debugger/" + projectName + "/app/project.json");
                // 删除压缩文件
                fs.removeSync('app.zip');
            }
        });
        res.on('end', () => {
            console.log("end");
        });
    });

    request.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
        // 删除压缩文件
        fs.removeSync('app.zip');
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


function cloudCreateQRAndDownload(selectedPlatform, param) {
    // 接口请求
    var FormData = require('form-data');
    var http = require('https');
    var form = new FormData();

    var file = "project.json";
    var result = JSON.parse(fs.readFileSync(file));
    var projectName = result.config.projectName;
    var gitUrl = result.config.gitUrl;

    form.append('code', param);

    var headers = form.getHeaders();//这个不能少
    // headers.Cookie = cookie;//自己的headers属性在这里追加
    var request = http.request({
        method: 'POST',
        host: configFile.CONFIG_PREVIEW_URL,
        //   port: configFile.CONFIG_BUILDSERVER_PORT , 
        path: configFile.CONFIG_PREVIEW_CREATE_QR_API,
        headers: headers
    }, (res) => {
        var outFile = selectedPlatform + '.png'
        let ws = fs.createWriteStream(outFile, {
            highWaterMark: 1
        })

        res.on('data', (buffer) => {
            ws.write(buffer);
        });
        res.on('end', () => {

            //文件下载结束
            ws.end();
            console.log("二维码已经下载到本地,并弹出显示。");
            fs.exists("./output/tempPreview/" + selectedPlatform + '.png', function (exists) {
                if (exists) {
                    // 删除已有的文件
                    fs.removeSync("./output/tempPreview/" + selectedPlatform + '.png');
                    fs.move(selectedPlatform + '.png', "./output/tempPreview/" + selectedPlatform + '.png', function (err) {
                        if (err) return console.error(err)

                        // var openbrowser = require('openbrowser');
                        var pwd = shell.pwd().split(path.sep).join('/');
                        console.log("二维码地址：" + pwd + "/output/tempPreview/" + selectedPlatform + '.png');

                        // openbrowser(pwd +"/output/tempPreview/"+selectedPlatform+'.png');
                        const opn = require('opn');
                        opn(pwd + "/output/tempPreview/" + selectedPlatform + '.png').then(() => {
                            // image viewer closed
                            console.log("image viewer open");
                        });

                    });

                }
                if (!exists) {
                    fs.move(selectedPlatform + '.png', "./output/tempPreview/" + selectedPlatform + '.png', function (err) {
                        if (err) return console.error(err)

                        // var openbrowser = require('openbrowser');
                        var pwd = shell.pwd().split(path.sep).join('/');
                        console.log("二维码地址：" + pwd + "/output/tempPreview/" + selectedPlatform + '.png');

                        // openbrowser(pwd +"/output/tempPreview/"+selectedPlatform+'.png');

                        const opn = require('opn');
                        opn(pwd + "/output/tempPreview/" + selectedPlatform + '.png').then(() => {
                            // image viewer closed
                            console.log("image viewer open");

                        });
                    });
                }
            })

        });

    });

    request.on('error', (e) => {
        console.log(`problem with request: ${e.message}`);
    });
    form.pipe(request);
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

// function updateConfigFileToDebug() {
//     // 修改project.json  
//     var proj = JSON.parse(fs.readFileSync("./project.json").toString());
//     // proj.config.appName ="快速预览";
//     // proj.config.packageName="com.yyiuap.summer.preview";
//     proj.config.debuggerEnable = "true";
//     // proj.config.packageName ="com.yonyou.mtl.debugger";
//     fs.writeFileSync("./project.json", formatJson(proj), { flag: 'w', encoding: 'utf-8', mode: '0666' });
//     //修改./app/config.xml
//     // let xmlFile = "./app/config.xml";
//     // var builder = new xml2js.Builder();
//     // var xml = builder.buildObject(proj);
//     // fs.writeFileSync(xmlFile, xml, { flag: 'w', encoding: 'utf-8', mode: '0666' });
// }

/**
 * MTL工程 提交远程仓库
 * 
 */
// function commitAndPushConfigFile() {
//     let pwd = shell.pwd().split(path.sep).join('/');
//     console.log('调试程序源码正在整理中，请稍候 🚀 🚀 🚀 ...');
//     if (!fs.existsSync(".git")) {
//         return utils.reportError("未找到远程git仓库 ,请执行: mtl pushRemote 命令创建远程代码托管后，再进行debug。  ");
//     }
//     //first commit
//     shell.exec("git add -A");
//     shell.exec("git commit -m update  -q");
//     shell.exec("git push");

//     return utils.SUCCESS;

// }



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
    // copyAndDebugWeixin("true");

    (async function () {
        try {
            await zipAndUploadcloud("wx");
        } catch (e) {
            console.log(e)
        }
    })();
    //  监听工程源码 ，给debug 实时更新
    chokidarWatch();

    return utils.SUCCESS;
}


//开始调试钉钉Web小程序
function startDD() {
    // copyAndDebugDD("true");
    (async function () {
        try {
            await zipAndUploadcloud("dd");
        } catch (e) {
            console.log(e)
        }
    })();
    //  监听工程源码 ，给debug 实时更新
    chokidarWatch();
    return utils.SUCCESS;
}


exports.start = start