/**
 */
const { mtldev, mtlLog } = require("../src/mtlDev");
const fs = require("fs");
const config = {
  host: "mtlb.yyuap.com",
  port: "8050"
};

//打包ios
mtldev.buildIOS(config, function(res) {
  if(res.code != 200 ){
    mtlLog(JSON.stringify(res));
    return;
  }
  if (res.data.app) {
    mtlLog(`app 生成目录， ${res.data.app} 安装到手机。 `); //如果有app 输出APP
  } else {
    mtlLog(fs.readFileSync(res.data.log, "utf-8")); //打印日志//打印日志
  }
});
