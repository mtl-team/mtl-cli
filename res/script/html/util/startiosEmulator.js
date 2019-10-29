/**
 * 启动IOS 模拟器 并且安装 
 */
const {execCommand,mtldev,mtlProject} = require("../src/mtlDev");
const path = require("path");
const fs = require("fs");
const workspace = mtlProject.workspace;
const savePath = path.join(workspace,"../gitDebugApp/iOSDebug");//
const appPath = path.join(savePath,"debug.app");



cloneApp();

function cloneApp(){    
    if(fs.existsSync(appPath)){
        execCommand("git pull",savePath)

    }else{
        execCommand(`git clone ${mtldev.debugIOSConfig.IOSDebugAPPURL} ${savePath}`);

    }
    mtldev.startEmulator("ios",appPath)
}


// let cmdInstallApp =
//   "xcrun simctl install booted " + appPath;
// execCommand(cmdInstallApp);

// execCommand(mtldev.debugIOSConfig.cmdRun);

