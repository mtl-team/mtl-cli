/**
 */
const { mtldev, mtlLog ,mtlProject} = require("../src/mtlDev");

//由于工程差异summer的workspace可能和mtl不一致可以输入一个任意路径进行打包
const config = {
  projectPath: mtlProject.workspace,
  platform: "ios",
  host:"mbs.yyuap.com",
  port:"8080"
};

mtlLog(`build summer`, true);

mtlLog(`正在  build 请稍等.........`);


mtldev.buildSummer({
  platform: config.platform,
  projectPath: config.projectPath,
  host:config.host,
  port:config.port,
  callback: function(res) {
    if (res.code == "200") {
      mtldev.showImage(res.data.png);
    } else {
      mtlLog(JSON.stringify(res));
    }
  }
});