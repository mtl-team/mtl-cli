const shell = require('shelljs');
const fse = require('fs-extra');// fs-extra 扩展包
const xml2js = require('xml2js');
const mtlGit = require("./mtl_git");
const utils = require('./mtl').Utils;
const inquirer = require('inquirer');
var path = require('path');

const configFile = require('./config');
const Configstore = require('configstore');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);
const mtlConfig = require('./mtl_config');
var unzip = require("unzip-stream");

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


/**
 * MTL工程 验证工程名称是否正确
 * @param {String} projectName 
 * 
 */
function isVerifyProjectName(projectName) {
    var patrn=/^[A-Za-z0-9]{1,64}$/; 
    if(patrn.exec(projectName)&& projectName.length <= 64){
        return 'true';
    }else{
        return 'false';
    }
}
//an == appname
//tl = template name
var createApp = async function (an,tl) {

    if(!an) {
        return utils.reportError(" 必须录入工程名称 ，例如 ：mtl c demo");
    }

    if(isVerifyProjectName(an)=='false') {
        return utils.reportError("工程名称不能包含特殊字符，长度不能超过64位。");
    }

    if(fse.existsSync(an)){
      
        return utils.reportError("本地已存在- "+ an +" -工程 ,同一目录下工程不能重名！！！");
    }
    if(conf.get('username')){
        //开发者中心
        let tempNameList = await getTempList();
        // console.log('tempNameList:'+tempNameList);
        promptList[0].choices = tempNameList;

        let template = '';
        let appname = an;
        console.log("创建工程 - "+appname);
        if(tl){
            template = tl;
            //判断模板是否存在
            if(tempNameList.indexOf(template) === -1) {
                console.log("无效的模板名称 - " + template);
                return utils.reportError();
            }

            console.log('选用模板名称'+template);
            //创建应用
            downloadDevTemp(appname,template);
        }else{
            //命令行获取
            inquirer.prompt(promptList).then(answers => {
                console.log('选用模板名称：'+ answers.name); // 返回的结果
                template = answers.name;
                downloadDevTemp(appname,template);

            });
        }

        return;

    }else{
        //轻量级
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

}

/**
 * MTL工程 开发者中心版  创建工程前准备
 * @param {String} appname 
 * @param {String} template 
 * 
 */
var downloadDevTemp = async function (appname,template) {

    console.log("开始创建名称为 - " + appname + " - 的工程");

    if(fse.existsSync(template+ "/project.json")){
        console.log('本地存在 '+ template +' 模板....');
        
    }else{

        if(fse.existsSync(template)){
            console.log('error: 当前位置存在 '+template+' 目录，与模板名称冲突,请检查本地文件。');
            return;
        }
        // 开始下载
        await mtlConfig.download({
            url: 'http://cloudcoding.dev.app.yyuap.com/codingcloud/genweb/downloadIuapFe?projectCode='+ template
            }, function(){
                // console.log('1111');
                (async function (){

                    await fse.createReadStream(template+'.zip').pipe(unzip.Extract({ path: './' 
                    })).on('close', () => {
                        console.log('解压完成...')
                        fse.removeSync(template+'.zip');
                        createDevPro(appname, template);
                    }).on('error', (err) => {
                        console.log(err);
                    })
                })()
                
            },template+'.zip');
        console.log('下载完成');
        
        return;
    }
    createDevPro(appname,template);
}

/**
 * MTL工程 开发者中心版  创建工程
 * @param {String} appname 
 * @param {String} template 
 * 
 */
var createDevPro = function (appname,template) {

    //创建文件夹
    fse.ensureDirSync(appname);
    //复制模板文件到工程   fse.copySync('/tmp/myfile', '/tmp/mynewfile');
    //需要这些文件和目录存在
    fse.copySync('./'+template+ '/app', appname +'/app');
    fse.copySync('./'+template+ '/project.json', appname+'/project.json' );
    console.log('拷贝文件 success');

    console.log("3、开始修改本地配置 - " + appname);
    updateConfig(appname);

}

/**
 * MTL工程 更新配置
 * @param {String} projfile 
 * @param {String} gitUrl 
 * 注：用户自己上传代码，不提供代码托管。
 */

var configGitUrl = function (gitUrl) {
    
    if(!gitUrl){
        console.log('输入gitUrl, eg: mtl gitUrl https://gogs.yonyoucloud.com/caiyi/mtl.git');
        return;       
    }

    if(fse.existsSync("./project.json")){
        let projfile = './project.json';
        let result = changeTheGit(projfile, gitUrl);
        if(result === utils.SUCCESS){

            console.log('修改url 成功！');
        }
    }else{

        console.log('未找到project.json，请执行cd命令进入工程目录。');
        return;
    };

}

var hasTemplet = function (template) {
    return fse.existsSync(template+ "/project.json");
}



/**
 * MTL工程 个人版  创建工程前准备
 * @param {String} appname 
 * @param {String} template 
 * 
 */
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

        if(fse.existsSync(template)){
            console.log('error: 当前位置存在 '+template+' 目录，与模板名称冲突,请检查本地文件。');
            console.log('创建工程失败。');
            return;
        }
        let rs = downloadTemplate(appname, template);
        if(rs != SUCCESS) {
            return;
        }
    }

    //创建文件夹
    fse.ensureDirSync(appname);
    //复制模板文件到工程   fse.copySync('/tmp/myfile', '/tmp/mynewfile');
    //需要这些文件和目录存在

    fse.copySync('./'+template , appname );
    // fse.renameSync('./'+template , appname );
    fse.removeSync(appname+"/.git"); 
    fse.removeSync(appname+"/.gitignore"); 
    fse.removeSync(appname+"/LICENSE"); 
    //fse.copySync('./'+template+ '/.debug', appname +'/.debug');
    // 删除模板文件
    fse.removeSync(template);

    console.log("开始修改本地配置 - " + appname);
    updateConfig(appname);

    console.log("初始化调试环境 - " + appname);
    shell.exec("cd ./" + appname);
    shell.exec("npm --save install express")
    shell.exec("cd ..");

}


