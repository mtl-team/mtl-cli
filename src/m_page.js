const fse = require("fs-extra"); // fs-extra 扩展包
const mtldev = require("mtl-dev-sdk");
const utils = require("./m_util.js");
const inquirer = require("inquirer");

const promptList = [
  {
    type: "list",
    message: "请选择页面模板:",
    name: "name",
    choices: ["html", "react"],
    filter: function(val) {
      // 使用filter将回答变为小写
      return val.toLowerCase();
    }
  }
];

/**
 * MTL工程 验证工程名称是否正确
 * @param {String} projectName
 *
 */

async function addView(an, tl) {
 
  if (!an) {
    return utils.consoleLog(" 必须录入页面名称");
  }
  if (!utils.isMtlProject()) {
    return;
  }
  if (!utils.isVerifyProjectName(an)) {
    return utils.consoleLog("页面名称不能包含特殊字符，长度不能超过64位。");
  }
  if (fse.existsSync(an)) {
    return utils.consoleLog(
      "本地已存在- " + an + " - ,同一目录下不能重名！！！"
    );
  }
  let pages = mtldev.getPageInfos(mtldev.technologyStack());
  if (!pages || pages.length <= 0) {
    return utils.consoleLog("当前没有模板可用-");
  }
  getPagesOptionByTl(tl, pages, an);
}
/**
 * 选择模板，生成配置文件
 */
function getPagesOptionByTl(tl, pages, an) {
  if (tl) {
    downloadPage(tl,an);
    return;
  }
  let list = [];
  
  let names ={};
  for (let key in pages){
    let va = pages[key].name;
    names[va] = key;
    list.push(key)
  }
  if(list.length <=0 ){
    return utils.consoleLog("前没有模板可用");
  }
  utils.consoleLog(JSON.stringify(names));
  promptList[0].choices = list;
  inquirer.prompt(promptList).then(answers => {
    utils.consoleLog(answers.name);
    downloadPage(answers.name,an);
  });
}

//根据模板下载工程
function downloadPage(tl,newname) {
  let result = mtldev.downloadPageByTemplate( tl, newname);
  let code = result.code;
  if (code == 200) {
    utils.consoleLog(`添加完成： ${newname}`);
  } else {
    utils.consoleLog(JSON.stringify(result));
  }
}

module.exports = {
  addView
};
