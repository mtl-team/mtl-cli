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
        utils.consoleLog("plugins-------------:  ",plugins);
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
  utils.consoleLog(plugins.length);
  if (!plugins || plugins.length <= 0) return utils.consoleLog("没有可用模板");
  let _newPlugins = plugins.map(item => {
    let newItem = item.name
      ? { name: item.name, value: item }
      : {
          name: item.cordovaName,
          value: {
            name: item.cordovaName,
            owner: item.userId,
            parameters: item.parameters || []
          }
        };
    return newItem;
  });
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
