const shell = require('shelljs');
const path = require('path');

var fs = require('fs-extra');
var unzip = require("unzip-stream");

const Configstore = require('configstore');
const configFile = require('./config');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);

const utils = require('./mtl').Utils;
const inquirer = require('inquirer');
const xml2js = require('xml2js');
const buildList = [{
  type: 'list',
  message: '请选择项目平台：1、iOS；2、Android , 用上下箭头选择平台:',
  name: 'platform',
  choices: [
    "iOS",
    "android"
  ],
  filter: function (val) { // 使用filter将回答变为小写
    return val.toLowerCase();
  }
}
,
    {
        type: 'input',
        message: '请输入 用友云账号 ,如果账号不清楚是什么，可以登录友互通查询。\n\r友互通地址：https://euc.yonyoucloud.com。\n\r进入到友互通页面 ，点击左面菜单中 基本设置-->个人资料，可以查找到用友云账号。\n\r用友云账号会关联在构建后台上传的证书文件。\n\r请输入用友云账号：',
        name: 'buildServerID',
        default: conf.get('buildServerID'),
        filter: function (val) { // 使用filter将回答变为小写
            return val;
        }

    }
];


const buildIDList = [
    {
        type: 'input',
        message: '请输入 用友云账号 ,如果账号不清楚是什么，可以登录友互通查询。\n\r友互通地址：https://euc.yonyoucloud.com。\n\r进入到友互通页面 ，点击左面菜单中 基本设置-->个人资料，可以查找到用友云账号。\n\r用友云账号会关联在构建后台上传的证书文件。\n\r请输入用友云账号：',
        name: 'buildServerID',
        default: conf.get('buildServerID'),
        filter: function (val) { // 使用filter将回答变为小写
            return val;
        }

    }
];



const startList = [{
  type: 'list',
  message: '请选择项目平台：Android ，其他平台暂未支持',
  name: 'platform',
  choices: [
    "android"
  ],
  filter: function (val) { // 使用filter将回答变为小写
    return val.toLowerCase();
  }
}];

/**
* 执行build react 工程构建
*/
function buildReactProject() {
  return new Promise((resolve, reject) => {
      shell.exec(" yarn  build ");
  })
}

class mtlBuild {
  static build(buildPlatform) {
    // 代码更新去正式编译
    // updateConfigFileToRelease();
    // if(commitAndPushConfigFile()== "error"){
    //     return;
    // }

    // 检查是否当前工程根目录
    if (utils.checkProjectDir() == "error") {
      return;
    }
    var proj = JSON.parse(fs.readFileSync("./project.json").toString());

    console.log('technologyStack：'+proj.config.technologyStack);

    if (proj.config.technologyStack == "react") {

        console.log('react工程。');
        // shell.exec("yarn build");
        (async function () {
            try {
                await buildReactProject();
            } catch (e) {
                console.log(e)
            }
        })();
        if (fs.existsSync("./build")) {
            fs.removeSync('./app');
            fs.ensureDirSync('./app');
            fs.copySync('./build', './app');
        } else {
            console.log('react工程build失败。');
            return;
        }
        if (!fs.existsSync("./build/css/themes/")) {
          fs.ensureDirSync('./app/css/themes/');
          fs.copySync('./pubilc/css/themes/', './app/css/themes/');
      } 

    }
    zipAndUploadcloud(buildPlatform, "uploadZip");
  }

  static start(startPlatform) {

    console.log('注意 🎉 请一定要在当前工程目录下🎉 ！');
    if (startPlatform != undefined) {

      // todo 
      if (utils.checkPlatform(startPlatform) == "iOS".toLowerCase()) {

        console.log('暂时不可演示');
      } else if (utils.checkPlatform(startPlatform) == "Android".toLowerCase()) {

        androidInstall();

      } else if (utils.checkPlatform(startPlatform) == "WX".toLowerCase()) {
        //  shell.cd("WX");
        //  console.log('WX 项目工程编译中...');
        console.log('暂时不可演示');
      } else if (utils.checkPlatform(startPlatform) == "EApp".toLowerCase()) {
        //  shell.cd("EApp");
        //  console.log('EApp 项目工程编译中...');
        console.log('暂时不可演示');
      } else {
        inquirer.prompt(startList).then(answers => {
          console.log('选用平台：' + answers.platform); // 返回的结果
          console.log(answers.platform + '项目启动中...');
          if (answers.platform == "android") {
            androidInstall();
          } else {
            console.log('暂时不可演示');
          }
        });
      }
    } else {

      inquirer.prompt(startList).then(answers => {
        console.log('选用平台：' + answers.platform); // 返回的结果
        console.log(answers.platform + '项目启动中...');
        if (answers.platform == "android") {
          androidInstall();
        } else {
          console.log('暂时不可演示');
        }
      });
    }
  }

}



