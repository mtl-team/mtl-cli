module.exports = {
    run : function(cmd,name,file) {
        start(cmd,name,file);
    }
};

function start(cmd,name,file) {
    switch(cmd) {
        case 'list':
           list();
           break;
        case 'add':
           add(name, file);
           break;
        case 'update':
           update(name, file);
           break;
        case 'remove':
           remove(name);
           break;
        default:
           console.log('不支持的命令 - ' + cmd);
    }
}

function list() {
    console.log("当前版本支持的插件")
    let tplLibs = require("../res/plugin.json");
    for(var key in tplLibs) {
        let item = tplLibs[key];
        console.log(key + "\t\t" + item["desc"]);
    }
}

function add(name, file) {
    console.log("开始上传插件 - " + name);
    console.log("...");
    console.log("上传成功");
}

function update(name,file) {
    console.log("开始更新插件 - " + name);
    console.log("...");
    console.log("上传成功");
}

function remove(name) {
    console.log("开始删除插件 - " + name);
    console.log("...");
    console.log("删除成功");
}

