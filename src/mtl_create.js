const shell = require('shelljs');
const fs = require('fs-extra');// fs-extra 扩展包
const xml2js = require('xml2js');
const mtlGit = require("./mtl_git");

const utils = require('./src').Utils;
const inquirer = require('inquirer');

// exports.MTLCreate = MTLCreate;
const gitClone = "git clone ";
const SUCCESS = "success";
const INIT = "init";
const PROJECT_FILE="project.json";
const CONFIG_XML="config.xml";

const promptName = [{
    type: 'input',
    message: '给你的新工程起一个名字:',
    name: 'name',
    default: "默认:testMtl" ,// 默认值
    filter: function (val) { // 使用filter将回答变为小写
        return val.toLowerCase();
    }
}];

const tplLibs = require("../res/templates.json");

const promptList = [{
    type: 'list',
    message: '请选择工程模板:',
    name: 'name',
    choices: [
        "empty",
        "ERP",
    ],
    filter: function (val) { // 使用filter将回答变为小写
        return val.toLowerCase();
    }
}];


//an == appname
//tl = template name
var createApp = function (an,tl) {
    if(!an) {
        console.log("必须录入工程名称")
        return utils.reportError("mtl create appname");
    }
    promptList[0].choices = tplLibs.names;
    console.log("创建工程 - "+an);
    if(tl){
        console.log('选用模板名称 - '+ tl);
        //创建应用
        createBegin(an,template);
    }else{
        //命令行获取
        inquirer.prompt(promptList).then(answers => {
            console.log('选用模板名称 - '+ answers.name); // 返回的结果
            createBegin(an,answers.name);
        });
    }
}

var createBegin = function (appname,template) {
    //判断模板是否存在
    let tplItem = tplLibs[template];
    if(!tplItem) {
        console.log("无效的模板名称 - " + template);
        console.log("您可以使用下面的命令查看支持的模板名称");
        console.log("mtl template list");
        return utils.reportError();
    }

    console.log("开始创建名称为 - " + appname + "- 的工程");
    //if 存在 
    if(hasTemplet(template)){
        console.log('本地存在 '+ template +' 模板....');
        console.log('检查更新..');
        //更新模板
        shell.cd(template);
        shell.exec('git pull');
        shell.cd('../');
        
        
    }else{

        if(fs.existsSync(template)){
            console.log('error: 当前位置存在 '+template+' 目录，与模板名称冲突,请检查本地文件。');
            console.log('创建工程失败。');
            return;
        }
        let rs = downloadTemplate(appname, template);
        if(rs != SUCCESS) {
            return;
        }
    }

    console.log("2、开始创建远程仓库 - " + appname);

    mtlGit.repo(appname,'readme',function(gitUrl) {
        //console.log("--mtl_creat:-success-"+gitUrl);
        if(!gitUrl) {
            utils.reportError("远程仓库创建失败，可能已存在该工程导致，请检查git 是否存在项目： "+ appname +' 建议更换工程名重新创建。');
            //createApp();
            inquirer.prompt(promptName).then(app => {
                console.log('创建工程名称：'+app.name); // 返回的结果
                let reName = app.name;
                createBegin(reName,template);
            });

        }else{

            shell.exec(gitClone + gitUrl);
            //复制模板文件到工程   fs.copySync('/tmp/myfile', '/tmp/mynewfile');
            //需要这些文件和目录存在
            fs.copySync('./'+template+ '/app', appname +'/app');
            //fs.copySync('./'+template+ '/.debug', appname +'/.debug');
            fs.copySync('./'+template+ '/project.json', appname+'/project.json' );
            console.log('拷贝文件 success');

            console.log("3、开始修改本地配置 - " + appname);
            updateConfig(appname, gitUrl);
        }
    });
}

var hasTemplet = function (template) {
    return fs.existsSync(template+ "/project.json");
}

/**
 * 从Summer应用转为MTL工程
 * @param {String} appname 
 * @param {*} sourcePath 
 */
