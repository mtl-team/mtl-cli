"use strict";
const _mtldev = require("mtl-dev-sdk");
const vscode = require("vscode");
const terminal = vscode.window.createTerminal({ name: "mtl-ide" });
const fs = require("fs");
const join = require("path").join;
const { mtlLog, getOSPath, isWindows } = require("./mtlUtil");
const mtldev = _mtldev;

let workspace = vscode.workspace.workspaceFolders;
let path = workspace && workspace.length > 0 && workspace[0].uri.path;
path = getOSPath(path);
if (!path) {
  mtlLog("workspace is empty");
}
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
function execCommand(cmd, newtermin) {
  if (newtermin) {
    let newt = vscode.window.createTerminal({ name: newtermin });
    newt.show(true);
    newt.sendText(cmd);
  } else {
    terminal.show(true);
    terminal.sendText(cmd);
  }
}
//初始化 1
mtldev.initWorkspace(path, mtlLog);
const mtlProject = {
  workspace: path,
  building: undefined
};
mtlLog(`workspace: ${path}`);

mtldev.showImage = function(res) {
  let option = {
    viewColumn: vscode.ViewColumn.One
  };
  vscode.commands.executeCommand("vscode.open", parseByOS(res), option);
};

mtldev.buildAndroid = function(options, callback) {
  _build("android", callback, options);
};
mtldev.buildIOS = function(options, callback) {
  _build("ios", callback, options);
};


function _build(pla, callback, options) {
  mtldev.initWorkspace(path, mtlLog);
  if (!mtlProject.building) {
    mtlProject.building = `编译坏境 正在 build ${pla} ，请等待。。。。`;
    mtlLog(mtlProject.building, true);
    _mtldev.build(
      pla,
      function(res) {
        mtlProject.building = undefined;
        callback(res);
      },
      options
    );
  } else {
    mtlLog(`${mtlProject.building}完成后再执行其他编译`);
  }
}

function parseByOS(filename) {
  if (isWindows()) {
    return vscode.Uri.parse(`/${filename}`);
  }
  return vscode.Uri.parse(filename);
}

module.exports = {
  mtldev,
  mtlLog,
  execJs,
  mtlProject,
  execCommand,
};
