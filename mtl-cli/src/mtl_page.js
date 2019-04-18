const shell = require('shelljs');
const fs = require('fs-extra');
const utils = require('./mtl').Utils;
const inquirer = require('inquirer');

const gitClone = "git clone ";
const TPL_NAME = "__template_name";
const tplCachePath = "../tpl_caches";
const UPDATE_TEMPLATE = "update-template";

var promptList = [{
    type: 'list',
    message: '请选择页面模板:',
    name: 'name',
    choices: [
        "login",
        "mdd-approve",
        "index",
        "app",
    ],
    filter: function (val) { // 使用filter将回答变为小写
        return val.toLowerCase();
    }
}];

var addView = function (name,tplname) {
    console.log("添加页面");
    if(!utils.isProject()) {
        return utils.reportError("添加失败，请执行: cd 工程目录名 进入工程目录操作。");
    }
    if(!name) {
        console.log("必须输入添加页面的名称")
        return utils.reportError("mtl add-page name [template_name]");
    }
    if(name==UPDATE_TEMPLATE) {
        return downloadPageTemplate(true);
    } else {
        downloadPageTemplate(false);
    }
    if(!tplname) {
        let tpls = fs.readdirSync(tplCachePath);
        promptList[0].choices = tpls;
        inquirer.prompt(promptList).then(answers => {
            addPage(name, answers.name);
        });
    } else {
        addPage(name,tplname);
    }
}

//开始根据模版添加页面
function addPage(name, tplname) {
    let tplPath = tplCachePath + "/"+ tplname;
    if(!fs.existsSync(tplPath)) {
        return utils.reportError("模版 " + tplname + " 没有找到");
    }
    console.log("开始添加模版 - " + tplname);
    copyTplDir(name,tplPath,".");
}

function copyTplDir(name, path,objPath) {
    console.log("[目录]"+objPath);
    fs.readdir(path,function(err,files) {
        if(err) {
            return utils.reportError("错误 - " + err);
        }
        for(index in files) {
            // console.log(index + " - " + files[index]);
            let item = files[index];
            let newPath = path + "/" + item;
            let stat = fs.lstatSync(newPath);
            if(stat.isDirectory()) {
                copyTplDir(name,newPath,objPath+"/" + replaceToRealName(item,name));
            } else {
                copyTplFile(path,item,objPath,name);
            }
        }
    });
}

let tplExp = new RegExp(TPL_NAME,'g');

function replaceToRealName(src, newName) {
    return src.replace(tplExp,newName);
}

function copyTplFile(path,filename,objPath,objfilename) {
    let newfn  = replaceToRealName(filename,objfilename);
    fs.ensureDirSync(objPath);
    let srcfile = path + "/"+filename;
    let objfile = objPath+"/"+newfn;
    console.log("[文件]" + objfile);
    if(objfile.toLowerCase().endsWith("html")) {
        return copyTplFileX(srcfile,objfile,objfilename);
    }
    if(objfile.toLowerCase().endsWith("js")) {
        return copyTplFileX(srcfile,objfile,objfilename);
    }
    if(objfile.toLowerCase().endsWith("json")) {
        return copyTplFileX(srcfile,objfile,objfilename);
    }
    if(objfile.toLowerCase().endsWith("wxml")) {
        return copyTplFileX(srcfile,objfile,objfilename);
    }
    //let cmd = "cp -rf " + srcfile + " " + objfile;
    //shell.exec(cmd);
    fs.copySync(srcfile, objfile);  //fs替换shell命令
}

function copyTplFileX(srcfile,objfile,objfilename) {
    fs.readFile(srcfile, "utf-8",function(err, data) {
        if(err) {
            console.log(err);
            return utils.reportError("读文件失败 - " + srcfile);
        }
        let ns = replaceToRealName(data.toString(),objfilename);
        fs.writeFile(objfile,ns, function(err) {
            if(err) {
                console.log(err);
                return utils.reportError("写文件失败 - " + objfile);
            }
        });    
    });
}


//下载页面模版
function downloadPageTemplate(isUpdate) {
    if(isUpdate) {
        if(fs.existsSync(tplCachePath)) {
            //shell.exec("rm -rf " + tplCachePath); 
            fs.removeSync(tplCachePath); 
        }
    }
    if(!fs.existsSync(tplCachePath)){
        //let gitPageUrl = 'https://gogs.yonyoucloud.com/caiyi/mtlPages.git';   //页面模板地址-可写入配置
        let gitPageUrl = require("../res/configure.json").pages;
        console.log("mtl git url - " + gitClone + gitPageUrl);
        shell.exec(gitClone + gitPageUrl + " --progress "+tplCachePath);
        //shell.exec("rm -rf "+tplCachePath+"/.git");
        fs.removeSync(tplCachePath+"/.git"); 
    }
    return utils.SUCCESS;
}

exports.addView = addView