var importApp = function(appname, sourcePath) {
    let projPath = "./" + appname + "/"
    let cmd = "yes | cp -rf " + sourcePath + " " + projPath;
    console.log("开始导入工程 - " + sourcePath);
    console.log("请耐心等待……");
    shell.exec(cmd);    //复制工程到本地
    loadConfigXml(sourcePath, function(data) {
        let projFile = projPath + PROJECT_FILE;
        console.log(projFile);
        fs.writeFile(projFile, JSON.stringify(data), function(err) {
            if(err) {
                return utils.reportError(err);
            }
            let rs = changeTheAppName(projFile, appname);
            if(rs == SUCCESS) {
                console.log("导入工程成功");
            }
        });
    })
}

/**
 * MTL工程 更新配置
 * @param {String} appname 
 * @param {String} gitUrl 
 * 
 */
function updateConfig(appname, gitUrl) {

    fs.exists(appname,function (exists) {
        if(exists){

            shell.cd(appname);   //进入工程目录操作
            let projFile = "./" + PROJECT_FILE;
            let rs = changeTheAppName(projFile, appname, gitUrl); //x修改配置文件
            if(rs == SUCCESS) { 
                console.log("更新配置success");
                console.log("----4-开始提交git-----");
                commitAndPush(gitUrl, appname);
            }
        }else {
            return utils.reportError("模板下载失败，请检查您的网络是否正常");
        } }
    );
    
}

/**
 * MTL工程 更新配置
 * @param {String} appname 
 * @param {String} gitUrl 
 * 
 */

function changeTheAppName(projfile, appname, gitUrl) {
    var proj = JSON.parse(fs.readFileSync(projfile).toString());
    var app =proj["config"];
    if(!app) app = {};
    //处理基本属性
    app["appName"] = appname;
    let packageName = appname.toLowerCase();
    app["packageName"]= "com.yonyou."+packageName;
    app["projectName"]=appname;

    if(!gitUrl) return utils.reportError("未找到远程仓库git - " + gitUrl);
    app.gitUrl= gitUrl;
    //回写
    proj["config"] = app;

    fs.writeFileSync(projfile, formatJson(proj),{flag:'w',encoding:'utf-8',mode:'0666'});
    
    //修改config.xml
    let xmlFile = "./app/" + CONFIG_XML;

    var builder = new xml2js.Builder();
    var xml = builder.buildObject(proj);

    fs.writeFileSync(xmlFile, xml,{flag:'w',encoding:'utf-8',mode:'0666'});
    return utils.SUCCESS;
}

/**
 * MTL工程 提交远程仓库
 * @param {String} gitUrl 
 * 
 */
function commitAndPush(gitUrl, appname) {

    let pwd = shell.pwd();
    console.log('当前路径：'+pwd);
    if(!gitUrl) return utils.reportError("未找到远程仓库git - " + gitUrl);

    //first commit
    shell.exec("git add -A");
    console.log('执行git commit');
    let message = 'firstcommit';
    //shell.exec("git status");
    shell.exec("git commit -m " + message +' -q');

    shell.exec("git push");

    console.log("初始化完成，本地创建成功");
    console.log("请执行 cd "+ appname +" 命令进入工程目录,开发此移动工程。");
    return SUCCESS;
}

function loadConfigXml(sourcePath, callback) {
    let option = { 
        "explicitArray" : false,
        "attrkey" :"props",
        "charkey" :"content",
        "trim":true,
        "ignoreAttrs" : false };
    fs.readFile(sourcePath + '/config.xml', function(err, data) {
        if(err) {
            return utils.reportError(sourcePath + "不是一个Summer工程");
        }
        var parseString = require('xml2js').parseString;
        parseString(data, option, function (err, result) {
            if(err) {
                return utils.reportError(err);
            } else {
                callback(result);
            }
        });
    });
}

//下载工程模版
function downloadTemplate(appname, template) {

    console.log("开始下载工程模板 - " + template);
	let tplLibs = require("../res/templates.json");
    let tplItem = tplLibs[template];
    let appDir = './'+template;

    console.log("mtl git url - " + gitClone + tplItem.url);
    shell.exec(gitClone + tplItem.url + " --progress "+appDir);
    return utils.SUCCESS;
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

exports.createApp = createApp
exports.importApp = importApp
