/**
 * 反向代理的预览方式
 */
const { mtldev, mtlLog, execCommand } = require("../src/mtlDev");

const proxyProt = 3003;


//开始预览
startPreview();
//默认为3003 先杀死本地服务
mtldev.killNode(proxyProt);

/**
 * 启动本地服务
 */
function startLocaServer() {
  execCommand("npm run debug:mobile");
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
      mtldev.showImage(res.data,function () {

        setTimeout(() => {
          mtlLog("本地代理已经注册完成。。。正在启动本地服务");
          startLocaServer()
        }, 300);
      });

     
      
    }
  });
}
