const shell = require('shelljs');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const utils = require('./mtl').Utils;
const xml2js = require('xml2js');
const configFile = require('./config');
const os = require("os");
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

    if(os.platform() != "darwin"){
        console.log("ios debug调试程序必须在苹果电脑系统下运行！！！");
        return;
    }
    let pwd = shell.pwd();
    if(!fs.existsSync(pwd +"/output/debug/ios/debug.app")) {
        updateConfigFileToDebug();
        if(commitAndPushConfigFile()== "error"){
            return;
        }

        cloudBuildAndUnzip("ios");
    }else{
        copyAndInstallDebugIOS(); 
    }

}

// xcrun instruments -w 'iPhone 6 Plus'

// 在已经启动好的模拟器中安装应用：

// xcrun simctl install booted Calculator.app （这里要特别注意，是app，不是ipa 安装时需要提供的是APP的文件路径）

// 例如：xcrun simctl install booted /Users/xiexuemei/Downloads/DingTalk.app

// const debugPath = __dirname + "/../res/";

function startAndroid() {
    let pwd = shell.pwd();
    if(!fs.existsSync(pwd +"/output/debug/android/debug.apk")) {
        updateConfigFileToDebug();
        if(commitAndPushConfigFile()== "error"){
            return;
        }

        cloudBuildAndUnzip("android");
    }else{
        copyAndInstallDebugAndroid(); 
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

function  copyAndInstallDebugIOS(){

    console.log("准备开始生成iOS工程...");
    let path = getPathByPlatform(utils.Platform.IOS);
    let objPath = "./" + path +"/";
    copyProjectToOutput(objPath,utils.Platform.IOS);
    
    shell.exec("open \"/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app/\"");
    let debugApp = "./" + path + "/../debug.app";
    // if(!fs.existsSync(debugApp)) {
        console.log("开始安装调试应用");
        // let cmd = "cp -rf "+debugPath+"debug.app " + debugApp;
        // shell.exec(cmd);
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



function copyAndInstallDebugAndroid() {
    let path = getPathByPlatform(utils.Platform.ANDROID);
    let objPath = "./" + path +"/";
    console.log(objPath);
    copyProjectToOutput(objPath,utils.Platform.ANDROID);
    let debugApk = "./" + path + "/../debug.apk";
    console.log(debugApk);
    if(!fs.existsSync(debugApk)) {
        let pwd = shell.pwd();
        let cloudDebugApkPath = pwd +"/output/debug/android/export/debug.apk";

        let cmd = "cp -rf "+cloudDebugApkPath+ " " + debugApk;
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


function cloudBuildAndUnzip(selectedPlatform){
    // 接口请求
    var FormData = require('form-data');
    var http = require('http');
    var form = new FormData();
  
    var file="project.json";
    var result=JSON.parse(fs.readFileSync(file));
    var projectName = result.config.projectName;
    var gitUrl = result.config.gitUrl;
  
    form.append('userName','ump');
    form.append('buildType',selectedPlatform);
    // form.append('certName',certName); 
    form.append('certName',''); 

    // form.append('request', fs.createReadStream("./test.zip"));//'request'是服务器接受的key
    form.append('projectName',projectName); 
    form.append('gitUrl',gitUrl);
    form.append('gitBranch','');
    form.append('isDebug',"true");
    var headers = form.getHeaders();//这个不能少
    // headers.Cookie = cookie;//自己的headers属性在这里追加
    var request = http.request({
      method: 'POST',
      host: configFile.CONFIG_BUILDSERVER_URL ,
      port: configFile.CONFIG_BUILDSERVER_PORT , 
      path: configFile.CONFIG_BUILDPROJECT_API ,
      headers: headers
    },(res) =>{
              var outFile= selectedPlatform+'Debug.zip'
              let ws = fs.createWriteStream(outFile,{
                    highWaterMark:1
                })
  
              res.on('data',(buffer) => {
                ws.write(buffer) ;  
              });
              res.on('end',()=>{
                
                //文件下载结束
                ws.end();
                if(selectedPlatform=='android'){
                  fs.exists("androidDebug.zip",function(exists){
                    if(exists){                         
                        // 删除已有的文件
                        shell.exec("rm -rf  output/debug/android ");
                        // 创建输出目录
                        utils.mkDirsSync("./output/debug");
                        // 开始解压文件
                        shell.exec("unzip androidDebug.zip  -d output/debug/android");
                        // 获取android 目录下的文件目录
                        let pwd = shell.pwd();
                        let filePath = pwd +"/output/debug/android";
                        let filesDir= getFilesDir(filePath);
                        //  验证android目录文件
                        let len = filesDir.length;
                        
                        let apkPath;
                        for (let i = 0; i < len; ++i) {
                          
                            if (filesDir[i].indexOf(".apk")>=0){
                              apkPath=filesDir[i];
                            }
                        }
                        if(apkPath!=null){
                          let debugApkPath = filePath+'/export/debug.apk';
                          fs.move(apkPath, debugApkPath, function(err) {
                            if (err) return console.error(err)
                            console.log('云端构建调试程序完成！');
                            copyAndInstallDebugAndroid();
                            });
                        }else{
                          console.log('云端构建调试程序失败');
                        }
                        
                        shell.exec("rm -rf  androidDebug.zip ");
                       
                    }
                       if(!exists){
                          console.log("云端构建调试程序失败");
                       }
                    })
  
                }else{
                  fs.exists("iosDebug.zip",function(exists){
                    if(exists){            
                        // 删除已有的文件
                        shell.exec("rm  -rf  output/debug/ios");
                        // 创建输出目录
                        utils.mkDirsSync("./output/debug");
                        // 开始解压文件
                        shell.exec("unzip iosDebug.zip  -d output/debug/ios");
                        // 删除zip 文件
                        shell.exec("rm  -rf  iosDebug.zip");
                        // 生成debug APP 程序
                        let pwd = shell.pwd();
                        let projectDir = pwd +"/output/debug/ios/export";
                
                        let workspaceDir=projectDir+"/"+projectName+".xcworkspace";

                        let cmd = "xcodebuild -workspace " +workspaceDir +" -scheme " +projectName+ " -sdk iphonesimulator12.2";
                        shell.exec(cmd);
                        console.log('mac的主机名称：'+os.homedir());
                        let derivedDataDir = os.homedir()+"/Library/Developer/Xcode/DerivedData/";

                        // 获取DerivedData目录下的目录列表
                        let components = []
                        const files = fs.readdirSync(derivedDataDir)
                        files.forEach(function (item, index) {
                            let stat = fs.lstatSync(derivedDataDir+item)
                            if (stat.isDirectory() === true) { 
                              components.push(item)
                            }
                        })
                        console.log(components);
                        //  获取iOS debug.app 目录
                        let len = components.length;
                        var debugAppPath ;
                        for (let i = 0; i < len; ++i) {
                        
                          if (components[i].indexOf(projectName+"-")>=0){
                            debugAppPath = derivedDataDir+components[i]+"/Build/Products/Debug-iphonesimulator/"+projectName+".app";
                          }
                        }
                        // debug app  程序移动指定output 目录
                        if(debugAppPath!=null){
                            let pwd = shell.pwd();
                            fs.move(debugAppPath, pwd +"/output/debug/ios/debug.app", function(err) {
                              if (err) return console.error(err)
                              // 执行 debug 程序
                              copyAndInstallDebugIOS();
                              });
                          }else{
                            console.log('云端ios构建调试程序失败');
                          }
                         
                    }
                       if(!exists){
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

  function getFilesDir(filePath){
    console.log('filePath:'+filePath);
    var join = require('path').join;
      let filesDir = [];
      function findFile(path){
          let files = fs.readdirSync(path);
          files.forEach(function (item, index) {
              let fPath = join(path,item);
              let stat = fs.statSync(fPath);
              if(stat.isDirectory() === true) {
                  findFile(fPath);
              }
              if (stat.isFile() === true) { 
                filesDir.push(fPath);
              }
          });
      }
      findFile(filePath);
      console.log(filesDir);
      return filesDir;
  }

function updateConfigFileToDebug() {
    // 修改project.json  
    var proj = JSON.parse(fs.readFileSync("./project.json").toString());
    // proj.config.appName ="快速预览";
    // proj.config.packageName="com.yyiuap.summer.preview";
    proj.config.debuggerEnable="true";
    fs.writeFileSync("./project.json", formatJson(proj),{flag:'w',encoding:'utf-8',mode:'0666'});
    //修改./app/config.xml
    let xmlFile = "./app/config.xml";
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(proj);
    fs.writeFileSync(xmlFile, xml,{flag:'w',encoding:'utf-8',mode:'0666'});    
}

/**
 * MTL工程 提交远程仓库
 * 
 */
function commitAndPushConfigFile() {
    let pwd = shell.pwd();
    console.log('当前路径：'+pwd);
    if(!fs.existsSync(".git")) {
        return utils.reportError("未找到远程git仓库 ,请执行: mtl pushRemote 命令创建远程代码托管后，再进行debug。  ");
    }
    //first commit
    shell.exec("git add -A");
    console.log('执行git commit');

    shell.exec("git commit -m update  -q");
    shell.exec("git push");
    console.log("配置文件更新到云端");
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