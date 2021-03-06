/**
 * 编译Android工程
 */
const { mtldev, mtlLog } = require("../src/mtlDev");
const fs = require("fs");

const config = {
  host: "mtlb.yyuap.com",
  port: "8050"
};

//打包安卓
mtldev.buildAndroid(config, function(res) {
  if(res.code != 200 ){
    mtlLog(JSON.stringify(res));
    return;
  }
  if (!res.data.app) {
    mtlLog(fs.readFileSync(res.data.log, "utf-8")); //打印日志
  } else {
    mtlLog(`app 生成目录，可以使用 adb install ${res.data.app} 安装到手机。 `); //如果有app 输出APP
  }
});
