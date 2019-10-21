const {execCommand} = require("../src/mtlDev");
// npm / yarn / cnpm  根据自己的镜像环境而定

// debug 需要依赖 启动本地服务
execCommand(`npm install  express`);

// react 安装本地依赖
execCommand(`npm install`);

// react 编译静态文件
execCommand(`npm run build`);



