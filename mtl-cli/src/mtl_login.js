const configFile = require('./config');
const Configstore = require('configstore');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);
const request = require("request");

const httppost = function (postdata) {
    const options = {
        url: 'http://localhost:8888/auth/login',
        form: postdata
    };

    request.post(options, function (error, response, body) {
        const result = JSON.parse(body);
        if (result.status == 1) {
            console.log("login success.")
            conf.set("username", postdata.username);
            conf.set("token", result.token);
        } else {
            console.log("login failed. please try again.");
        }
    });
}

const login = function (username, password) {
    httppost({ username: username, password: password })
}

const checkUser = function (callback) {
    const options = {
      url: 'http://localhost:8888/auth/checkUserByToken',
      form: {
        "username": conf.get("username"),
        "token": conf.get("token")
      }
    };

    request.post(options, function (error, response, body) {
      const result = JSON.parse(body);
      callback(result.status == 1);
    });
  }
exports.login = login
exports.checkUser = checkUser;
