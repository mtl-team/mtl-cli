[TOC]



# 快速开始
概述：mtl-cli

> mtl-cli 工具支持Android、iOS、微信、钉钉、移动web等多端同步跨平台开发，一套源码，多端调用 ，多端调试、多端预览 ，多端在云端服务构建生成不同的安装包以及发布包。提供工程模板脚手架，添加标准页面，原生能力插件等，并在云端构建打包等功能。

> 支持的平台

简称 | 说明
---|---
android | Android平台
ios | iOS平台
WX | 微信小程序平台
DD | 钉钉E应用
web | 移动Web应用

### 系统环境要求
兼容  Mac 和 win 操作系统。

### 前置软件安装
+ 首先安装node.js、npm


### 安装mtl


```
npm -g install mtl-cli
```
在安装过程中 ，如果是Mac电脑遇到安装失败，权限不够，需要加上 sudo  。 例如： sudo npm -g install mtl-cli 。 安装完成后，运行下面命令，检查是否安装成功
```
mtl --version   //查看版本号
```







### 创建工程

mtl 根据模板脚手架创建一个工程 

```
mtl create [appname] [template]
```
appname 是工程名称
+  此参数是必填项。参数不能是特殊字符 ，长度不要超过64。例如mtl-demo、mtl@……%demo 这样的工程命名都是不对的；
+  本地已创建的工程不能同名再创建，造成本地目录同名；

template 样版工程
+  ：一个空的MTL工程 。
+  : 一个MTL demo工程 ，涉及原生交互的一些功能。
+  ：一个MTL网络聊天工程工程 。
+  : 一个MTL网上商城工程。
+  ：一个MTL电商秀工程 。
+  : 一个MTL网络社交工程。
+  ：一个MTL销售分析工程 。

```
注意： 如果 mac 在创建工程结束的时候报错“Error: EACCES: permission denied” ，这个可能是 安装 express 没有权限导致 。
解决方法 ： 进入到你创建的**工程目录** 下 ，执行：sudo npm --save install express ，等待安装包执行完成后就可以了。 。  
```
### 配置工程信息

project.json文件 是工程配置文件，工程的信息以及各个端需要的重要数据都会集中在此文件中。

+ [**用户可以通过命令行更新或者手工配置**]
```
{
    "config": {
        "appName": "mtl",
        "packageName": "com.yonyou.mtl",
        "bundleID": "com.yonyou.uap.mobile5",
        "projectName": "mtl",
        "versionName": "1.0.0",
        "versionCode": "100",
        "versionBuild": "1.0.0",
        "startPage": "index.html",
        "debuggerEnable": "false",
        "reinforcement": "false",
        "sandbox": "false",
        "targetDevice": "handset",
        "statusBarTheme": "summer.Animations.NoTitleBar.FullScreen",
        "errorUrl": "",
        "urlScheme": "iosMtlScheme",
        "queriesSchemes": "",
        "androidScheme": "",
        "androidMinSdkVersion": "19",
        "isLibraryCompilation": "false",
        "ddAppCode": "dingnlb2wikil7pldytf",
        "wxAppCode": "dingnlb2wikil7pldytf",
        "cordovaPlugins": [],
        "gitUrl": "https://gogs.yonyoucloud.com/caiyi/mtl.git",
        "technologyStack": "tradition"
    }
}
```
简单介绍几个重要参数：
+  appName ：用户应用名称，一般在android ，iOS 构建打包后会生成的包名称。
+  packageName ： android的包ID 。
+  bundleID ： iOS 的bundleID 。
+  projectName ： 创建工程的名称，一般与appName同名皆可以 。
+  version**** ： 这个设置的android ，iOS 构建包的版本号，对于其他平台版本设置不涉及 。
+  startPage ： 这个是工程的首页地址 ，是很重要的参数 ！用户创建的工程无论调试、预览、构建都要关注这个参数 ，因为这是工程的入口 。
+  debuggerEnable ： 这个是android和iOS平台的调试构建包 ，暂时支持android ，后期支持iOS 。
+  reinforcement ： android的加固功能，暂时不支持 。
+  ****Schemes ： android和iOS的schemes配置 。
+ androidMinSdkVersion ： android支持的最小版本 。
+ ddAppCode、wxAppCode ： WX 、DD 小程序的接入code 。
+ cordovaPlugins ： 配置调用原生能力的插件列表。
+ technologyStack ： 这个是技术栈 ，要支持传统H5、react 、以及VUE等等框架。现在支持H5，以及即将上线的react框架。




### 设置android包名
```
mtl  set-packageName   

```
### 设置iOS bundleID
```
mtl  set-bundleID   

```
### 设置首页
```
mtl  set-startPage   

```
以上三个设置项都是通过命令行 更新project.json 文件。


### 创建页面
```
mtl  add-page [pagename] [modelname] 

```
pagename
+ 此参数是必填项，pagename 不能是特殊字符和汉字，长度不能超过64个字符；
+ 用户根据这个名称，替换模板页面中的模板变量，进行填槽，形成想要的页面。

modelname
+ empty:标准空页面 <--默认
+ list:标准列表页面
+ login:标准登录页面
+ ncc-login: ncc 登录页面
+ ncc-platform:ncc平台页面


### 添加插件引用原生功能
```
mtl  add-plugin 
```
现在拥有的插件 ，持续开发中：
+ mtl-plugin-faceverify 人脸识别
+ mtl-plugin-bdlocation 定位
+ mtl-plugin-terminal   多端控制
+ mtl-plugin-umeng      三方友盟
+ mtl-plugin-vui        语音交互
```
用户进入多选 checkbox 操作中 ，通过按下 "空格" 键选择，
上下箭头来移动光标，按下"a"实现全选, 按下"i"实现反选。
“回车” 确认保存到project.json 文件中
```
# 调试
```
mtl debug [ iOS | Android | WX | DD]
```

