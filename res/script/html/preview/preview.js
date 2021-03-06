/**
 * 静态文件上传的方式预览
 */
const { mtldev, mtlLog} = require("../src/mtlDev");
const fs = require("fs");
const path = require("path");


const platform = "android";
mtldev.setStaticFilePath("app/");

mtlLog(`正在编译 preview`, true);

//开始预览
startPreview();



function startPreview() {
    //编译工程 1
    let compileres = mtldev.compile(platform);
    mtlLog(`${compileres} 编译完成`);
    //app静态文件上传 2
    mtldev.uploadAPP({
      platform: platform,
      callback: function(res) {
        mtlLog(JSON.stringify(res));
        mtlLog(`上传压缩包完成`);
        // 下载二维码 3
        mtldev.downloadPreviewQRFile({
          platform: platform,
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
            mtldev.showImage(outFile, function() {
              setTimeout(function () {
                startWatch();
              },400)
            });
          }
        });
      }
    });
}

//启动 文件监听
function startWatch() {
  mtlLog("启动 文件监听");
  mtldev.startWatch(
    function(type, watchpath, changepath) {
      let appOut = mtldev.getOutPathByPlatform(platform);
      //改变的文件相对路径
      let changeFile = changepath.substring(
        watchpath.length,
        changepath.length
      );
      //需要上传的路径
      let toPath = path.join(appOut, changeFile);
      mtlLog(
        `type: ${type}, watchpath: ${watchpath}, changepath: ${changepath} cp to ${toPath}`
      );
      if (type === 0) {
        return;
      }
      // 拷贝文件到某个目录
      fs.copyFileSync(changepath, toPath);
      // 拷贝文件到某个目录
      mtldev.uploadAPP({
        platform: platform,
        callback: function(res) {
          console.log(JSON.stringify(res));
        },
        dirPath: toPath,
        changeFile,
        isFile: true
      });
    },
    function error(msg) {
      console.log(msg);
    }
  );
}
