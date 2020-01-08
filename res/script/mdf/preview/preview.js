/**
 * 静态文件上传的方式预览
 */
const { mtldev, mtlLog, mtlProject,execCommand } = require("../src/mtlDev");
const fs = require("fs");
const path = require("path");
const pla = "android";
//静态文件路径
// mtldev.setStaticFilePath("build/");

mtlLog(`preview 当前编译平台 ： ${pla}`, true);

//编译文件
execCommand("npm run build");

execPreview();

function execPreview() {
  let staticP = mtldev.getStaticFilePath();

  if (!fs.existsSync(`${mtlProject.workspace}/${staticP}`)) {
    mtlLog(
      `StaticFilePath：${mtlProject.workspace}/${staticP}  文件未生成，请先根据工程类型生成静态文件: 如 npm run build`
    );
  } else {
    //编译工程 1
    let compileres = mtldev.compile(pla);
    mtlLog(`${compileres} 编译完成`);
    //app静态文件上传 2
    mtldev.uploadAPP({
      platform: pla,
      callback: function(res) {
        mtlLog(JSON.stringify(res));
        mtlLog(`上传压缩包完成`);
        // 下载二维码 3
        mtldev.downloadPreviewQRFile({
          platform: pla,
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
            });
          }
        });
      }
    });
  }
}