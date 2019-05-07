const configFile = require('./config');
const Configstore = require('configstore');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);
const request = require("request");
const utils = require('utility');
let j = request.jar();

const httppost = function (postdata) {
  // 构建登录友户通目的为了获得ticket
  const options = {
    url: 'https://euc.yonyoucloud.com/cas/login?sysid=developer&service=https://developer.yonyoucloud.com/portal/sso/login.jsp',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
    },
    jar: j,
    form: postdata
  };

  request.post(options, function (error, response, body) {
    // 是否登录成功
    const result = body.indexOf('?ticket=');
    if (result !== -1) {
      let cookie_string = j.getCookieString(options.url);
      // let cookies = j.getCookies(options.url);
      // 筛选出票据
      let ticket = body.split('?ticket=')[1].split('";')[0];
      // console.log(cookie_string);
      // console.log(cookies);
      // console.log(body);
      console.log("login success.");
      conf.set("username", postdata.username);
      conf.set('ticket', ticket);
      console.log("ticket", ticket);

      request({
        url: `https://developer.yonyoucloud.com/portal/sso/login.jsp`,
        qs:{
          ticket
        },
        method: 'get',
        headers: {
          'Cookie': cookie_string,
          'Upgrade-Insecure-Requests': 1,
          'Referer': 'https://euc.yonyoucloud.com/cas/login?sysid=developer&service=https://developer.yonyoucloud.com/portal/sso/login.jsp'
        },
      }, function (err, res, body) {
        console.log(body);
        // console.log(res)
        // console.log(res.headers['set-cookie']);
        // 最终测试
        // request({
        //   url: `https://package.yonyoucloud.com/npm/package/mypublish`,
        //   method: 'get',
        //   headers: {
        //     'Cookie': res.headers['set-cookie']
        //   }
        // }, function (err, res, body) {
        //   console.log(body);
        //   // console.log(res)
        //   console.log(res.headers);
        // });
      });

      //mock.yonyoucloud.com/api/user/login_by_token

      // request({
      //   url: `https://developer.yonyoucloud.com/portal/sso/login.jsp`,
      //   method: 'get',
      //   qs: {
      //     ticket
      //   },
      //   headers: {
      //     'Cookie': cookie_string,
      //     'Upgrade-Insecure-Requests': 1,
      //     'Referer': 'https://euc.yonyoucloud.com/cas/login?sysid=developer&service=https%3A%2F%2Fdeveloper.yonyoucloud.com%3A443%2Fportal%2Fsso%2Flogin.jsp'
      //   },
      // }, function (err, res, body) {
      //   console.log(body);
      //   // console.log(res)
      //   console.log(res.headers);
      // });
    } else {
      console.log("login failed. please try again.");
    }
  });
}

/**
 * 
 *
 * @param {*} username
 * @param {*} password
 */
const login = function (username, password) {
  httppost({
    username: username,
    shaPassword: utils.sha1(password),
    md5Password: utils.md5(password),
    tenantCode: 'default',
    tenantid: -1,
    lt: '',
    execution: '',
    _eventId: 'submit',
    tokeninfo: null,
    isAutoLogin: 0,
    randomvalue: 1557123285843,
    validateCode: '',
    validateKey: 1557123285000
  })
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
