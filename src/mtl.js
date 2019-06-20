const fs = require('fs-extra');
const os = require('os');
const shell = require('shelljs');
const path = require('path');
//Linux系统上'Linux'
//macOS 系统上'Darwin'
//Windows系统上'Windows_NT'

var Utils = function () {
    this.SUCCESS = "success",
    this.ERROR = "error",
    
    this.isSuccess = function(data) {
        return data == this.SUCCESS
    },
    this.isError = function(data) {
        return data == this.ERROR
    },

    //报告错误
    this.reportError = function (message) {
        if(message) {
            console.log(message);
        }
        return this.ERROR;
    },

    this.Folder = {
        "APP":"./app/",
        "WX_Folder":"./wx/",
        "OUTPUT":"./output"
    },

    this.Platform = {
        "IOS":"ios",
        "WEIXIN":"wx",
        "ANDROID":"android",
        "DingDing":"dd",
        "Upesn":"upesn"
    },
    // this.Platform.IOS = "iOS",
    // this.Platform.ANDROID = "Android",
    // this.Platform.WEIXIN = "WX",
    // this.Platform.E_APP = "E-APP",

    this.isProject = function () {
        return fs.existsSync("./project.json");
    }

  //检查工程目录
  this.checkProjectDir = function() {
    console.log("！！！请一定进入当前工程跟目录！！！");
    var isexist = fs.existsSync("project.json")
    if (isexist) {
      let pwd = shell.pwd().split(path.sep).join('/');
      console.log("当前工程跟目录："+pwd);
      return this.SUCCESS;
    }else {
      console.log("当前目录不是工程跟目录 😢 😢 😢 ！！！")
      return this.ERROR;
    }
}

    //检查平台参数
    this.checkPlatform = function(platform) {
        if(platform==undefined){
            return this.ERROR;
        }
        let p = platform.toLowerCase().trim();
        switch(p) {
            case "ios":
                return this.Platform.IOS;
            case "android":
            case "adr":
                return this.Platform.ANDROID;
            case "wx":
            case "weixin":
            case "微信":
                return this.Platform.WEIXIN;
            case "eapp":
            case "e-app":
            case "dd":
                return this.Platform.DingDing;
            case "esn":
            case "upesn":
                return this.Platform.Upesn;
        }
        return this.ERROR;
    }

    /*
        提交代码
    */
    this.commitAndPush = function(message){
      if(!message){
        message = 'default';
      } 
      shell.exec("git add -A");
      console.log('执行git commit');
      shell.exec("git status");
      shell.exec("git commit -m " + message + ' -q');
  
      shell.exec("git push");
      console.log('git操作完成');
    }
  
    this.copyHosts = function(cmd) {
      if(cmd=="debug") {
        shell.exec("sudo cp /etc/hosts.debug /etc/hosts");
      }
      if(cmd=="preview") {
        shell.exec("sudo cp /etc/hosts.preview /etc/hosts");
      }
    }

    /*
        判断系统
    */
    this.isWindows = function(){
        let sysType = os.type();
        if(sysType==="Windows_NT"){
          return true;
        }else{
          return false;
        }  
      }
      
      /*
          移动文件夹
      */
      
     this.mvFs = function(dir1,dir2){
        if(!dir2){
          console.log('目标目录不存在');
        }
      
        if(isWindows()){
          console.log('w执行移动文件: '+dir1);
          shell.exec('move '+ dir1 +' '+ dir2);
        }else{
          console.log('l执行移动文件: '+dir1);
          shell.exec('mv '+ dir1 +' '+ dir2);
        }
      }
      
      /*
          删除文件夹
      */
     this.delFs = function(dir){
        if(!dir){
          console.log('目标目录不存在');
        }
      
        if(isWindows()){
          console.log('w执行删除文件: '+dir);
          shell.exec('rd/s/q '+ dir);
        }else{
          console.log('l执行删除文件: '+dir);
          shell.exec('rm -rf '+ dir);
        }
      }
      
      
      /*
          创建多级文件目录
      */
     this.mkDirsSync = function(dirname){
        
        var path = require("path");  
        if (fs.existsSync(dirname)) {  
            return true;  
        } else {  
            if (this.mkDirsSync(path.dirname(dirname))) {  
                fs.mkdirSync(dirname);  
                return true;  
            }  
        }  
      }
      /*
          文件以及文件目录拷贝
      */
      
      this.copyDir = function(src,dst){
        var path = require('path');
        
          let paths = fs.readdirSync(src); //同步读取当前目录
          paths.forEach(function(path){
              var _src=src+'/'+path;
              var _dst=dst+'/'+path;
              fs.stat(_src,function(err,stats){  //stats  该对象 包含文件属性
                  if(err)throw err;
                  if(stats.isFile()){ //如果是个文件则拷贝 
                      let  readable=fs.createReadStream(_src);//创建读取流
                      let  writable=fs.createWriteStream(_dst);//创建写入流
                      readable.pipe(writable);
                  }else if(stats.isDirectory()){ //是目录则 递归 
                      // checkDirectory(_src,_dst,copy);
      
                     fs.access(_dst, fs.constants.F_OK, (err) => {
                          if(err){
                            fs.mkdirSync(_dst);
                            this.copyDir(_src,_dst);
                          }else{
                            this.copyDir(_src,_dst);
                          }
                        });
      
                  }
              });
          });
      }




}

exports.Utils = new Utils()