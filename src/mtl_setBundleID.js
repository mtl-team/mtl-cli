const fs = require('fs-extra');
const inquirer = require('inquirer');
const SUCCESS = "success";
const promptInput = {
    type: 'input',
    message: '请输入iOS的bundleID：',
    name: 'bundleID',
    filter: function (val) { 
        return val;
    }
};

var setBundleID = function (bundleID) {
    if(bundleID){
        
        console.log('输入iOS的bundleID：'+bundleID);
        setBundleIDBegin(bundleID);
    }else{

        inquirer.prompt(promptInput).then(answers => {
            console.log('已输入iOS的bundleID：'+answers.bundleID); // 返回的结果
            
            let bundleID = answers.bundleID; 
        
            setBundleIDBegin(bundleID);
        });
    }

    
}

var setBundleIDBegin = function (bundleID) {

    let projFile = './project.json';
    let rs = updateBundleIDToJson(projFile, bundleID);
    if(rs == SUCCESS) {
        var result = JSON.parse(fs.readFileSync(projFile));
        console.log("包名"+ result.config.bundleID +"更新成功");
    }
    
}

function updateBundleIDToJson(projfile, bundleID) {
    
    var result = JSON.parse(fs.readFileSync(projfile).toString());
  
    result.config.bundleID= bundleID ;
 
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

exports.setBundleID = setBundleID