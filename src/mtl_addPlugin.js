const fs = require('fs-extra');
const xml2js = require('xml2js');
const utils = require('./mtl').Utils;
const shell = require('shelljs');
const path = require('path');
const inquirer = require('inquirer');
const allPluginFile = require("../res/plugin.json");
const SUCCESS = "success";
var defaultPlugins = [];
var allPlugins = [];
const promptCheckbox = [{
    type: 'checkbox',
    message: '请选择你要添加的插件:',
    name: 'checkbox',
    choices: allPlugins,
    default: defaultPlugins,
    filter: function (val) {
        return val;
    }
}];

var addPlugin = function () {
    if (!utils.isProject()) {
        return utils.reportError("不是MTL工程目录")
    }
    var result = JSON.parse(fs.readFileSync("./project.json").toString());

    var defPlugins = result.config.cordovaPlugins;
    if (defPlugins.length) {
        for (var i = 0; i < defPlugins.length; i++) {
            defaultPlugins.push(defPlugins[i].name);
        }
    }
    console.log('已选插件：' + defaultPlugins);


    if (allPluginFile.cordovaPlugins.length) {
        for (var i = 0; i < allPluginFile.cordovaPlugins.length; i++) {
            allPlugins.push(allPluginFile.cordovaPlugins[i].name);
        }
        console.log('所有插件：' + allPlugins);
    } else {
        console.log("插件文件读取为空！！！");
    }

    inquirer.prompt(promptCheckbox).then(answers => {

        let name = answers.checkbox;

        addPluginBegin(name);
    });


}

var addPluginBegin = function (name) {

    let projFile = './project.json';
    let rs = addPluginsToJson(projFile, name);
    if (rs == SUCCESS) {
        console.log("添加插件成功");
    }

}

function pluginItem(name, type, parameters) {
    this.name = name;
    this.type = type;
    this.parameters = parameters;
}

pluginItem.prototype = {
    constructor: pluginItem,
};

function addPluginsToJson(projfile, name) {

    var proj = JSON.parse(fs.readFileSync(projfile).toString());
    var app = proj["config"];
    if (!app) app = {};
    if (!app["cordovaPlugins"]) {
        console.log('请检查config.json,缺少cordovaPlugins');
        return;
    };


    var pluginslist = [];
    var indexof;
    for (var i = 0; i < name.length; i++) {
        for (var j = 0; j < allPluginFile.cordovaPlugins.length; j++) {
            if (allPluginFile.cordovaPlugins[j].name == name[i]) {
                var mPluginItem = new pluginItem(
                    allPluginFile.cordovaPlugins[j].name,
                    allPluginFile.cordovaPlugins[j].type,
                    allPluginFile.cordovaPlugins[j].parameters);

                pluginslist.push(mPluginItem);
            }
        }
    }

    app.cordovaPlugins = pluginslist;

    //回写
    proj["config"] = app;
    fs.writeFileSync(projfile, formatJson(proj), { flag: 'w', encoding: 'utf-8', mode: '0666' });

    return SUCCESS;
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

exports.addPlugin = addPlugin