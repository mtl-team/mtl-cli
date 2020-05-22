#!/usr/bin/env node

const program = require("commander");

var mCreate = require("./src/m_create"); //已修改

var mConfig = require("./src/mtl_config"); //配置未修改
var mPage = require("./src/m_page"); //已修改
var mPlugin = require("./src/m_plugin"); //已修改
var mUserPlugin = require("./src/m_userPlugin"); //已修改
var mCreatePlugin = require("./src/m_createPlugin"); //已修改

var mLogin = require("./src/m_login"); //已修改
const mtlProjectConfig = require("./src/m_project_config"); //统一修改mtlProjectConfig
var mBuild = require("./src/m_build"); //已修改
var mDebug = require("./src/m_debug");//已修改
var mPreview = require("./src/m_preview");//已修改
var mHelp = require("./src/mtl_help");

const {evalJs,isMtlProject} = require("./src/m_util");
const update = require("./src/update");
//第一时间检测是否有最新版本给出提升自行升级或者是热更新模板

program.version(require("./package").version);

// create 开发者中心   c
program
  .command("create [appname] [template]")
  // .alias("c") // 命令简写
  .description("根据模板创建本地项目开发。")
  .action(function(appname, template) {
    mCreate.createApp(appname, template);
  });

program
  .command("set-buildType")
  .alias("s-bt") // 命令简写
  .description("设置对工程源码进行云构建打包方式： 1 源码上传 | 2 git   ")
  .action(function() {
    mSetBuildType.setBuildType();
  });

program
  .command("config [key] [value]")
  // .alias("conf") // 命令简写
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
  .command("add-plugin [pName]")
  .alias("a-plugin") // 命令简写
  .description("在插件列表中，选择需要添加的插件。")
  .action(function(pName) {
    mPlugin.addPlugin(pName);
  });

  program
  .command("createPlugin  [tplname] [source]  ")
  .alias("createp") // 命令简写
  .description("创建helloWord模板插件。")
  .action(function(source) {
    mCreatePlugin.createPlugin(source);
  });

  // program
  // .command("add-userplugin")
  // .alias("a-up") // 命令简写
  // .description("在插件列表中，选择需要添加的插件。")
  // .action(function(pName) {
  //   mUserPlugin.addUserPlugin(pName);
  // });

  program
  .command("login")
  // .alias("l") // 命令简写
  .description("登录云构建server。")
  .action(function() {
    mLogin.login();
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

program
  .command("build [platform]") // iOS | Android | WX | EApp 。
  // .alias("b") // 命令简写
  .description("编译MTL项目，平台为：1 iOS | 2 Android | 3 WX | 4 EApp ")
  .action(function(platform) {
    // 执行命令的的函数

    mBuild.build(platform);
  });

// 运行安装
program
  .command("start [platform]") // iOS | Android | WX | EApp
  // .alias("s") // 命令简写
  .description("运行演示MTL项目，平台为：1 iOS | 2 Android | 3 WX | 4 EApp ")
  .action(function(platform) {
    // 执行命令的的函数
    mDebug.startEmulator(platform);
  });

program
  .command("debug [platform]") // iOS | Android | WX | EApp 。
  // .alias("d") // 命令简写
  .description("运行调试MTL项目，平台为：1 iOS | 2 Android | 3 WX | 4 dd 。")
  .action(function(platform) {
    // 执行命令的的函数
    mDebug.start(platform);
  });

program
  .command("preview [platform]") // iOS | Android | WX | dd 。
  // .alias("p") // 命令简写
  .description(
    "运行演示MTL项目，平台为：1 iOS | 2 Android | 3 WX | 4 dd | 5 Upesn  。"
  )
  .action(function(platform) {
    // 执行命令的的函数
    mPreview.start(platform);
  });

program
  .command("readme") // 清除用户信息
  .description("帮助文档")
  .action(function() {
    // 执行命令的的函数
    mHelp.helpInfo();
  });

  program
  .command("execScript") // 清除用户信息
  .description("执行脚本")
  .action(function(path) {
    // 执行命令的的函数
    if(isMtlProject() || path.indexOf("summer") != -1){
      evalJs(path);
    }
  });
  program
  .command("cp-script") // 清除用户信息
  .alias("cp-s") // 命令简写
  .description("copy默认脚本到工程")
  .action(function() {
    if(isMtlProject()){
      mCreate.cpScript();
    }
  });
  program
  .command("updateRegistry") // 清除用户信息
  .alias("upr") // 命令简写
  .description("copy默认脚本到工程")
  .action(function() {
      mCreate.updateRegistry();
  });
  

program.parse(process.argv);
update.checkVersion();
