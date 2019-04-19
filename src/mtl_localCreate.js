const shell = require('shelljs');
const fs = require('fs-extra');// fs-extra 扩展包
const xml2js = require('xml2js');
const mtlGit = require("./mtl_git");

const utils = require('./mtl').Utils;
const inquirer = require('inquirer');

var path = require('path');

// exports.MTLCreate = MTLCreate;
const gitClone = "git clone ";
const SUCCESS = "success";
const PROJECT_FILE="project.json";
const CONFIG_XML="config.xml";

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
    console.log('s1');
    if(!an) {
        console.log("必须录入工程名称")
        return utils.reportError("mtl lc appname");
    }
    promptList[0].choices = tplLibs.names;
    let template = '';
    let appname = an;
    console.log("创建工程 - "+appname);
    if(tl){
        template = tl;
        console.log('选用模板名称'+template);
        //创建应用
        createBegin(appname,template);
    }else{
        //命令行获取
        inquirer.prompt(promptList).then(answers => {
            console.log('选用模板名称：'+ answers.name); // 返回的结果
            template = answers.name;
            createBegin(appname,template);
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
    //创建文件夹
    fs.ensureDirSync(appname);
    //复制模板文件到工程   fs.copySync('/tmp/myfile', '/tmp/mynewfile');
    //需要这些文件和目录存在
    fs.copySync('./'+template+ '/app', appname +'/app');
    //fs.copySync('./'+template+ '/.debug', appname +'/.debug');
    fs.copySync('./'+template+ '/project.json', appname+'/project.json' );
    console.log('拷贝文件 success');

    console.log("3、开始修改本地配置 - " + appname);
    updateConfig(appname);

}

var hasTemplet = function (template) {
    return fs.existsSync(template+ "/project.json");
}


/**
 * MTL工程 更新配置
 * @param {String} appname 
 * @param {String} gitUrl 
 * 
 */
function updateConfig(appname) {

    fs.exists(appname,function (exists) {
        if(exists){

            shell.cd(appname);   //进入工程目录操作
            let projFile = "./" + PROJECT_FILE;
            let rs = changeTheAppName(projFile, appname); //x修改配置文件
            if(rs == SUCCESS) { 
                console.log("更新配置success");
                console.log("--本地创建完成--先执行 cd "+ appname +" 进入目标目录--然后执行 mtl pushRemote 上传远程流。--");
                
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

function changeTheAppName(projfile, appname) {
    var proj = JSON.parse(fs.readFileSync(projfile).toString());
    var app =proj["config"];
    if(!app) app = {};
    //处理基本属性
    app["appName"] = appname;
    let packageName = appname.toLowerCase();
    app["packageName"]= "com.yonyou."+packageName;
    app["projectName"]=appname;

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

/**
 * 
 * @param {String} appname 
 */
var pushRemote = function() {

    let appname = '';
    let pwd = shell.pwd();
    let index = pwd.split(path.sep).join('/').lastIndexOf("\/"); 
    appname = pwd.substring(index + 1, pwd.length);
    console.log('开始执行 pushRemote  - appname： '+ appname);

    if(!appname){
        utils.reportError("项目名称： "+ appname +' ，请输入项目名。');
        return;
    }
    if(!fs.existsSync("project.json")){
        console.log('请进入要提交的工程目录进行操作，执行 cd appname');
        return;
    }
    if(fs.existsSync(".git")){
        console.log('本地存在仓库，请检查git');
        return;
    }

    mtlGit.repo(appname,'readme',function(gitUrl) {
        //console.log("--mtl_creat:-success-"+gitUrl);
        if(!gitUrl) {
            utils.reportError("远程仓库创建失败，可能已存在该工程导致，请检查git 是否存在项目： "+ appname +' 建议更换工程名重新创建。');
            return;

        }else{
            //创建完成后  下载。
            console.log(gitUrl);
            
            shell.exec(gitClone + gitUrl + " --progress tempDir");
            //复制模板文件到工程   fs.copySync('/tmp/myfile', '/tmp/mynewfile');
            //需要这些文件和目录存在
            if(!fs.existsSync("tempDir/.git")){
                console.log('gitClone 失败，请检查。');
            }

            fs.copySync('tempDir/.git', './.git');
            console.log('拷贝文件 success');

            fs.removeSync('tempDir');   //移除
			
			let projFile = "./" + PROJECT_FILE;
            let rs = changeTheGit(projFile, gitUrl); //x修改配置文件
            if(rs == SUCCESS) { 
                console.log("git地址写入配置success");
                
            };
            console.log("开始上传更新 - " + appname);
            commitAndPush(gitUrl,appname);
        }
    });
    
}

/**
 * MTL工程 更新配置
 * @param {String} projfile 
 * @param {String} gitUrl 
 * 
 */

function changeTheGit(projfile, gitUrl) {
    var proj = JSON.parse(fs.readFileSync(projfile).toString());
    var app =proj["config"];
    if(!app) app = {};
   
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
 * @param {String} appname
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

    console.log("初始化完成，本地工程提交成功，代码托管。");
	console.log("具体查看git ： "+ gitUrl);
    return SUCCESS;
}

/**
 * MTL工程 多人协同
 * @param {String} url 
 * 
 */
var pullRemote = function (url) {
    if(!url) {
        console.log("必须输入gitUrl");
        return utils.reportError("mtl open gitUrl");
    }
    
    let index = url.split(path.sep).join('/').lastIndexOf("\/"); 
    appnameGit = url.substring(index + 1, url.length);
    appname = appnameGit.substring(0,appnameGit.length-4); //去掉git
    console.log('appname： '+ appname);

    if(fs.existsSync(appname)) {    //截取工程目录
        console.log("本地已存在目录："+ appname +"，请检查目录。");
        return utils.reportError("执行： dir 查看：");
    }

    console.log("开始执行...");
    shell.exec(gitClone + url);
    console.log("操作完成...");
    console.log("执行 cd 工程名  进入工程目录");
}

exports.createApp = createApp
exports.pushRemote = pushRemote
exports.pullRemote = pullRemote
