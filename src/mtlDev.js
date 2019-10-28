"use strict";
const mtldev = require("mtl-dev-sdk");
const { consoleLog, getWorkSpace, evalJs,isWindows } = require("./m_util.js");
const mtlLog = consoleLog;
const mtlProject = {
  workspace: getWorkSpace(),
  building: undefined
};

const execJs = url => {
  evalJs(url);
};
function execCommand(cmd,path) {
  consoleLog("------shell");
  mtldev.shellExec(cmd,path);
}

mtldev.buildAndroid = function(options, callback) {
  _build("android", callback, options);
};
mtldev.buildIOS = function(options, callback) {
  _build("ios", callback, options);
};

function _build(pla, callback, options) {
  mtlProject.building = `编译坏境 正在 build ${pla} ，请等待。。。。`;
  mtlLog(mtlProject.building);
  try {
    mtldev.build(
      pla,
      function(res) {
        mtlProject.building = undefined;
        callback(res);
      },
      options
    );
  } catch (e) {
    mtldev(e);
  }
}

module.exports = {
  mtldev,
  mtlLog,
  execJs,
  execCommand,
  mtlProject,
  isWindows
};
