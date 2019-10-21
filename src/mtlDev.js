"use strict";
const mtldev = require("mtl-dev-sdk");
const join = require('path').join;
const { consoleLog, getWorkSpace, evalJs } = require("./m_util.js");
const mtlLog = consoleLog;
const mtlProject = {
  workspace: getWorkSpace(),
  building: undefined
};

const execJs = url => {
  evalJs(url);
};
function execCommand(cmd) {
  mtlLog(cmd);
  mtldev.shellExec(cmd);
}


module.exports = {
  mtldev,
  mtlLog,
  execJs,
  execCommand,
  mtlProject
};
