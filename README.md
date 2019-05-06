[TOC]

# 1. 概述

命令：mtl 

> mtl 支持微信、钉钉、Android、iOS等多端原生技术开发，


### 安装mtl

+ 首先必须安装node.js、npm
+ 然后安装mtl
```
npm -g install mtl-cli
```
安装完成后，运行下面命令，检查是否安装成功
```
mtl --version   //查看版本号
```

+ 配置Android调试环境
+ 配置iOS调试环境
+ 配置微信小程序调试环境

### 支持的平台

简称 | 说明
---|---
android | Android平台
ios | iOS平台
eapp | 钉钉E应用
wx | 微信小程序平台
web | 移动Web应用

### 总体结构

![VR技术](http://47.92.67.238:7080/res/mtl/mtlcli.jpg)



# 创建工程

mtl 支持根据模板创建一个工程，同时也支持从Summer工程导入为一个mtl工程

### 模板创建
```
mtl create [appname] [template]
```
template样版工程
+ Hello ： 一个标准的Hello工程 <- 默认
+ X : 一个功能比较全的小应用，有登录、主页、卡片、列表



### 配置工程信息

用户手工配置project.json文件[可选]
```
{
    "appId":"com.yonyou.new.project",
    "version":1
    "name":"空工程"
    "configure-info":"etc"
}
```


# 用户管理

### 用户登录
在使用build、pull等与用户相关的命令前，必须要进行登录
```
mtl login
>User login: 
>Password:
>login successed! welcome,XXX. 
```
登录后，会在~/.mtl/目录下创建一个login.cfg的文件，记录用户信息。
> 如果是公共电脑后，请在使用完毕后，删除这个文件

### 设置环境变量
```
mtl config key value

//设置git的地址
mtl config git-url http://git.yonyou.com/xxx/xxx/
```

# 页面管理

### 选择平台
```
mtl platfrom [All | platform name]
//默认是All
```


### 创建一个页面
```
mtl [-p platform] add-page [pagename] [modelname] 
//根据选择的平台添加页面
//如果是All时，为所有平台添加页面
```
modelname
+ empty:标准空页面 <--默认
+ hello:标准Hello world页面
+ card:标准卡片页面
+ list:标准列表页面
+ login:标准登录页面
+ 

### 添加一个组件引用 
添加一个依赖的组件
```
mtl [-p platform] add-component [componentname]
```


# 编译&调试

### 编译部署包
```
mtl build [All | iOS | Android | WX | EApp]
//不输入平台，即编译所有平台
```

### 运行
安装部署包并运行
```
mtl start [--no-build] [All | iOS | Android | WX | EApp]
```

# 代码托管

### 配置您的代码库

### 提交和更新代码
```
mtl pull
mtl push
```






# 2. 演示流程

```
//环境部署
npm install -g mtl
mtl --version

//创建工程
mtl create approve
//编辑工程文件
mtl build WX
//添加页面
mtl add-page login
//不需要修改，演示登录
mtl build wx
mtl add-page list
//使用Excel作元数据，导入服务器，获得一个访问的URL
//用工具修改login文件，配置URL等功能 
mtl build wx
mtl start android ios
```

+ login
  - 协议和方案、API接口  3-13
  - 接口实现            3-15
+ MDD开发
  - 元数据请救接口（列表、卡片）      3-9

