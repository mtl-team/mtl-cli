const inquirer = require("inquirer");
const allPluginFile = require("../res/plugin.json");
const allUPesnPluginFile = require("../res/upesnPlugin.json");
const utils = require("./m_util.js");
const mtldev = require("mtl-dev-sdk");
const fse = require('fs-extra');
const shell = require("shelljs");
const promptList = [
  {
    type: "list",
    message: "请选择你要添加的插件:",
    name: "pluginId",
    choices: allPluginFile,
    filter: function(val) {
      return val;
    }
  }
];
function addPlugin(pluginName) {
  if (!utils.isMtlProject()) {
    return;
  }

  // if (pluginName) {
    mtldev.serchPlugins({ pluginId: pluginName }, res => {
      if (res.code == 200) {
        let plugins = res.data.plugins || [];    
        // utils.consoleLog(`cli : ${JSON.stringify(plugins)}`);    
         selectPlugin(plugins);
      } else {
        utils.consoleLog(`cli : ${JSON.stringify(res)}`);
      }
    });
    return;
  // }

  // var proj = JSON.parse(fse.readFileSync("./project.json").toString());
  // if(proj.config.sourceType=="default"){
  //   promptList[0].message ="请选择插件模板:upesnPlugin是代表友空间壳插件；mtlPlugin是代表mtl默认插件。",
  //   promptList[0].name = "pluginMode",
  //   promptList[0].choices = ["upesnPlugin", "mtlPlugin"];
  //   inquirer.prompt(promptList).then(answers => {
  //     let sourceType = answers.pluginMode;
  //     utils.consoleLog("pluginMode=="+sourceType);
  //    // 更新project.json 文件的构建来源
  //    proj.config.sourceType= sourceType;
  //    fse.writeFileSync("./project.json", formatJson(proj),{flag:'w',encoding:'utf-8',mode:'0666'});
  //    selectPluginJsonFile(sourceType);
  //   });
  // }else{
  //   var tempProj = JSON.parse(fse.readFileSync("./project.json").toString());
    
  //   selectPluginJsonFile(tempProj.config.sourceType);
  // }
 
}

function selectPluginJsonFile(sourceType) {
  utils.consoleLog("sourceType=="+sourceType);
  if(sourceType !="upesnPlugin"){
    selectPlugin(allPluginFile);
  }else{
    selectPlugin(allUPesnPluginFile);
  }
}


function formatJson(data) {
  return JSON.stringify(data,null,4);
}

function selectPlugin(plugins) {
  utils.consoleLog(`plugins size : ${plugins.length}`);
  if (!plugins || plugins.length <= 0) return utils.consoleLog("没有可用模板");
  let _newPlugins = plugins.map(item => {
    let { pluginId, pluginId: id, userId: owner ,version: version} = item;
    const newItem = {
      name: pluginId,
      value: {
        id,
        version ,
        name: item.name || pluginId,
        owner,
        parameters: JSON.parse(item.parameters.toString()) || [],
        description: item.description || ""
      }
    };

    // console.log("new: ", newItem);
    return newItem;
  });
  // console.log("_newPlugins: ", _newPlugins);
  promptList[0].choices = _newPlugins;
  promptList[0].message ="请选择你要添加的插件:",
  promptList[0].name = "pluginId",
  inquirer.prompt(promptList).then(answers => {
    let name = answers.pluginId;
    // utils.consoleLog("---answers.pluginId:"+JSON.stringify(name));

    let ret = mtldev.setMTLPlugin(name);
    utils.consoleLog("setMTLPlugin"+ret);
    // utils.consoleLog("操作完成");
    // 异步下载插件的JS文件到工程中 ，做用户调试使用 .
    mtldev.downloadPluginJS(name,shell.pwd().toString());
  });
}

module.exports = {
  addPlugin
};
