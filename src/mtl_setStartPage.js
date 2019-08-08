const fs = require('fs-extra');
const inquirer = require('inquirer');
const SUCCESS = "success";
const promptInput = {
    type: 'input',
    message: '请输入首页目录：',
    name: 'startPage',
    filter: function (val) {
        return val;
    }
};



var setStartPage = function (startPage) {
    if (startPage) {

        console.log('输入的首页目录：' + startPage);
        setStartPageBegin(startPage);
    } else {

        inquirer.prompt(promptInput).then(answers => {
            console.log('已输入的首页目录：' + answers.startPage); // 返回的结果

            let startPage = answers.startPage;

            setStartPageBegin(startPage);
        });
    }


}

var setStartPageBegin = function (startPage) {

    let projFile = './project.json';
    let rs = updatesStartPageToJson(projFile, startPage);
    if (rs == SUCCESS) {
        var result = JSON.parse(fs.readFileSync(projFile));
        console.log("更新后首页目录：" + result.config.startPage + "更新成功");
    }

}

function updatesStartPageToJson(projfile, startPage) {

    var result = JSON.parse(fs.readFileSync(projfile).toString());
    console.log("当前首页目录：" + result.config.startPage);

    result.config.startPage = startPage;

    //回写

    fs.writeFileSync(projfile, formatJson(result), { flag: 'w', encoding: 'utf-8', mode: '0666' });

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

exports.setStartPage = setStartPage