function androidInstall() {
  var file = "project.json";
  var result = JSON.parse(fs.readFileSync(file));
  var projectName = result.config.projectName;

  console.log('android 工程运行展示中，请先连接android手机或者打开模拟器...');

  let pwd = shell.pwd().split(path.sep).join('/');
  var runProjPath = pwd + "/output/android/release/export/" + projectName + ".apk"
  console.log('apk地址:' + runProjPath);
  shell.exec("adb install -r  " + runProjPath);
}


function cloudBuildAndUnzip(selectedPlatform, certName, buildType) {
  // 接口请求
  var FormData = require('form-data');
  var http = require('http');
  var form = new FormData();

  var file = "project.json";
  var result = JSON.parse(fs.readFileSync(file));
  var projectName = result.config.projectName;
  var appName = result.config.appName;
  var buildID = conf.get('buildServerID')
  if(buildID==''||buildID== undefined){
    buildID='ump';
  }
  form.append('userName', buildID);
  form.append('buildType', selectedPlatform);
  form.append('buildStyle', buildType);
  form.append('certName', certName);
  form.append('request', fs.createReadStream(projectName + ".zip"));//'request'是服务器接受的key
  form.append('projectName', projectName);
  form.append('appName', appName);
  form.append('isDebug', "false");
  console.log('构建android 的签名文件、iOS的描述文件和证书，请先在云构建服务器上传！！！');
  console.log("如果没有上传，会使用系统默认的签名文件或描述文件和证书去构建，但不能用于商用！！！");
  console.log('项目工程编译中，请稍候  🚀 🚀 🚀 ...');
  var headers = form.getHeaders();//这个不能少
  // headers.Cookie = cookie;//自己的headers属性在这里追加
  var request = http.request({
    method: 'POST',
    host: configFile.CONFIG_BUILDSERVER_URL,
    port: configFile.CONFIG_BUILDSERVER_PORT,
    path: configFile.CONFIG_BUILDPROJECT_API,
    headers: headers
  }, (res) => {
    var outFile = selectedPlatform + '.zip'
    let ws = fs.createWriteStream(outFile, {
      highWaterMark: 1
    })

    res.on('data', (buffer) => {
      ws.write(buffer);
    });
    res.on('end', () => {

      //文件下载结束
      ws.end();
      if (selectedPlatform == 'android') {
        fs.exists("android.zip", function (exists) {
          if (exists) {
            // 删除 原有的输出文件目录
            fs.removeSync('./output/android/release');
            
              //删除 上传源码文件
              fs.removeSync(projectName + '.zip');
              fs.removeSync('./' + projectName);
            

            (async function () {
              try {
                await unzipSync('android.zip', './output/android/release');
                fs.removeSync('android.zip');
                console.log("文件解压完成。");

                // 获取android 目录下的文件目录
                let pwd = shell.pwd().split(path.sep).join('/');
                let filePath = pwd + "/output/android/release";
                let filesDir = getFilesDir(filePath);
                //  验证android目录文件
                let len = filesDir.length;
                let logPath;
                let apkPath;
                for (let i = 0; i < len; ++i) {
                  if (filesDir[i].indexOf(".log") >= 0) {
                    logPath = filesDir[i];
                  }
                  if (filesDir[i].indexOf(".apk") >= 0) {
                    apkPath = filesDir[i];
                  }
                }
                if (apkPath != null) {
                  console.log('工程编译完成,编译日志如下：');
                } else {
                  console.log('工程编译失败,编译日志如下：');
                }

                let data = fs.readFileSync(logPath, 'utf8');
                console.log(data);

                console.log(' 云构建打包完成 🎉  🎉  🎉 ！');
                console.log(' 构建包文件目录为: 当前工程目录/output/android/release');
                console.log('可以通过  start 指令来完成云编译工程本地虚拟安装演示');
                console.log('指令举例：mtl start         引导完成平台演示!');
                console.log('指令举例：mtl start 2       通过平台代号完成平台演示！');
                console.log('指令举例：mtl start Android 通过平台名称完成平台演示！');
              } catch (e) {
                console.log(e)
              }
            })();
          }
          if (!exists) {
            console.log("android.zip文件不存在")
          }
        })

      } else {
        fs.exists("ios.zip", function (exists) {
          if (exists) {
            // 删除 原有的输出文件目录
            fs.removeSync('./output/ios/release');
           
              //删除 上传源码文件
              fs.removeSync(projectName + '.zip');
              fs.removeSync('./' + projectName);
            
            (async function () {
              try {
                await unzipSync('ios.zip', './output/ios/release');
                fs.removeSync('ios.zip');
                let pwd = shell.pwd().split(path.sep).join('/');
                let filePath = pwd + "/output/ios/release";
                let filesDir = getFilesDir(filePath);
                //  验证iOS目录文件
                let len = filesDir.length;
                console.log(len);
                let logPath;
                let ipaPath;
                for (let i = 0; i < len; ++i) {
                  if (filesDir[i].indexOf(".log") >= 0) {
                    logPath = filesDir[i];
                  }
                  if (filesDir[i].indexOf(".ipa") >= 0) {
                    ipaPath = filesDir[i];
                  }
                }
                if (ipaPath != null) {
                  console.log('工程编译完成,编译日志如下：');
                } else {
                  console.log('工程编译失败,编译日志如下：');
                }

                let data = fs.readFileSync(logPath, 'utf8');
                console.log(data);
                console.log(' 云构建打包完成 🎉  🎉  🎉 ！');
                console.log(' 构建包文件目录为: 当前工程目录/output/ios/release');
              } catch (e) {
                console.log(e)
              }
            })();
          }
          if (!exists) {
            console.log("ios.zip文件不存在")
          }
        })

      }

    });

  });

  request.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });
  form.pipe(request);
}

