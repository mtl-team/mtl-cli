/**
 * 启动安卓模拟器并且安装 debug应用
 */
const {execCommand,mtldev,mtlProject} = require("../src/mtlDev");
const path = require("path");
const fs = require("fs");
const workspace = mtlProject.workspace;
const savePath = path.join(workspace,"../gitDebugApp/androidDebug");//iOSDebug
const appPath = path.join(savePath,"debug.apk");

cloneApp();

function cloneApp(){    
    if(fs.existsSync(appPath)){
        execCommand("git pull",savePath)

    }else{
        execCommand(`git clone ${mtldev.debugAndroidConfig.androidDebugAPPURL} ${savePath}`);

    }
    mtldev.startEmulator("android",appPath)
}


// //安装安装配置文件 也可以自行手动安装
// execCommand(`adb install -r ${appPath}`);
// //启动debug应用
// execCommand(mtldev.debugAndroidConfig.cmdRunDebugApk);
