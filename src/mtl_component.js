const fs = require('fs-extra');
const xml2js = require('xml2js');
const utils = require('./mtl').Utils;
const shell = require('shelljs');

const inquirer = require('inquirer');

const SUCCESS = "success";

const promptList = [{
    type: 'list',
    message: '请选择你要添加的组件:',
    name: 'name',
    choices: [
        "compat",
        "file",
        "http",
        "camera",
        "zbar",
        "device",
        "upload",
        "sqlite",
    ],
    filter: function (val) { // 使用filter将回答变为小写
        return val.toLowerCase();
    }
}];

var addComponent = function (name) {
    if(name){
        
        console.log('选择组件名称'+name);
        addComponentBegin(name);
    }else{
        console.log('选择组件开始');
        inquirer.prompt(promptList).then(answers => {
            console.log('您选择了：'+answers.name+' 组件'); // 返回的结果
            
            let name = answers.name; 
            // if(!name) {
            //     return utils.reportError("请输入新的组件，使用mtl plugin list查看组件");
            // }
            addComponentBegin(name);
        });
    }

    
}

var addComponentBegin = function (name) {

    let projFile = './project.json';
    let rs = addImportToJson(projFile, name);
    if(rs == SUCCESS) {

        let message = '添加组件：'+name;
        shell.exec("git add project.json app/config.xml");
        console.log('执行git commit');
        //shell.exec("git status");
        shell.exec("git commit -m " + message + ' -q');

        shell.exec("git push");
        
        console.log("添加 "+ name +" 组件成功");
    }
    
}

function addImportToJson(projfile, name) {
    
    var proj = JSON.parse(fs.readFileSync(projfile).toString());
    var app =proj["config"];
    if(!app) app = {};
    if(!app["cordovaPlugins"]){
        console.log('请检查config.json,缺少cordovaPlugins');
        return;
    };

    let tplLibs = require("../res/plugin.json");
    let tplItem = tplLibs[name];
    
    if(!tplItem) {
        console.log("无效的插件名称 - " + name);
        console.log("您可以使用下面的命令查看支持的插件名称, 或者输入 mtl ac 进行选择添加。");
        console.log("mtl plugin list");
        return ;
    }
    console.log(tplItem.url);
    let pluginName = tplItem.url;

    var importList = app["cordovaPlugins"].cordovaPlugin;
    console.log('importList[0]'+importList[0]);
    if(importList[0]){
		for(index in importList) {
			var item = importList[index].name;
			if(pluginName == item){
				console.log(name+' 组件已存在');
				return;	
			}
		}
	}else{
		if(importList.length){
			console.log('请检查config.json');
			return;	
		}
	}
    
    importList.push({
		"name": pluginName,
		"type": "cordova"
	});
    app["cordovaPlugins"].cordovaPlugin = importList;

    //回写
    proj["config"] = app;
    fs.writeFileSync(projfile, formatJson(proj),{flag:'w',encoding:'utf-8',mode:'0666'});

    //修改config.xml
    // let xmlFile = "./app/config.xml";
    // let builder = new xml2js.Builder();
    // let xml = builder.buildObject(proj);
    // fs.writeFileSync(xmlFile, xml,{flag:'w',encoding:'utf-8',mode:'0666'});

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

exports.addComponent = addComponent