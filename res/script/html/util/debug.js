const { mtldev, mtlLog, mtlProject, execJs,isWindows } = require("../src/mtlDev");
const path = require("path");
const fs = require("fs");

const { platform, workspace, staticFilePath, port = 3000 } = mtlProject;
mtlLog(`debug 当前编译平台 ： ${platform}`, true);
mtldev.initWorkspace(workspace,mtlLog);
if (!platform) {
  mtlLog(`我选择 platform 请选择编译平台： 例如 ： 执行android.js `);
} else {
  startDebug();
}

function startDebug() {

  if(platform == "ios" && isWindows()){
      mtlLog("当前为Win 不支持启动 ios 相关模拟器");
    return
  }
  startNode();
  // let script = "npm install express --save-dev ";
  // let promise = new Promise(function(resolve, reject) {
  //   mtlLog(`正在检测 express 插件是否安装....`)
  //   setTimeout(() => {
  //     if(!mtlProject.express){
  //       mtldev.shellExec(script);
  //     }
  //     resolve();
  //   }, 300);
  // });
  // promise.then(function() {
  //   mtlLog(`express 插件 已经正常安装 ....`)
  //   mtlProject.express = true;
    
  // });
}

/**启动本地node */
function startNode() {
  let pro = "project.json";
  let file1 = { value: staticFilePath };
  let file2 = { path: `/${pro}`,value: pro };
  
  let options = {
    staticPatas: [file1,file2],
    port: port,
    callback: res=>{
      if(res.code == 200){
        startEmulator();
      }
    }
  };
  mtldev.startNode(options);
 
}

/**
 * 启动原生模拟器
 */
function startEmulator() {
  switch (platform) {
    case "android":
      mtlLog("请先启动 Android 模拟器");
      execJs("/script/util/startAndroidEmulator.js");
      break;
    case "ios":
      if(isWindows()){
        mtlLog("当前为Win 不支持启动 ios 相关模拟器");
      }else{
        mtlLog("正在启动模拟器");
        execJs("/script/util/startiosEmulator.js");
      }
      
      break;
    default:
      mtlLog(`当前平台 ${platform} ，无模拟器`);
      mtlLog(`正在  compile ${platform}`);
      let res = mtldev.compile(platform);
      res.code == 200
        ? mtlLog(`compile 结束,生成工程目录： ${res.data}`)
        : JSON.stringify(res);
      break;
  }
}
