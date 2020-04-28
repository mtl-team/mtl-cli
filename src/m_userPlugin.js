const inquirer = require("inquirer");
const allPluginFile = require("../res/plugin.json");
const utils = require("./m_util.js");
const mtldev = require("mtl-dev-sdk");
const fse = require('fs-extra');
const promptList = [
  {
    type: "list",
    message: "请选择你要添加的插件:",
    name: "pluginId",
    choices: allPluginFile,
    filter: function (val) {
      return val;
    }
  }
];
function addUserPlugin() {
  if (!utils.isMtlProject()) {
    return;
  }
  var proj = JSON.parse(fse.readFileSync("./project.json").toString());
 if(proj.config.userInfo.userId=="32"||proj.config.userInfo.userName=="ump"){
  utils.consoleLog(`😢 😢 😢  当前是系统默认账户，不能通过此命令来添加用户自定义的插件 😢 😢 😢 `);
  utils.consoleLog(`！！！请执行 mtl login 命令完成登录，然后再通过此命令添加用户在构建网站上传的插件！！！`);
  return;
 }

  mtldev.serchUserPlugins({ userId: proj.config.userInfo.userId }, res => {
    if (res.code == 200) {
      let plugins = res.data.plugins || [];
      selectPlugin(plugins);
    } else {
      utils.consoleLog(`cli : ${JSON.stringify(res)}`);
    }
  });
  return;
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
        owner,
        parameters: JSON.parse(item.parameters.toString()) || [],
        description: item.description || ""
      }
    };
    console.log("new: ", newItem);
    return newItem;
  });
  // console.log("_newPlugins: ", _newPlugins);
  promptList[0].choices = _newPlugins;
  promptList[0].message = "请选择你要添加的插件:",
    promptList[0].name = "pluginId",
    inquirer.prompt(promptList).then(answers => {
      let name = answers.pluginId;
      utils.consoleLog(name);
      let ret = mtldev.setMTLPlugin(name);
      utils.consoleLog(ret);
      utils.consoleLog("操作完成");
    });
}

module.exports = {
  addUserPlugin
};
