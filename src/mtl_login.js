const configFile = require('./config');
const Configstore = require('configstore');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);
const request = require("request");
const mtlConfig = require('./mtl_config');

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
    let sendResult = await mtlConfig.send({
      url: 'http://codingcloud5.dev.app.yyuap.com/codingcloud/gentplrepweb/list/mtl'
    });
    console.log(sendResult);
    // 开始下载
    await mtlConfig.download({
      url: 'http://codingcloud5.dev.app.yyuap.com/codingcloud/genweb/downloadIuapFe?projectCode=mtl'
    }, 'mtl.zip');
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
