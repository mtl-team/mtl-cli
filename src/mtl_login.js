const configFile = require('./config');
const Configstore = require('configstore');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);
const request = require("request");
const utils = require('utility');
const rp = require('request-promise');
const mtlConfig = require('./mtl_config');


const httppost = async function (postdata) {

  // let yht_ticket_data = await rp(options);
  // // console.log(yht_ticket_data);
  // let result = yht_ticket_data.indexOf('?ticket=');
  // if (result !== -1) {
  //   console.log("login success.");
  //   // 取票
  //   let ticket = yht_ticket_data.split('?ticket=')[1].split('";')[0];
  //   console.log(ticket);
  // } else {
  //   console.log("login failed. please try again.");
  // }

  // request.post(options, function (error, response, body) {
  //   // 是否登录成功
  //   const result = body.indexOf('?ticket=');
  //   if (result !== -1) {
  //     // 筛选出票据
  //     let ticket = body.split('?ticket=')[1].split('";')[0];
  //     // console.log(body);
  //     console.log("login success.");
  //     conf.set("username", postdata.username);
  //     conf.set('ticket', ticket);
  //     console.log("ticket", ticket);
  //     // console.log(response.headers['set-cookie']);


  //     request({
  //       url: `https://developer.yonyoucloud.com:443/portal/sso/login.jsp`,
  //       qs: {
  //         ticket
  //       },
  //       jar: true,
  //       method: 'get',
  //       headers: {
  //         // 'cookie': response.headers['set-cookie'],
  //         'Upgrade-Insecure-Requests': 1,
  //         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
  //         'Referer': 'https://euc.yonyoucloud.com/cas/login?sysid=developer&service=https://developer.yonyoucloud.com:443/portal/sso/login.jsp'
  //       },
  //     }, function (err, res, body) {
  //       console.log(body);
  //       // console.log(res.headers)
  //       // console.log(res.headers);
  //       // 最终测试
  //       request({
  //         url: `https://developer.yonyoucloud.com/fe/fe-portal/index.html`,
  //         method: 'get',
  //         jar: true,
  //       }, function (err, res, body) {
  //         // console.log(body);
  //         // console.log(res.request.headers)
  //         // console.log(res.headers);
  //         request({
  //           url: `https://developer.yonyoucloud.com/portal/web/v1/menu/sidebarList`,
  //           method: 'get',
  //           jar: true,
  //           headers: {
  //             // 'cookie': response.headers['set-cookie'],
  //             'Upgrade-Insecure-Requests': 1,
  //             'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
  //             'Referer': 'https://euc.yonyoucloud.com/cas/login?sysid=developer&service=https://developer.yonyoucloud.com:443/portal/sso/login.jsp'
  //           }
  //         }, function (err, res, body) {
  //           console.log(body);
  //         });
  //       });
  //     });

  //     //mock.yonyoucloud.com/api/user/login_by_token

  //     // request({
  //     //   url: `https://developer.yonyoucloud.com/portal/sso/login.jsp`,
  //     //   method: 'get',
  //     //   qs: {
  //     //     ticket
  //     //   },
  //     //   headers: {
  //     //     'Cookie': cookie_string,
  //     //     'Upgrade-Insecure-Requests': 1,
  //     //     'Referer': 'https://euc.yonyoucloud.com/cas/login?sysid=developer&service=https%3A%2F%2Fdeveloper.yonyoucloud.com%3A443%2Fportal%2Fsso%2Flogin.jsp'
  //     //   },
  //     // }, function (err, res, body) {
  //     //   console.log(body);
  //     //   // console.log(res)
  //     //   console.log(res.headers);
  //     // });
  //   } else {
  //     console.log("login failed. please try again.");
  //   }
  // });
}

/**
 * 
 *
 * @param {*} username
 * @param {*} password
 */
const login = async function (username, password) {
  // 从友户通取票
  let yht_ticket = await mtlConfig.getYhtTicket({ username, password });
  // 票据是否成功
  if (yht_ticket.success) {
    console.log("login success.");
    // console.log(yht_ticket.ticket);
    // 去开发者中心验票获得登录授权
    let validate_ticket = await mtlConfig.getValidateTicketDevelop({ ticket: yht_ticket.ticket });
    // console.log(validate_ticket);
    let resultA = await mtlConfig.sendGet({ url: 'https://developer.yonyoucloud.com/portal/web/v1/menu/sidebarList' });
    console.log(resultA)
  } else {
    console.log("login failed. please try again.");
  }
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
