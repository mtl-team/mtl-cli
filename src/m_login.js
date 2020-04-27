const mtldev = require("mtl-dev-sdk");
const utils = require("./m_util.js");
const inquirer = require('inquirer');
const fse = require('fs-extra');

const promptInput = {
    type: 'input',
    message: '请输入用友云账号：',
    name: 'yhtUserCode',
    filter: function (val) { 
        return val;
    }
};

function login() {
  if (!utils.isMtlProject()) {
    return;
  }
  console.log('如果用友云账号不清楚是什么，可以登录友互通查询。友互通地址：https://euc.yonyoucloud.com'); 
  console.log('进入到友互通页面，点击左面菜单中 基本设置-->个人资料，可以查找到用友云账号'); 
      
  inquirer.prompt(promptInput).then(answers => {
    console.log('已输入的用友云账号：'+answers.yhtUserCode); 
    startLogin(answers.yhtUserCode);
});

}const config = {
    host: "mtlb.yyuap.com",
    port: "8050"
  };

function startLogin(yhtUserCode){
    mtldev.login(yhtUserCode, function(res) {
        if(res.code != 200 ){
            console.log(JSON.stringify(res));
          return;
        }else{
            console.log(`登录成功`); 
        }   
      },config);
}

module.exports = {
  login
}