/**
 * MTL工程 js 接口  创建工程前准备
 * @param {String} appname 
 * @param {String} template 
 * 
 */
// var createBeginApi = function (appname, template, workSpace) {
/**
 * react 
 * vue
 * h5
 * @param {*} paramData 
 */
var createBeginApi = function (paramData) {
    
    var appname = paramData.appName;
    var projectName = paramData.projectName;
    var template = paramData.template;
    var workSpace = paramData.workSpace;
    var projectType = paramData.project;
    var result = [];
    if (projectType === "vue") {
      result.push("1");
      result.push(`目前不支持当前工程类型: ${projectType}`);
      return result;
    }

    //判断模板是否存在
    shell.exec("cd " + workSpace);
    let tplItem = tplLibs[template];
    if (!tplItem) {
        console.log("无效的模板名称 - " + template);
        console.log("您可以先不输入模板名称，在交互中选择工程模板。");
        result.push("1");
        result.push(`当前模板${template},正在开发中....请期待`);
        return result;
    }

    console.log("开始创建名称为 - " + projectName + "- 的工程");


    if (fse.existsSync(template)) {
        console.log('error: 当前位置存在 ' + template + ' 目录，与模板名称冲突,请检查本地文件。');
        console.log('创建工程失败。');
        result.push("1");
        result.push("当前位置已经存在工程目录与模板名称冲突，创建失败。");
        return result;
    }

    if (conf.get('localResource') == "true") {
        try {
            fse.copySync(configFile.CONFIG_PROJECT_TEMPLATE_PATH + template, projectName);
        } catch (e) {
            console.log(e);
            result.push("1");
            result.push("模板本地拷贝创建失败。 " + e);
            return result;
        }
    } else {
        try {
            let tplLibs = require("../res/templates.json");
            let tplItem = tplLibs[template];
            var appDir = workSpace + '/' + template;
            if(utils.isWindows()){
                // win 
                console.log("WIN 系统");
                appDir = workSpace + '\\' + template;
            }else{
                // mac
                console.log("MAC 系统");
                
                appDir = workSpace + '/' + template;
                

            }

            console.log("mtl git url - " + gitClone + tplItem.url);
            shell.exec(gitClone + tplItem.url + " --progress " + appDir);

            //创建文件夹
            if (fse.existsSync(workSpace + '/' + projectName)){
                // 删除模板文件
                fse.removeSync(workSpace + '/' + template);
                result.push("1");
                result.push("工作空间中已经存在该工程，工程名称重名，创建失败！！！");
                return result;
            }

            fse.ensureDirSync(workSpace + '/' + projectName);
        
            //需要这些文件和目录存在
            fse.copySync(workSpace + '/' + template , workSpace + '/' + projectName );

            fse.removeSync(workSpace + '/' +projectName+"/.git"); 
            fse.removeSync(workSpace + '/' +projectName+"/.gitignore"); 
            fse.removeSync(workSpace + '/' +projectName+"/LICENSE"); 
            // 删除模板文件
            fse.removeSync(workSpace + '/' + template);
        } catch (e) {
            console.log(e);
            result.push("1");
            result.push("模板下载报错，创建失败。");
            return result;
        }
    }

    console.log("开始更新本地配置 - " + projectName);
    // updateConfig(workSpace + "/" + appname);
    
    console.log("初始化调试环境 - " + projectName);
    console.log("--本地创建完成--先执行 cd " + projectName + " 进入目标目录--");
    shell.exec("cd  " + workSpace + '/' + projectName);
    shell.exec("npm --save install express")
    shell.exec("cd ..");


    var projfile = workSpace + '/' + projectName+ '/project.json';
            if(utils.isWindows()){
                // win 
                console.log("WIN 系统");
              
                projfile = workSpace + '\\' + projectName+ '\\project.json';
            }else{
                // mac
                console.log("MAC 系统");
                
                projfile = workSpace + '/' + projectName+ '/project.json';
                

            }


    var proj = JSON.parse(fse.readFileSync(projfile).toString());
    var app =proj["config"];

    //处理基本属性
    
    if(paramData.bundleId!=undefined){
        app["bundleID"]= paramData.bundleId;
    }
    if(paramData.packageName!= undefined){
        app["packageName"]= paramData.packageName;
    }
    if(paramData.version!= undefined){
        app["versionName"]=paramData.version;
    }
    app["projectName"]=projectName;
    app["appName"] = appname;
    
    //回写
    proj["config"] = app;
    
    fse.writeFileSync(projfile, formatJson(proj),{flag:'w',encoding:'utf-8',mode:'0666'});

    if (fse.existsSync(workSpace + "/" + projectName)) {
        result.push("0");
        result.push(workSpace + "/" + projectName);
        return result;
    } else {
        result.push("1");
        result.push("工程目录创建失败。");
        return result;
    }
}




