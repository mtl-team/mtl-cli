
const inquirer = require('inquirer');
const Configstore = require('configstore');
const configFile = require('./config');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);

const gitPrompt = [
    {
        type: 'input',
        message: '请输入当前工程的Git仓库地址：',
        name: 'git',
        default: conf.get('git-url'),
        filter: function (val) { // 使用filter将回答变为小写
            return val;
        }
    },
    {
        type: 'input',
        message: '请输入当前工程的Git仓库分支名称，如果是默认分支origin/master，则清除默认值，按回车跳过。请输入分支名称：',
        name: 'branch',
        default: conf.get('git-branch'),
        filter: function (val) { // 使用filter将回答变为小写
            return val;
        }

    },
    {
        type: 'input',
        message: '请输入当前工程的Git仓库账号：',
        name: 'user',
        default: conf.get('git-user'),
        filter: function (val) { // 使用filter将回答变为小写
            return val;
        }
    },
    {
        type: 'input',
        message: '请输入当前工程的Git仓库账号密码：',
        name: 'password',
        default: conf.get('git-password'),
        filter: function (val) { // 使用filter将回答变为小写
            return val;

        }
    }

];


/**
 * MTL工程 用户工程源码git仓库信息配置
 * 注：对用户开发的工程代码，主要用于云构建打包服务 ，在云构建服务器根据配置好的
 * git 仓库信息 ，进行git 操作代码 ，然后打包 ，提高构建效率。
 */

var setGit = function () {


    inquirer.prompt(gitPrompt).then(answers => {
        conf.set('git-url', answers.git);
        conf.set('git-branch', answers.branch);
        conf.set('git-user', answers.user);
        conf.set('git-password', answers.password);
        console.log('输入的Git仓库地址：' + answers.git); // 返回的结果
        console.log('输入的Git仓库分支：' + answers.branch); // 返回的结果
        console.log('输入的Git仓库账号：' + answers.user); // 返回的结果
        console.log('输入的Git仓库账号密码：' + answers.password); // 返回的结果
    });


}



exports.setGit = setGit