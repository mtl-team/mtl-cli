const inquirer = require("inquirer");
const allPluginFile = require("../res/plugin.json");
const utils = require("./m_util.js");
const mtldev = require("mtl-dev-sdk");

const promptList = [
  {
    type: "list",
    message: "请选择你要添加的插件:",
    name: "cordovaName",
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
  if (pluginName) {
    mtldev.serchPlugins({ cordovaName: pluginName }, res => {
      if (res.code == 200) {
        let plugins = res.data.plugins || [];
        selectPlugin(plugins);
      } else {
        utils.consoleLog(`cli : ${JSON.stringify(res)}`);
      }
    });
    return;
  }
  selectPlugin(allPluginFile);
}
function selectPlugin(plugins) {
  utils.consoleLog(`plugins size : ${plugins.length}`);
  if (!plugins || plugins.length <= 0) return utils.consoleLog("没有可用模板");
  let _newPlugins = plugins.map(item => {
    let { cordovaName, cordovaName: id, userId: owner } = item;
    const newItem = {
      name: cordovaName,
      value: {
        id,
        name: item.name || cordovaName,
        cordovaName,
        owner,
        parameters: item.parameters || [],
        description: item.description || ""
      }
    };

    console.log("new: ", newItem);
    return newItem;
  });
  console.log("_newPlugins: ", _newPlugins);
  promptList[0].choices = _newPlugins;
  inquirer.prompt(promptList).then(answers => {
    let name = answers.cordovaName;
    utils.consoleLog(name);
    let ret = mtldev.setMTLPlugin(name);
    utils.consoleLog(ret);
    utils.consoleLog("操作完成");
  });
}

module.exports = {
  addPlugin
};
