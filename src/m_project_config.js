const utils = require("./m_util.js");
const mtldev = require("mtl-dev-sdk");
const inquirer = require("inquirer");

const promptInput = {
  type: "input",
  message: "请输入android的包名：",
  name: "value",
  filter: function(val) {
    return val;
  }
};

function writeConfig(key, value, des) {
  if (!utils.isMtlProject()) {
    return;
  }
  let res;
  if (value) {
    res = mtldev.writeConfig(key, value);
    console.log(res);
    return
  }
  promptInput.message = des;
  inquirer.prompt(promptInput).then(answers => {
    console.log('已输入：'+answers.value); // 返回的结果
    res = mtldev.writeConfig(key,answers.value);
    console.log(res);
});
}

module.exports = {
  writeConfig
};
