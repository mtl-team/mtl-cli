/**
 * 检测当前是否有新版本，给出提示升级mtl
 * @url http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/uba/ucf-cli-version.json
 */

const request = require('request');
const chalk = require('chalk');
const path = require('path');

module.exports = () => {
    request({ url: 'http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/uba/ucf-cli-version.json' }, (error, response, body) => {
        let result = JSON.parse(body);
        let version = require('../package.json').version;

        console.log("当前版本： " + version + ";最新发布版本:"+result['ucf-cli']);

        if(result['ucf-cli'] != version){
            console.log(chalk.yellow.bold(`New version ${version} -> ${result['ucf-cli']}`));
            console.log(chalk.yellow.bold(`npm install mtl -g`));
        }
    });
}