
const inquirer = require('inquirer');
const Configstore = require('configstore');
const configFile = require('./config');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);

const gitPrompt = {
    type: 'input',
    message: '请输入当前工程的Git仓库地址：',
    name: 'git',
    filter: function (val) { // 使用filter将回答变为小写
        return val;
    }
};
const gitBranchPrompt = {
    type: 'input',
    message: '请输入当前工程的Git仓库分支名称，如果是默认分支 origin/master 则回车跳过 ，请输入分支名称：',
    name: 'branch',
    filter: function (val) { // 使用filter将回答变为小写
        return val;
    }
};
const gitUserPrompt = {
    type: 'input',
    message: '请输入当前工程的Git仓库账号：',
    name: 'user',
    filter: function (val) { // 使用filter将回答变为小写
        return val;
    }
};
const gitPasswordPrompt = {
    type: 'input',
    message: '请输入当前工程的Git仓库账号密码：',
    name: 'password',
    filter: function (val) { // 使用filter将回答变为小写
        return val;
    }
};

/**
 * MTL工程 用户工程源码git仓库信息配置
 * 注：对用户开发的工程代码，主要用于云构建打包服务 ，在云构建服务器根据配置好的
 * git 仓库信息 ，进行git 操作代码 ，然后打包 ，提高构建效率。
 */

var setGit = function (param) {
    //命令行获取
    if (param == undefined) {
        inquirer.prompt(gitPrompt).then(answers => {

            conf.set('git-url', answers.git);
            console.log('输入的Git仓库地址：' + conf.get('git-url')); // 返回的结果
            inquirer.prompt(gitBranchPrompt).then(answers => {

                conf.set('git-branch', answers.branch);
                console.log('输入的Git仓库分支：' + conf.get('git-branch')); // 返回的结果
                inquirer.prompt(gitUserPrompt).then(answers => {

                    conf.set('git-user', answers.user);
                    console.log('输入的Git仓库账号：' + conf.get('git-user')); // 返回的结果
                    inquirer.prompt(gitPasswordPrompt).then(answers => {

                        conf.set('git-password', answers.password);
                        console.log('输入的Git仓库账号密码：' + conf.get('git-password')); // 返回的结果

                    });
                });
            });
        });

    } else if (param == "url") {
        inquirer.prompt(gitPrompt).then(answers => {
            conf.set('git-url', answers.git);
            console.log('输入的Git仓库地址：' + conf.get('git-url')); // 返回的结果
        });
    } else if (param == "branch") {

        inquirer.prompt(gitBranchPrompt).then(answers => {

            conf.set('git-branch', answers.branch);
            console.log('输入的Git仓库分支：' + conf.get('git-branch')); // 返回的结果
        });
    } else if (param == "user") {

        inquirer.prompt(gitUserPrompt).then(answers => {
            conf.set('git-user', answers.user);
            console.log('输入的Git仓库账号：' + conf.get('git-user')); // 返回的结果
        });

    } else if (param == "password") {

        inquirer.prompt(gitPasswordPrompt).then(answers => {

            conf.set('git-password', answers.password);
            console.log('输入的Git仓库账号密码：' + conf.get('git-password')); // 返回的结果

        });

    } else {
        console.log('参数输入有误：参数为url，单独配置仓库地址；\n\r 参数为branch，单独配置git分支；\n\r 参数为 user，单独配置账号名称；\n\r 参数为 password ，单独配置账号密码。' + answers.git);

    }







}
exports.setGit = setGit