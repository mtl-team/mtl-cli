
const MTL_UI_EMPTY_MODEL = 1 ; //1 empty:标准空页面 <--默认
const MTL_UI_HELLO_MODEL = 2 ; //2 hello:标准Hello world页面
const MTL_UI_CARD_MODEL = 3 ; // 3 card:标准卡片页面
const MTL_UI_LIST_MODEL = 4 ; //4 list:标准列表页面
const MTL_UI_LOGIN_MODEL = 5 ; // 5 login:标准登录页面

const utils = require('./src').Utils;
class mtlViewpage{

static addViewPage( modelname, platform) {
      console.log("选择UI模型: 1 标准空页面 <--默认 | 2 标准Hello world页面 | 3 标准卡片风格 | 4 标准列表风格 | 5 标准登录页面");
      console.log('注意 请一定要在当前工程目录下！');
            if (modelname == MTL_UI_EMPTY_MODEL) {
              // do nothing
              console.log("选择UI模型: 1 标准空页面 <--默认");

            } else if (modelname ==MTL_UI_HELLO_MODEL){
               
              console.log("选择UI模型: 2 标准Hello world页面 ");
              // copy.copyDir("./android/uiModel/helloword/","./android/app/src/main/res/layout/");
              utils.copyDir ("./android/uiModel/helloword/layout/","./android/app/src/main/res/layout/");
              utils.copyDir("./android/uiModel/helloword/fullfeatured/","./android/app/src/main/java/com/yonyou/fullfeatured/");
                       

            }else if (modelname==MTL_UI_CARD_MODEL){
              console.log("选择UI模型:  3 标准卡片风格 ");
              // copy.copyDir("./android/uiModel/card/","./android/app/src/main/res/layout/");
              utils.copyDir("./android/uiModel/card/layout/","./android/app/src/main/res/layout/");
              utils.copyDir("./android/uiModel/card/fullfeatured/","./android/app/src/main/java/com/yonyou/fullfeatured/");
                               
            }else if (modelname==MTL_UI_LIST_MODEL){
              console.log("选择UI模型: 4 标准列表风格 ");
              utils.copyDir("./android/uiModel/list/layout/","./android/app/src/main/res/layout/");
              utils.copyDir("./android/uiModel/list/fullfeatured/","./android/app/src/main/java/com/yonyou/fullfeatured/");
                                 
            }else if (modelname== MTL_UI_LOGIN_MODEL ){
               console.log("选择UI模型: 5 login ");
            }else{
              //循环输入platform
                
                var isInputPlatform =true ;  // 1 时平台输入不正确，循环输入 ，直到输入正确的模板。    
                while (isInputPlatform ){

                    var readlineSync = require('readline-sync');

                      // Wait for user's response.

                    var selectUimodel = readlineSync.question('请输入UI模板，例如 1 、2 ... ：');

                    if (selectUimodel==MTL_UI_EMPTY_MODEL) {
                       console.log("选择UI模型 : 1 标准空页面 <--默认 !");
                       isInputPlatform = false;
                    } else if (selectUimodel==MTL_UI_HELLO_MODEL){
                      utils.copyDir("./android/uiModel/helloword/layout/","./android/app/src/main/res/layout/");
                      utils.copyDir("./android/uiModel/helloword/fullfeatured/","./android/app/src/main/java/com/yonyou/fullfeatured/");
                       
                       console.log("选择UI模型: 2 标准Hello world页面 !");
                       isInputPlatform = false;
                    }else if (selectUimodel==MTL_UI_CARD_MODEL){

                      utils.copyDir("./android/uiModel/card/layout/","./android/app/src/main/res/layout/");
                      utils.copyDir("./android/uiModel/card/fullfeatured/","./android/app/src/main/java/com/yonyou/fullfeatured/");
                       
                       console.log("选择UI模型:  3 标准卡片风格 ! ");
                       isInputPlatform = false;
                    }else if (selectUimodel==MTL_UI_LIST_MODEL){

                      copy.copyDir("./android/uiModel/list/layout/","./android/app/src/main/res/layout/");
                      copy.copyDir("./android/uiModel/list/fullfeatured/","./android/app/src/main/java/com/yonyou/fullfeatured/");
                       
                       // shell.cp(" -r  ./android/uiModel/list/layout/*  ./android/app/src/main/res/layout/");
                       // shell.cp(" -r  ./android/uiModel/list/fullfeatured/*  ./android/app/src/main/java/com/yonyou/fullfeatured/");
                       console.log("选择UI模型: 4 标准列表风格 ! ");
                       isInputPlatform = false;
                    }else if (selectUimodel==MTL_UI_LOGIN_MODEL ){
                       console.log("选择UI模型: 5 login !");
                       isInputPlatform = false;
                       
                    }else{
                      //继续循环输入platform
                        isInputPlatform = true;
                      }
                    modelname = selectUimodel;
                  }

              }
      // 读取app配置文件文件
        var fs=require('fs-extra');
        var file="app-config.json";
        var result=JSON.parse(fs.readFileSync(file));       
        // console.log('app-config projectBaseinfo.buildPlatform:'+result.projectBaseinfo.buildPlatform);          

     // 写app配置文件文件
        result.androidBaseinfo.uiModel = modelname;
        fs.writeFileSync(file, JSON.stringify(result));

        console.log('可以通过  build 指令完成模板工程编译打包');
        console.log('请选择编译项目平台：1、iOS；2、Android；3、WX；4、EApp；5、All');
        console.log('指令举例：mtl build         不输入平台，即编译platform指令预设的平台，如果从没设置平台，即编译默认所有平台。');
        console.log('指令举例：mtl build 2       通过平台代号完成平台编译！');
        console.log('指令举例：mtl build Android 通过平台名称完成平台编译！');
    }
}
module.exports = mtlViewpage;