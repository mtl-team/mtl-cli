const { execJs, mtlProject} = require("../src/mtlDev");

/**
 * 脚本配置文件，不设置则从工程配置文件取默认值，同时会更改工程配置文件
 */
const config = {
  reactStaticPath: "public/", //react静态路径路径
  platform:"android",
  script:"npm run start"//启动本地服务
};

Object.assign(mtlProject,config);
execJs("/script/util/debug.js");
