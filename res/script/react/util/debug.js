const {
  mtldev,
  mtlLog,
  mtlProject,
  execJs,
  execCommand
} = require("../src/mtlDev");
const fs = require("fs-extra");
const path = require("path");

const { platform, script, reactStaticPath, workspace } = mtlProject;

mtlLog(`debug 当前编译平台 ： ${platform}`, true);

if (!platform) {
  mtlLog(`我选择 platform 请选择编译平台： 例如 ： 执行android.js `);
} else {
  startNode();
}

/**启动本地node */
function startNode() {
  let pro = "project.json";
  mtlLog(`copy ${pro} to staticFilePath :${reactStaticPath}`);
  fs.copyFileSync(
    path.join(workspace, pro),
    path.join(path.join(workspace, reactStaticPath), pro)
  );
  mtlLog(`本地服务已开启 请在命令行执行自己 例如：${script} 运行结果`);
  // execCommand(script,"script-ide");
  startEmulator();
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
      mtlLog("正在启动模拟器");
      execJs("/script/util/startiosEmulator.js");
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
