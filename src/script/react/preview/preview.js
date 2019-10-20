/**
 * 反向代理的预览方式
 */
const { mtldev, mtlLog, execCommand } = require("../src/mtlDev");

const proxyProt = 3000;

//启动本地服务
// startLocaServer();
//开始预览
startPreview();


/**
 * 启动本地服务
 */
function startLocaServer() {
  //默认为3000 先杀死本地服务
  mtldev.killNode(proxyProt);
  execCommand("npm run start");
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
    proxy_port: proxyProt, //需要代理本地服务
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
  mtlLog(`qrURL: ${qrURL}`);
  // 下载二维码
  mtldev.downloadPreviewQRFile({
    qrURL,
    callback: function(res) {
      mtlLog(JSON.stringify(res));
      //预览
      mtldev.showImage(res.data);

      mtlLog("本地代理已经注册完成。。。正在启动本地服务");
      startLocaServer()
    }
  });
}
