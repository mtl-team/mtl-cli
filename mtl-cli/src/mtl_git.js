const shell = require("shelljs");
const request = require("request");
const conf = require("./mtl_config");
const util = require('util');
const config = require('./config');

const pushnr = function (url) {
    exec("git remote remove origin");
    exec("git remote add origin " + url);
    exec("git push -u origin master");
}

/**
 * 创建仓库
 * 
 * @param {*} name 
 * @param {*} description 
 */
const repo = function (name, description, callback) {

    let options = {
        url: config.GOGS_CREATEREPO_URL,
        headers: {
            "content-type": "application/json",
        },
        form: {
            name: name,
            description: description,
            private: false
        }
    };
    request.post(options, function (error, response, body) {
        if(error) {
            console.log(error);
            return "error";
        } else {
            let result = JSON.parse(body);
            let clone_url = result.clone_url;
            callback(clone_url);
        }
        
    });       
       
}

/**
 * 创建用户
 * 
 * @param {*} username 
 * @param {*} password 
 * @param {*} email 
 */
const user = function (username, password, email) {
    if (!email) {
        email = username + "@yonyou.com";
    }
    const options = {
        url: conf.GOGS_CREATEUSER_URL,
        headers: {
            "content-type": "application/json",
        },
        form: {
            username: username,
            password: password,
            email: email
        }
    };
    request.post(options, function (error, response, body) {
        let result = JSON.parse(body);
        console.log("create user " + username + " success.");
        listToken(username, password);
    });
}

/**
 * 获取token
 * 
 * @param {username} username 
 * @param {password} password 
 */
const listToken = function (username, password) {
    const url = util.format(config.GOGS_TOKEN_URL, username);
    request.get(url, function (error, response, body) {
        if ("[]" == body) {
            createToken(username, password);
            return;
        }
        let result = JSON.parse(body);
        let token = result[0].sha1;
        conf.config("git.token", token);
        console.log("get access token success.");
    }).auth(username, password, true);
}

/**
 * 生成token
 * 
 * @param {username} username 
 * @param {password} password 
 */
const createToken = function (username, password) {
    let options = {
        url: util.format(config.GOGS_TOKEN_URL, username),
        headers: {
            "content-type" : "application/json",
            "Authorization" : generateAuthorization(username, password)
        },
        form: {
            name: new Date().getTime()
        }
    };
    request.post(options, function (error, response, body) {
        let result = JSON.parse(body);
        conf.config("git.token", result.sha1);
        console.log("create git access token success.");
    });
}

/**
 * 生成认证
 * 
 */
const generateAuthorization = function (username, password) {
    var b = Buffer.from(username + ":" + password);
    return "Basic " + b.toString('base64');
}

const exec = function (cmd) {
    shell.exec(cmd);
}

// user("student4", "student4");

exports.pushnr = pushnr
exports.repo = repo;
exports.user = user;