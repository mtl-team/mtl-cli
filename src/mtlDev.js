"use strict";
const mtldev = require("mtl-dev-sdk");
const join = require('path').join;
const {consoleLog} = require("./m_util.js");
const mtlLog =  consoleLog;

const execJs = url => {
  try {
    let jsfile = join(path, url);
    let jsctx = fs.readFileSync(jsfile, {
      encoding: "utf-8"
    });
    eval(jsctx);
  } catch (e) {
    mtlLog(e);
  }
};
function execCommand(cmd){
  mtlLog(cmd);
  mtldev.shellExec(cmd);
}


module.exports = {
  mtldev,
  mtlLog,
  execJs,
  execCommand,
};
