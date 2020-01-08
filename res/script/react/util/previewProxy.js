/**
 * 反向代理的预览方式
 */
const { mtldev, mtlLog, execCommand, mtlProject } = require("../src/mtlDev");
const fs = require("fs");
const path = require("path");
const workspace = mtlProject.workspace;

const previewConfig = {
  proxyProt : 3000,//本地服务的端口
  reactStaticPath : "public/",//本地服务静态路径
  startScript : "npm run start"//启动本地服务脚本
};


//默认为3000 先杀死本地服务
mtldev.killNode(previewConfig.proxyProt);
//开始预览
startPreview();



const des = "如需修改 , 请在script/preview/preview.js 修改 previewConfig ";
/**
 * 启动本地服务
 */
function startLocaServer() {
  let pro = "project.json";
  
  let _static = path.join(workspace, previewConfig.reactStaticPath);
  mtlLog(`copy ${pro} to staticFilePath :${_static}`);
  if (fs.existsSync(_static)) {
    fs.copyFileSync(path.join(workspace, pro), path.join(_static, pro));
    execCommand(previewConfig.startScript);
  }else{
    mtlLog(`当前工程没有 ${_static} 目录，平台的静态文件路径和信息 ${des}`);
  }

  
}

/**
 *启动预览
 https://mtlpreview.yonyoucloud.com:7878/
 */
function startPreview() {
  const option = {
    host: "mtlpreview.yonyoucloud.com", //非必传 默认debugServerAddress
    // port: "7878",//非必传
    isHttps: true,
    proxy_port: previewConfig.proxyProt, //需要代理本地服务
    callback: res => {
      mtlLog(JSON.stringify(res));
      if (res.code === 200) {
        downQr(res.data);
      }
    }
  };
  mtldev.registerProxy(option);
}

function downQr(qrURL) {
  mtlLog(`正在下载  qrURL: ${qrURL}`);
  // 下载二维码
  mtldev.downloadPreviewQRFile({
    qrURL,
    callback: function(res) {
      if(res.code != 200){
        mtlLog(`生成二维码失败: ${JSON.stringify(res)}`);
        return
      }
      let outFile = res.data.outFile;
      let qrURL = res.data.qrURL;
      fs.writeFileSync(path.join(path.dirname(outFile),'url.log'),qrURL);
      mtlLog(`生成二维码qrURL: ${qrURL}`);
      //预览 4
      mtlLog(`正在打开二维码：${outFile}`);
      //预览
      mtldev.showImage(outFile, res => {
        mtlLog("----------------");
        mtlLog(`-----本地代理已经注册完成，二维码已打开， 正在启动本地服务配置默认脚本 ${previewConfig.startScript}`);
        mtlLog(`-----${des}`);
        mtlLog(`-------正在启动脚本${previewConfig.startScript}--------`);
        setTimeout(() => {
          startLocaServer();
          mtlLog(`-------执行完成 ${previewConfig.startScript} 日志请查看上方--------`);
        }, 311);
      });
    }
  });
}
