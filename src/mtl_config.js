const rp = require('request-promise');
const utils = require('utility');
const configFile = require('./config');
const Configstore = require('configstore');
const conf = new Configstore(configFile.CONFIG_STORE_FILENAME);
const fse = require('fs-extra');
const path = require('path');

const config = function (key, value) {
    if (key == null || value == null) {
        console.log('Missing parameters. must be  config [key] [value]');
        return;
    }
    conf.set(key, value);
    // console.log('config success');
};

/**
 * 获得友户通单点登录票据
 *
 * @param {*} { username, password } 用户名、密码
 * @returns {JSON} {success,ticket,body}
 */
const getYhtTicket = async function ({ username, password }) {
    let formData = {
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
    }
    // 构建登录友户通目的为了获得ticket
    let options = {
        url: configFile.YHT_LOGIN_BY_DEVELOP_URL,
        headers: {
            'User-Agent': configFile.DEVELOP_HTTP_HEADER_UA
        },
        jar: true,
        method: 'post',
        form: formData
    };
    conf.set('username', username);
    conf.set('shaPassword', utils.sha1(password));
    conf.set('md5Password', utils.md5(password));

    let resultJSON = {};
    let yht_ticket_data = await rp(options);
    let result = yht_ticket_data.indexOf('?ticket=');
    if (result !== -1) {
        console.log('友户通取票成功');
        // 取票
        let ticket = yht_ticket_data.split('?ticket=')[1].split('";')[0];
        resultJSON['success'] = true;
        // 写票
        resultJSON['ticket'] = ticket;
        conf.set('ticket', ticket);
        // 返回原始body
        resultJSON['body'] = yht_ticket_data;
    } else {
        resultJSON['success'] = false;
        conf.delete('username');
        console.log("取票失败，清除用户本地登录信息，此时创建工程将会读取本地工程或页面模板！");
    }
    return resultJSON;
}

/**
 * 开发者中心验票
 *
 * @param {*} { ticket } 票据
 * @returns {JSON} {success,body}
 */
const getValidateTicketDevelop = async function ({ ticket }) {
    let options = {
        url: configFile.DEVELOP_TICKET,
        qs: {
            ticket
        },
        jar: true,
        method: 'get',
        headers: {
            'Upgrade-Insecure-Requests': 1,
            'User-Agent': configFile.DEVELOP_HTTP_HEADER_UA,
            'Referer': configFile.DEVELOP_HTTP_HEADER_REFERER
        },
    }
    let resultJSON = {};
    let yht_validate_ticket_data = await rp(options);
    let result = yht_validate_ticket_data.indexOf('/fe/fe-portal/index.html');
    if (result !== -1) {
        console.log('开发者中心验票授权成功');
        resultJSON['success'] = true;
        resultJSON['body'] = yht_validate_ticket_data;
    } else {
        resultJSON['success'] = false;
        conf.delete('username');
        return utils.reportError("验票失败，清除用户本地登录信息，此时创建工程将会读取本地工程或页面模板！");
    }
    // 读取完整的Cookies
    await rp(options, function (err, res, body) {
        if (body.indexOf('/fe/fe-portal/index.html') !== -1) {
            let devcookie = res.request.req.getHeader('cookie');
            conf.set('cookie', devcookie);
            // console.log(devcookie);
        }
    });
    return resultJSON;
}

const send = async function (options) {
    let opts = {
        jar: true,
        method: 'get',
        headers: {
            'cookie': conf.get('cookie'),
            'Upgrade-Insecure-Requests': 1,
            'User-Agent': configFile.DEVELOP_HTTP_HEADER_UA,
            'Referer': configFile.DEVELOP_HTTP_HEADER_REFERER
        }
    }
    opts = { ...opts, ...options };
    let result = await rp(opts)
    .catch(function (err) {
        console.log("请求失败，请重新登录了！");
        return utils.reportError("或清除用户信息，取本地模板！");
    });
     //console.log(result)
    return result;
}

const download = async function (options, callback, filename) {
    let opts = {
        method: 'get',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
            'Connection': 'keep-alive',
            'Cookie': conf.get('cookie'),
            'Upgrade-Insecure-Requests': 1,
            'User-Agent': configFile.DEVELOP_HTTP_HEADER_UA,
            'Referer': configFile.DEVELOP_HTTP_HEADER_REFERER
        }
    }
    opts = { ...opts, ...options };
    // 获得文件夹路径
    let fileFolder = path.dirname(filename);
    // 创建文件夹
    fse.ensureDirSync(fileFolder);
    // 开始下载无需返回
    return await rp(opts).pipe(fse.createWriteStream(filename)).on('close', callback);
}
/**
 * 清除用户信息 xyc
 */
const clearUserInfo = function (){
    conf.delete('username');
    console.log("用户信息清除完毕！");
}
exports.config = config;
exports.getYhtTicket = getYhtTicket;
exports.getValidateTicketDevelop = getValidateTicketDevelop;
exports.send = send;
exports.download = download;
exports.clearUserInfo = clearUserInfo;