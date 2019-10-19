const inquirer = require('inquirer');
const allPluginFile = require("../res/plugin.json");
const utils = require("./m_util.js");
const mtldev = require("mtl-dev-sdk");


const promptList = [{
    type: 'list',
    message: '请选择你要添加的插件:',
    name: 'name',
    choices: [],
    filter: function (val) {
        return val;
    }
}];

function addPlugin(){
    if(!utils.isMtlProject()){
        return;
    }
    let addPlugin = Object.keys(allPluginFile);
    if(!addPlugin){
        return utils.consoleLog("没有可添加插件");
    }
    promptList[0].choices = addPlugin;
    promptList[0].default = Object.keys(allPluginFile)[0];
    inquirer.prompt(promptList).then(answers => {
        let name = answers.name;
        utils.consoleLog(name)
        let ret = mtldev.setMTLPlugin(allPluginFile[name]);
        utils.consoleLog(ret)
        utils.consoleLog("添加成功")


    })

}

module.exports = {
    addPlugin
  };