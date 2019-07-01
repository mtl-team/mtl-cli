const fs = require('fs-extra');
const inquirer = require('inquirer');
const SUCCESS = "success";
const promptInput = {
    type: 'input',
    message: '请输入android的包名：',
    name: 'packageName',
    filter: function (val) { 
        return val;
    }
};



var setPackageName = function (packageName) {
    if(packageName){
        
        console.log('输入的包名：'+packageName);
        setPackageNameBegin(packageName);
    }else{

        inquirer.prompt(promptInput).then(answers => {
            console.log('已输入的包名：'+answers.packageName); // 返回的结果
            
            let packageName = answers.packageName; 
        
            setPackageNameBegin(packageName);
        });
    }

    
}

var setPackageNameBegin = function (packageName) {

    let projFile = './project.json';
    let rs = updatePackageNameToJson(projFile, packageName);
    if(rs == SUCCESS) {
        var result = JSON.parse(fs.readFileSync(projFile));
        console.log("新包名："+ result.config.packageName +"更新成功");
    }
    
}

function updatePackageNameToJson(projfile, packageName) {
    
    var result = JSON.parse(fs.readFileSync(projfile).toString());
  
    result.config.packageName= packageName ;
 
    //回写
  
    fs.writeFileSync(projfile, formatJson(result),{flag:'w',encoding:'utf-8',mode:'0666'});

    //修改config.xml
    // let xmlFile = "./app/config.xml";
    // let builder = new xml2js.Builder();
    // let xml = builder.buildObject(proj);
    // fs.writeFileSync(xmlFile, xml,{flag:'w',encoding:'utf-8',mode:'0666'});

    return SUCCESS;
}

/**
 * 格式化输出JSON对象，返回String
 * @param {JSON} data 
 */
function formatJson(data) {
    let LN = "\r";
    let TAB = "\t";
    var rep = "~";
    var jsonStr = JSON.stringify(data, null, rep)
    var str = "";
    for (var i = 0; i < jsonStr.length; i++) {
        var text2 = jsonStr.charAt(i)
        if (i > 1) {
            var text = jsonStr.charAt(i - 1)
            if (rep != text && rep == text2) {
                str += LN
            }
        }
        str += text2;
    }
    jsonStr = "";
    for (var i = 0; i < str.length; i++) {
        var text = str.charAt(i);
        if (rep == text)
            jsonStr += TAB;
        else {
            jsonStr += text;
        }
        if (i == str.length - 2)
            jsonStr += LN
    }
    return jsonStr;
}

exports.setPackageName = setPackageName