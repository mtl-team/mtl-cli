const config = {
    CONFIG_STORE_FILENAME: 'userinfo',
    CONFIG_BUILDSERVER_URL: '123.103.9.204',
    CONFIG_BUILDSERVER_PORT: '8050',
    CONFIG_BUILDPROJECT_API: '/ump/web/mtlCordovabuild/mtlCordovaBuildProject',
    GOGS_CREATEREPO_URL: 'https://gogs.yonyoucloud.com/api/v1/user/repos?token=4aa94dbbc64dd165002d811c978206f96a3c2343',
    GOGS_CREATEUSER_URL: 'https://gogs.yonyoucloud.com/api/v1/admin/users?token=8c6ce9323326c5f83a7295063ec40c52ceaea12f',
    GOGS_TOKEN_URL: 'https://gogs.yonyoucloud.com/api/v1/users/%s/tokens',
    // 友户通登录开发者中心取票
    YHT_LOGIN_BY_DEVELOP_URL: 'https://euc.yonyoucloud.com/cas/login?sysid=developer&service=https://developer.yonyoucloud.com:443/portal/sso/login.jsp',
    // 开发者中心验票
    DEVELOP_TICKET: 'https://developer.yonyoucloud.com:443/portal/sso/login.jsp',
    // 开发者中心UA
    DEVELOP_HTTP_HEADER_UA: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
    // 开发者中心Referer
    DEVELOP_HTTP_HEADER_REFERER: 'https://developer.yonyoucloud.com',
};
module.exports = config;