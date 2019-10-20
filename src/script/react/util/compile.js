const { mtldev, mtlLog } = require("../src/mtlDev");

const pla = "android";
const script = "npm run build";

execCompile();

function execCompile() {
  mtlLog(`编译 : ${pla} ,代码`);
  //初始化 2 react 设置静态文件路径
  mtldev.setStaticFilePath("build/");
  mtlLog(
    `编译脚本 ${script}，脚本可以自定义，修改util/compile.js 即可  请稍等........`
  );
  build();
}

function build() {
  let promise = new Promise(function(resolve, reject) {
    setTimeout(() => {
      mtldev.shellExec(script);
      resolve();
    }, 300);
  });
  promise.then(function() {
    //编译
    mtldev.compile(pla);
    mtlLog(`编译 : ${pla} ,完成`);
  });
}