function getFilesDir(filePath) {
  console.log('filePath:' + filePath);
  var join = require('path').join;
  let filesDir = [];
  function findJsonFile(path) {
    let files = fs.readdirSync(path);
    files.forEach(function (item, index) {
      let fPath = join(path, item);
      let stat = fs.statSync(fPath);
      if (stat.isDirectory() === true) {
        findJsonFile(fPath);
      }
      if (stat.isFile() === true) {
        filesDir.push(fPath);
      }
    });
  }
  findJsonFile(filePath);
  console.log(filesDir);
  return filesDir;
}


function updateConfigFileToRelease() {
  // 修改project.json  
  var proj = JSON.parse(fs.readFileSync("./project.json").toString());
  proj.config.debuggerEnable = "false";
  fs.writeFileSync("./project.json", formatJson(proj), { flag: 'w', encoding: 'utf-8', mode: '0666' });
  //修改./app/config.xml
  // let xmlFile = "./app/config.xml";
  // var builder = new xml2js.Builder();
  // var xml = builder.buildObject(proj);
  // fs.writeFileSync(xmlFile, xml, { flag: 'w', encoding: 'utf-8', mode: '0666' });
}



/**
 * 验证工程源码git托管 的配置信息是否配置完成
 * 
 */
function checkProjectGitConfig() {

  console.log("工程源码仓库地址：" + conf.get('git-url'));
  if (conf.get('git-branch') == "") {
    console.log("工程源码仓库分支为默认主干：origin/master");
  } else {
    console.log("工程源码仓库分支：" + conf.get('git-branch'));
  }
  console.log("工程源码仓库账号：" + conf.get('git-user'));
  console.log("工程源码仓库账号密码：" + conf.get('git-password'));
  console.log("！！！请确定本地要构建的源码已经更新到git仓库！！！");
  return utils.SUCCESS;

}


