const fse = require("fs-extra"); // fs-extra 扩展包
const mtldev = require("mtl-dev-sdk");
const utils = require("./m_util.js");
const inquirer = require("inquirer");
const shell = require("shelljs");
const join = require("path").join;

const promptList = [
  {
    type: "list",
    message: "请选择插件模板:",
    name: "name",
    choices: ["helloWord"],
    filter: function(val) {
      // 使用filter将回答变为小写
      return val;
    }
  }
];

/**
 * MTL工程 创建插件
 * @param {String} pName 验证插件名称是否正确
 * @param {String} tl  插件模板
 */

async function createPlugin( source ) {
 
  // if (!pName) {
  //   return utils.consoleLog(" 必须录入页面名称");
  // }
  if (utils.isMtlProject()) {
    return utils.consoleLog(" 请不要在 mtl 工程中创建原生插件 ，这样会导致工程报错！！！"); ;
  }
  // if (!utils.isVerifyProjectName(pName)) {
  //   return utils.consoleLog("插件模板名称不能包含特殊字符");
  // }
  // if (fse.existsSync(pName)) {
  //   return utils.consoleLog(
  //     "本地已存在- " + pName + " - ,同一目录下不能重名！！！"
  //   );
  // }
  let plugins;
  if (source=="mtl"){
    plugins = mtldev.getPluginInfos(source);
  }else{
    plugins = mtldev.getPluginInfos("upesn");
  }
  if (!plugins || plugins.length <= 0) {
    return utils.consoleLog("当前没有模板可用-");
  }
  getPluginsOptionByTl(plugins);
}
/**
 * 选择模板，生成配置文件
 */
function getPluginsOptionByTl( plugins) {
  utils.consoleLog(JSON.stringify(plugins));
  let list = [];
  let urls ={};
  for (let key in plugins){
    let va = plugins[key].name;
    // let va = plugins[key];
    urls[va] = plugins[key].url;
    list.push(va)
  }
  if(list.length <=0 ){
    return utils.consoleLog("前没有模板可用");
  }
  promptList[0].choices = list;
  inquirer.prompt(promptList).then(answers => {
    utils.consoleLog(answers.name);

    for (let key in plugins){
      if(answers.name.trim() == plugins[key].name ){
        downloadPluginTl(answers.name,plugins[key].url);
      }
    }
    
  });
}

//根据模板下载工程
function downloadPluginTl(tl,url) {
  utils.consoleLog("插件模板下载地址："+url);
  let workspace = shell.pwd().toString();
  if (fse.existsSync(tl)) {
    return utils.consoleLog(
      "本地已存在- " + tl + " 插件 ,同一目录下不能重名！如果想要下载新模板，可以将本地模板文件夹改名。"
    );
  }
  let result = mtldev.downloadPluginByTemplate(workspace, tl, url);
  let code = result.code;
  if (code == 200) {
    utils.consoleLog(`插件模板创建完成： ${tl}`);
  } else {
    utils.consoleLog(JSON.stringify(result));
  }
}

module.exports = {
  createPlugin
};

