const { execJs, mtlProject} = require("../src/mtlDev");

/**
 * 脚本配置文件，不设置则从工程配置文件取默认值，同时会更改工程配置文件
 */
const config = {
  staticFilePath: "app/", //配置静态文件路径
  platform:"dd"
};

Object.assign(mtlProject,config);
execJs("/script/util/debug.js");