function selectedBuildPlatform(buildPlatform, buildType) {
  if (buildPlatform == undefined) {
    inquirer.prompt(buildList).then(answers => {
      console.log('选用平台：' + answers.platform); // 返回的结果
      console.log('构建账号：' + answers.buildServerID); // 返回的结果
      conf.set('buildServerID', answers.buildServerID);

      if (answers.platform == "ios") {
        cloudBuildAndUnzip(answers.platform, 'UAPMOBILE_DIS_299', buildType);
      } else {
        cloudBuildAndUnzip(answers.platform, 'ump', buildType);
      }
    });
  } else if (utils.checkPlatform(buildPlatform) == "iOS".toLowerCase()) {
    inquirer.prompt(buildIDList).then(answers => {
      console.log('构建账号：' + answers.buildServerID); // 返回的结果
      conf.set('buildServerID', answers.buildServerID);
      cloudBuildAndUnzip(buildPlatform.toLowerCase(), 'UAPMOBILE_DIS_299', buildType);
    });

  } else if (utils.checkPlatform(buildPlatform) == "Android".toLowerCase()) {
      inquirer.prompt(buildIDList).then(answers => {
      console.log('构建账号：' + answers.buildServerID); // 返回的结果
      conf.set('buildServerID', answers.buildServerID);
      cloudBuildAndUnzip(buildPlatform.toLowerCase(), 'ump', buildType);
    });
    
  }  else {
    inquirer.prompt(buildList).then(answers => {
      console.log('选用平台：' + answers.platform); // 返回的结果
      if (answers.platform == "ios") {
        cloudBuildAndUnzip(answers.platform, 'UAPMOBILE_DIS_299', buildType);
      } else {
        cloudBuildAndUnzip(answers.platform, 'ump', buildType);
      }
    });
  }

}

function zipAndUploadcloud(selectedPlatform, buildType) {

  (async function () {
    try {
      await zipDir(selectedPlatform, buildType);
    } catch (e) {
      console.log(e)
    }
  })();
}

function zipDir(platform, buildType) {
  var file = "project.json";
  var result = JSON.parse(fs.readFileSync(file));
  var projectName = result.config.projectName;
  var archiver = require('archiver');
  var output = fs.createWriteStream(projectName + '.zip');

  let archive = archiver('zip', {
    zlib: { level: 9 } // 设置压缩级别
  })

  // 存档警告
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.warn('stat故障和其他非阻塞错误')
    } else {
      throw err
    }
  })
  // listen for all archive data to be written 
  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
    selectedBuildPlatform(platform, buildType)
  });
  // 存档出错
  archive.on('error', function (err) {
    throw err
  })
  archive.pipe(output);

  // 从子目录追加文件并将其命名为“新子dir”在存档中

  let pwd = shell.pwd().split(path.sep).join('/');
  if(result.config.startPage.indexOf("http") != -1){
    fs.copySync("./app/css/themes/", "./" + projectName + "/www/css/themes/");
  }else{
    fs.copySync("./app/", "./" + projectName + "/www/");
  }
  fs.copySync("./project.json", "./" + projectName + "/www/config.json");
  var dir = "./" + projectName + "/www/";

  archive.directory(dir, projectName + "/www/")
  archive.finalize();

}



/**
 * MTL工程 提交远程仓库
 * 
 */
function commitAndPushConfigFile() {

  if (!fs.existsSync(".git")) {
    return utils.reportError("未找到远程git仓库 ,请执行: mtl pushRemote 命令创建远程代码托管后，再进行build。  ");
  }
  //first commit
  shell.exec("git add -A");
  console.log('执行git commit');

  shell.exec("git commit -m update  -q");
  shell.exec("git push");
  console.log("配置文件更新到云端");
  return utils.SUCCESS;

}

/**
 * 格式化输出JSON对象，返回String
 * @param {String} fileName 
 * @param {String} mbDir 
 */
function unzipSync(fileName, mbDir) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(fileName).pipe(unzip.Extract({
      path: mbDir
    })).on('close', () => {
      console.log('stream close')
      resolve()
    }).on('error', (err) => {
      reject(err)
    })
  })
}


/**
 * 格式化输出JSON对象，返回String
 * @param {JSON} data 
 */
function formatJson(data) {
  let LN = "\r";
  let TAB = "\t";
  var rep = "~";
  var jsonStr = JSON.stringify(data, null, rep)
  var str = "";
  for (var i = 0; i < jsonStr.length; i++) {
    var text2 = jsonStr.charAt(i)
    if (i > 1) {
      var text = jsonStr.charAt(i - 1)
      if (rep != text && rep == text2) {
        str += LN
      }
    }
    str += text2;
  }
  jsonStr = "";
  for (var i = 0; i < str.length; i++) {
    var text = str.charAt(i);
    if (rep == text)
      jsonStr += TAB;
    else {
      jsonStr += text;
    }
    if (i == str.length - 2)
      jsonStr += LN
  }
  return jsonStr;
}


module.exports = mtlBuild;

