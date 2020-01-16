/**
 */
const { mtldev, mtlLog, execCommand } = require("../src/mtlDev");
const fs = require("fs");
const config = {
  host: "mtlb.yyuap.com",
  port: "8050",
  script: "npm run build"
};

//编译文件
compile();

function compile() {
  mtlLog(`----------------开始编译 script: ${config.script}-----------------`);
  execCommand(config.script);
  mtlLog(`----------------执行完成 script: ${config.script}------------`);

  build();
}

//打包ios
function build() {
  mtldev.buildIOS(config, function(res) {
    if (res.code != 200) {
      mtlLog(JSON.stringify(res));
      return;
    }
    if (res.data.app) {
      mtlLog(`app 生成目录， ${res.data.app} 安装到手机, `); //如果有app 输出APP
    } else {
      mtlLog(fs.readFileSync(res.data.log, "utf-8")); //打印日志//打印日志
    }
  });
}
