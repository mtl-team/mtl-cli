
const inquirer = require('inquirer');
const Configstore = require('configstore');
const configFile = require('./config');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);

const buildTypePrompt = [
    {
        type: 'list',
        message: '请选择构建方式：',
        name: 'buildType',
        choices: [
            "git",
            "uploadZip"
        ],

        filter: function (val) { // 使用filter将回答变为小写
            return val;
        }
    }
];
/**
 * MTL工程源码设置构建方式
 * 注：代码上传 方式  和 git代码更新 
 * 
 */

var setBuildType = function () {
    inquirer.prompt(buildTypePrompt).then(answers => {
        conf.set('buildType', answers.buildType);
        console.log('选择的构建方式：' + answers.buildType); // 返回的结果
    });
}



exports.setBuildType = setBuildType