/**
 * MTL工程 更新配置
 * @param {String} appname 
 * @param {String} gitUrl 
 * 
 */
function updateConfig(appname) {

    fse.exists(appname,function (exists) {
        if(exists){

            shell.cd(appname);   //进入工程目录操作
            let projFile = "./" + PROJECT_FILE;
            let rs = changeTheAppName(projFile, appname); //x修改配置文件
            if(rs == SUCCESS) { 
                console.log("更新配置success");
                console.log("--本地创建完成--先执行 cd "+ appname +" 进入目标目录--");
                
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
    var proj = JSON.parse(fse.readFileSync(projfile).toString());
    var app =proj["config"];
    if(!app) app = {};
    //处理基本属性
    app["appName"] = appname;
    let packageName = appname.toLowerCase();
    app["packageName"]= "com.yonyou."+packageName;
    app["projectName"]=appname;

    //回写
    proj["config"] = app;

    fse.writeFileSync(projfile, formatJson(proj),{flag:'w',encoding:'utf-8',mode:'0666'});
    
    //修改config.xml
    // let xmlFile = "./app/" + CONFIG_XML;

    // var builder = new xml2js.Builder();
    // var xml = builder.buildObject(proj);

    // fse.writeFileSync(xmlFile, xml,{flag:'w',encoding:'utf-8',mode:'0666'});
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


function formatJson(data) {
    return JSON.stringify(data,null,4);
}

/**
 * 格式化输出JSON对象，返回String
 * @param {JSON} data 
 */
function formatJson2(data) {
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
    if(!fse.existsSync("project.json")){
        console.log('请进入要提交的工程目录进行操作，执行 cd appname');
        return;
    }
    if(fse.existsSync(".git")){
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
            //复制模板文件到工程   fse.copySync('/tmp/myfile', '/tmp/mynewfile');
            //需要这些文件和目录存在
            if(!fse.existsSync("tempDir/.git")){
                console.log('gitClone 失败，请检查。');
            }

            fse.copySync('tempDir/.git', './.git');
            console.log('拷贝文件 success');

            fse.removeSync('tempDir');   //移除
			
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
    var proj = JSON.parse(fse.readFileSync(projfile).toString());
    var app =proj["config"];
    if(!app) app = {};
   
    if(!gitUrl) return utils.reportError("未找到远程仓库git - " + gitUrl);
    app.gitUrl= gitUrl;
    //回写
    proj["config"] = app;

    fse.writeFileSync(projfile, formatJson(proj),{flag:'w',encoding:'utf-8',mode:'0666'});
    
    //修改config.xml
    // let xmlFile = "./app/" + CONFIG_XML;

    // var builder = new xml2js.Builder();
    // var xml = builder.buildObject(proj);

    // fse.writeFileSync(xmlFile, xml,{flag:'w',encoding:'utf-8',mode:'0666'});
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

    if(fse.existsSync(appname)) {    //截取工程目录
        console.log("本地已存在目录："+ appname +"，请检查目录。");
        return utils.reportError("执行： dir 查看：");
    }

    console.log("开始执行...");
    shell.exec(gitClone + url);
    console.log("操作完成...");
    console.log("执行 cd 工程名  进入工程目录");
}

async function  getTempList(){
    console.log('w');
    let sendResultList = await mtlConfig.send({ url: 'http://cloudcoding.dev.app.yyuap.com/codingcloud/gentplrepweb/list/mtl', method: 'get' });
    //console.log(sendResultList);
    sendResultList = JSON.parse(sendResultList);
    let tempInfo = sendResultList.detailMsg.data.content;
    var tempNameList = [];
    if(tempInfo.length){
        for(var i=0;i<tempInfo.length;i++){
            tempNameList.push(tempInfo[i].tplRepName);
        }
        // console.log(tempNameList);
        return tempNameList;
    }else{

        return [];
    }

}
//createApp("xxxx","");

exports.createApp = createApp
exports.pushRemote = pushRemote
exports.configGitUrl = configGitUrl
exports.test = formatJson
exports.createBeginApi = createBeginApi