### android 调试 
+ android 平台需要配置好 android开发环境 ，至少adb工具。安装android 模拟器 ，例如 网易模拟器 nunu  ，确保adb 连接通 ， 可以使用 命令 ：adb connect 127.0.0.1:7555 （win），adb connect 127.0.0.1:5555 （mac）。如果debug过一次了没有成功，可以把工程根目录下的output/android/debug 目录删除 ，重新执行命令行debug 。如果 报错 error: more than one device and emulator ，可以用adb devices 命令看看是不是存在多个。发现还真是多个设备，那就需要为ADB命令指定设备的序列号了，
adb -s emulator-5554 shell
也就是给命令加上-s的参数就可以了；
### iOS 调试 
+ iOS 需要搭建好xcode 开发环境；
### 微信小程序调试
+ 微信小程序需要安装微信小程序工具：到微信公众平台去下载，下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html。命令行进行mtl debug wx 后 ，用微信小程序工具导入当前工程目录./output/wx/debug/proj  ，这样就可以在微信小程序工具下看到 修改app目录下工程源码的调试效果。
### 钉钉小程序调试 

+ 钉钉小程序需要安装 蚂蚁金服开放平台 小程序工具，下载地址：https://docs.alipay.com/mini/ide/download。命令行进行mtl debug DD 后 ，用钉钉小程序工具导入当前工程目录./output/dd/debug/proj  ，这样就可以在钉钉小程序工具下看到 修改app目录下工程源码的调试效果。
 

### debug 调试host配置和功能说明：
+ 配置pc的host 文件如下： 添加“ 127.0.0.1       mobile.yyuap.com ”  ；
+ 修改文件热更新，如果在项目工程下，修改了project.json 或者 app目录下的工程源码都会自动更新到output平台目录下的工程目录，需要在 android ，iOS ，wx小程序工具 ，钉钉小程序工具 里刷新就可以看到修改的效果。
+ 友情提示，终端命令行在调试状态下 ，一直处于工程的监听中 ，请不要中断当前的状态 ，直到想要终止调试，进行其他操作。



# 预览
```
mtl preview [ iOS | Android | WX | DD |Upesn]
```

### android预览说明：
+ 命令行执行预览android功能 ，需要用真机预先安装"预览apk" ，在真机安装后，打开预览APP的扫码功能  ，扫码识别后 ，就可以验证项目开发的真机预览功能。
### iOS 预览说明：
+ 命令行执行预览iOS功能 ，需要用真机预先安装"预览IPA" ，在真机安装后，打开预览APP的扫码功能  ，扫码识别后 ，就可以验证项目开发的真机预览功能。
### 微信小程序预览说明：
+ 命令行执行预览微信小程序功能 ，需要用真机的微信APP，用微信的扫码功能  ，扫码识别后 ，就可以验证项目开发的真机预览功能。
### 钉钉小程序预览说明： 

+ 命令行执行预览钉钉小程序功能 ，需要用真机的钉钉APP，用钉钉的扫码功能  ，扫码识别后 ，就可以验证项目开发的真机预览功能。


### 友空间预览说明：
+ 命令行执行预览Upesn功能 ，需要用真机的友空间APP，用友空间的扫码功能  ，扫码识别后 ，就可以验证项目开发功能的真机预览功能。
### 预览功能说明：
+ 预览命令行执行后 ，会在pc开发设备形成二维码；
+ 修改文件热更新，如果在项目工程下，修改了project.json 或者 app目录下的工程源码都会自动更新到后台预览服务中，需要在 android  ，iOS  ，微信 ，钉钉，友空间 里刷新就可以看到更新的效果。
+ 友情提示，终端命令行在预览状态下 ，一直处于工程的监听中 ，请不要中断当前的状态 ，直到想要终止预览，进行其他操作。

# 构建
```
mtl build [ iOS | Android ]
```
### 构建功能准备和功能说明：
+ 云构建server 源码上传，并完成构建。
+ 云构建server 支持git 远程代码下载到构建服务器进行云构建。需要在构建前通过"mtl set-git" 配置好Git 仓库 、分支、账号、密码等要素。
+ 通过 命令行 “set-buildType” 设置构建方式。
+ 云构建结束后会在控制台显示构建日志以及构建包存放目录；
+ 云构建成功后在output目录存放构建包，以及二维码安装图片。

### 运行

```
mtl start  [ Android ]
```
### 安装运行说明
+ 请连接后android真机设备或者模拟器。


# git账号配置
```
mtl set-git  
```
### 设置git说明
+ 用于云端构建 ，在构建服务器增量更新源码。
+ 根据提示 输入git仓库URL ，分支 ，账户，密码。


# 用户管理

### 用户登录
登录到开发中心 
```
mtl login
>User login: 
>Password:
>login successed! welcome,XXX. 
```
登录后，会在~/.mtl/目录下创建一个login.cfg的文件，记录用户信息。
> 如果是公共电脑后，请在使用完毕后，删除这个文件

![登录逻辑](http://iuap-design-cdn.oss-cn-beijing.aliyuncs.com/static/mtl/screenshot/mtl_login.png)

### 设置环境变量
```
mtl set-config key value

//设置git的地址
mtl set-config git-url http://git.yonyou.com/xxx/xxx/
```
# FAQ 
### 一 、为什么启动页不能替换？

```
答：
 1、对修改project.json文件的startPage项没有保存成功。
 2、修改的目录以及文件名称与实际工程的目录和文件名称不一致。
 3、 如果是用git方式进行构建工程，修改的工程文件没有更新到git 仓库。
```



