const shell = require('shelljs');
const fs = require('fs-extra');
const utils = require('./mtl').Utils;
const inquirer = require('inquirer');

const configFile = require('./config');
const Configstore = require('configstore');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);
const mtlConfig = require('./mtl_config');
const path = require('path');
const gitClone = "git clone ";
const TPL_NAME = "__template_name";
const tplCachePath = "../tpl_caches";
const UPDATE_TEMPLATE = "update-template";
var unzip = require("unzip-stream");
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

var addView = async function (name, tplname) {
    console.log("添加页面");
    if (!utils.isProject()) {
        return utils.reportError("添加失败，请执行: cd 工程目录名 进入工程目录操作。");
    }
    if (!name) {
        console.log("必须输入添加页面的名称")
        return utils.reportError("mtl add-page name [template_name]");
    }

    if (conf.get('username')) {
        //开发者中心
        if (!tplname) {
            let tempNameList = await getTempList();
            promptList[0].choices = tempNameList;
            inquirer.prompt(promptList).then(answers => {
                downloadDevPageTemp(name, answers.name);
            });
        } else {
            downloadDevPageTemp(name, tplname);
        }
    } else {



        if (conf.get('localResource') == "true") {

            let pwd = shell.pwd().split(path.sep).join('/');
            let pageTemplatePath = pwd + "/" + tplCachePath;
            fs.copySync(configFile.CONFIG_PAGE_TEMPLATE_PATH, pageTemplatePath);

        } else {
            //开始下载模板页面
            if (name == UPDATE_TEMPLATE) {
                return downloadPageTemplate(true);
            } else {
                downloadPageTemplate(false);
            }
        }

        if (!tplname) {
            let tpls = fs.readdirSync(tplCachePath);
            promptList[0].choices = tpls;
            inquirer.prompt(promptList).then(answers => {
                addPage(name, answers.name);
            });
        } else {
            addPage(name, tplname);
        }
    }

}

//开始根据模版添加页面
function addPage(name, tplname) {
    let tplPath;
    if (conf.get('username')) {
        //开发者中心
        tplPath = "tpl_cache/" + tplname;
    } else {
        tplPath = tplCachePath + "/" + tplname;
    }


    if (!fs.existsSync(tplPath)) {
        console.log("页面路径 - " + tplPath);
        return utils.reportError("模版 " + tplname + " 没有找到");
    }
    console.log("开始添加模版 - " + tplname);
    copyTplDir(name, tplPath, ".");
}

function copyTplDir(name, path, objPath) {
    console.log("[目录]" + objPath);
    fs.readdir(path, function (err, files) {
        if (err) {
            return utils.reportError("错误 - " + err);
        }
        for (index in files) {
            // console.log(index + " - " + files[index]);
            let item = files[index];
            let newPath = path + "/" + item;
            let stat = fs.lstatSync(newPath);
            if (stat.isDirectory()) {
                copyTplDir(name, newPath, objPath + "/" + replaceToRealName(item, name));
            } else {
                copyTplFile(path, item, objPath, name);
            }
        }
    });
}

let tplExp = new RegExp(TPL_NAME, 'g');

function replaceToRealName(src, newName) {
    return src.replace(tplExp, newName);
}

function copyTplFile(path, filename, objPath, objfilename) {
    let newfn = replaceToRealName(filename, objfilename);
    fs.ensureDirSync(objPath);
    let srcfile = path + "/" + filename;
    let objfile = objPath + "/" + newfn;
    console.log("[文件]" + objfile);
    if (objfile.toLowerCase().endsWith("html")) {
        return copyTplFileX(srcfile, objfile, objfilename);
    }
    if (objfile.toLowerCase().endsWith("js")) {
        return copyTplFileX(srcfile, objfile, objfilename);
    }
    if (objfile.toLowerCase().endsWith("json")) {
        return copyTplFileX(srcfile, objfile, objfilename);
    }
    if (objfile.toLowerCase().endsWith("wxml")) {
        return copyTplFileX(srcfile, objfile, objfilename);
    }
    //let cmd = "cp -rf " + srcfile + " " + objfile;
    //shell.exec(cmd);
    fs.copySync(srcfile, objfile);  //fs替换shell命令
}

function copyTplFileX(srcfile, objfile, objfilename) {
    fs.readFile(srcfile, "utf-8", function (err, data) {
        if (err) {
            console.log(err);
            return utils.reportError("读文件失败 - " + srcfile);
        }
        let ns = replaceToRealName(data.toString(), objfilename);
        fs.writeFile(objfile, ns, function (err) {
            if (err) {
                console.log(err);
                return utils.reportError("写文件失败 - " + objfile);
            }
        });
    });
}


//下载页面模版
function downloadPageTemplate(isUpdate) {
    if (isUpdate) {
        if (fs.existsSync(tplCachePath)) {
            //shell.exec("rm -rf " + tplCachePath); 
            fs.removeSync(tplCachePath);
        }
    }
    if (!fs.existsSync(tplCachePath)) {
        //let gitPageUrl = 'https://gogs.yonyoucloud.com/caiyi/mtlPages.git';   //页面模板地址-可写入配置
        let gitPageUrl = require("../res/configure.json").pages;
        console.log("mtl git url - " + gitClone + gitPageUrl);
        shell.exec(gitClone + gitPageUrl + " --progress " + tplCachePath);
        //shell.exec("rm -rf "+tplCachePath+"/.git");
        fs.removeSync(tplCachePath + "/.git");
        fs.removeSync(tplCachePath + "/.gitignore");
        fs.removeSync(tplCachePath + "/LICENSE");
    }
    return utils.SUCCESS;
}

async function getTempList() {
    console.log('w');
    let sendResultList = await mtlConfig.send({ url: 'http://codingcloud5.dev.app.yyuap.com/codingcloud/gentplrepweb/getStyles?fkGenTplRep=01bbd5b4-248b-49d7-a257-932134e2447d', method: 'get' });
    sendResultList = JSON.parse(sendResultList);
    console.log(sendResultList);
    let tempInfo = sendResultList.detailMsg.data.data;
    var tempNameList = [];
    if (tempInfo.length) {
        for (var i = 0; i < tempInfo.length; i++) {
            tempNameList.push(tempInfo[i].styleName);

        }
        // console.log(tempNameList);
        return tempNameList;
    } else {

        return [];
    }

}
/**
 * MTL工程 开发者中心版  下载模板
 * @param {String} template //页面模板
 * 
 */
var downloadDevPageTemp = async function (name, template) {

    console.log("开始下载名称为 - " + template + " - 的页面");

    if (fs.existsSync(template)) {
        console.log('error: 当前位置存在 ' + template + ' 目录，与模板名称冲突,请检查本地文件。');
        return;
    }
    // 开始下载
    await mtlConfig.download({
        url: 'http://codingcloud5.dev.app.yyuap.com/codingcloud/genweb/downloadPageTemplate?styleCode=' + template
    }, function () {
        // console.log('1111');
        (async function () {

            await fs.createReadStream('./' + template + '.zip').pipe(unzip.Extract({
                path: './tpl_cache/'
            })).on('close', () => {
                console.log('解压完成...')
                fs.removeSync(template + '.zip');
                addPage(name, template);
                return;
            }).on('error', (err) => {
                console.log(err);
            })
        })()

    }, template + '.zip');
    console.log('下载完成');

}
//addView("xcv",null);
exports.addView = addView