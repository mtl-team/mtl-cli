#!/usr/bin/env node

const program = require("commander");

var mCreate = require("./src/m_create"); //已修改
var mLogin = require("./src/mtl_login"); //登录未修改
var mConfig = require("./src/mtl_config"); //配置未修改
var mPage = require("./src/m_page"); //已修改
var mPlugin = require("./src/m_plugin"); //已修改
// var mSetPackageName = require('./src/mtl_setPackageName');统一修改mtlProjectConfig
// var mSetBundleID = require('./src/mtl_setBundleID');统一修改mtlProjectConfig
// var mSetStartPage = require('./src/mtl_setStartPage');

const mtlProjectConfig = require("./src/m_project_config"); //统一修改mtlProjectConfig
var mBuild = require("./src/m_build"); //已修改
var mDebug = require("./src/mtl_debug");
var mPreview = require("./src/m_preview");
var mSetBuildType = require("./src/mtl_setBuildType"); //未修改
var mHelp = require("./src/mtl_help");

var mPluginManger = require("./src/mtl_plugin");
var mSetgit = require("./src/mtl_setgit");
const getAutoUpdate = require("./src/update");
var mViewpage = require("./src/mtl_viewpage");
//第一时间检测是否有最新版本给出提升自行升级或者是热更新模板

// getAutoUpdate();

program.version(require("./package").version);

// create 开发者中心   c
program
  .command("create [appname] [template]")
  .alias("c") // 命令简写
  .description("根据模板创建本地项目开发。")
  .action(function(appname, template) {
    mCreate.createApp(appname, template);
  });

// program
//   .command('set-git').alias('sg') // 命令简写
//   .description('用于对用户开发的工程源码进行云构建打包服务，\n\r云构建服务器根据配置好的git仓库信息 ，进行git代码更新，提高构建效率。 ')
//   .action(function () {
//     mSetgit.setGit();
//   });
program
  .command("set-buildType")
  .alias("s-bt") // 命令简写
  .description("设置对工程源码进行云构建打包方式： 1 源码上传 | 2 git   ")
  .action(function() {
    mSetBuildType.setBuildType();
  });

// program
//   .command('pushRemote').alias('psr') // 命令简写
//   .description('本地工程，提交远程。')
//   .action(function () {
//     mCreate.pushRemote();
//   });

// program
//   .command('pullRemote [gitURL]').alias('plr') // 命令简写
//   .description('根据gitUrl下载工程')
//   .action(function (gitURL) {
//     mCreate.pullRemote(gitURL);
//   });

// program
//   .command('import [appname] [source]').alias('ipt') // 命令简写
//   .description('导入一个Summer工程')
//   .action(function (appname, source) {
//     mCreate.importApp(appname, source);
//   });

program
  .command("login [username] [password]")
  .alias("l") // 命令简写
  .description("登录开发中心")
  .action(function(username, password) {
    mLogin.login(username, password);
  });

program
  .command("config [key] [value]")
  .alias("conf") // 命令简写
  .description("设置mtl-cli环境变量")
  .action(function(key, value) {
    mConfig.config(key, value);
  });

program
  .command("add-page [name] [tplname]")
  .alias("ap") // 命令简写
  .description("添加页面")
  .action(function(name, tplname) {
    console.log("add-page " + name);
    mPage.addView(name, tplname);
  });

program
  .command("add-plugin")
  .alias("a-plugin") // 命令简写
  .description("在插件列表中，选择需要添加的插件。")
  .action(function() {
    mPlugin.addPlugin();
  });

program
  .command("set-packageName [packageName]")
  .alias("s-packageName") // 命令简写
  .description("设置android包名。")
  .action(function(packageName) {
    mtlProjectConfig.writeConfig("packageName", packageName, "请android包名");
  });

program
  .command("set-bundleID [bundleID]")
  .alias("s-bundleID") // 命令简写
  .description("设置iOS bundleID。")
  .action(function(bundleID) {
    mtlProjectConfig.writeConfig("bundleID", bundleID, "请设置iOS bundleID");
  });

program
  .command("set-startPage [startPage]")
  .alias("s-startPage") // 命令简写
  .description("设置启动页面。")
  .action(function(startPage) {
    mtlProjectConfig.writeConfig("startPage", startPage, "请设置启动页面。");
  });

// program
//   .command('plugin [cmd] [name] [file]').alias('tpl') // 命令简写
//   .description('管理插件。')
//   .action(function (cmd, name, file) {
//     mPlugin.run(cmd, name, file);
//   });

program
  .command("build [platform]") // iOS | Android | WX | EApp 。
  .alias("b") // 命令简写
  .description("编译MTL项目，平台为：1 iOS | 2 Android | 3 WX | 4 EApp ")
  .action(function(platform) {
    // 执行命令的的函数

    mBuild.build(platform);
  });

// 运行安装
program
  .command("start [platform]") // iOS | Android | WX | EApp
  .alias("s") // 命令简写
  .description("运行演示MTL项目，平台为：1 iOS | 2 Android | 3 WX | 4 EApp ")
  .action(function(platform) {
    // 执行命令的的函数
    mBuild.start(platform);
  });

program
  .command("debug [platform]") // iOS | Android | WX | EApp 。
  .alias("d") // 命令简写
  .description("运行调试MTL项目，平台为：1 iOS | 2 Android | 3 WX | 4 dd 。")
  .action(function(platform) {
    // 执行命令的的函数
    mDebug.start(platform);
  });

program
  .command("preview [platform]") // iOS | Android | WX | dd 。
  .alias("p") // 命令简写
  .description(
    "运行演示MTL项目，平台为：1 iOS | 2 Android | 3 WX | 4 dd | 5 Upesn  。"
  )
  .action(function(platform) {
    // 执行命令的的函数
    mPreview.start(platform);
  });

// program
//   .command('clearUser') // 清除用户信息
//   .alias('cu') // 命令简写
//   .description('清除用户信息 。')
//   .action(function () { // 执行命令的的函数
//     mConfig.clearUserInfo();
//   })

program
  .command("readme") // 清除用户信息
  .description("帮助文档")
  .action(function() {
    // 执行命令的的函数
    mHelp.helpInfo();
  });

program.parse(process.argv);
