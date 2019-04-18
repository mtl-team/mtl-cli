const config = {
    CONFIG_STORE_FILENAME : 'userinfo',
    CONFIG_BUILDSERVER_URL : '123.103.9.204',
    CONFIG_BUILDSERVER_PORT : '8050',
    CONFIG_BUILDPROJECT_API : '/ump/web/mtlCordovabuild/mtlCordovaBuildProject',
    GOGS_CREATEREPO_URL: 'https://gogs.yonyoucloud.com/api/v1/user/repos?token=4aa94dbbc64dd165002d811c978206f96a3c2343',
    GOGS_CREATEUSER_URL: 'https://gogs.yonyoucloud.com/api/v1/admin/users?token=8c6ce9323326c5f83a7295063ec40c52ceaea12f',
    GOGS_TOKEN_URL: 'https://gogs.yonyoucloud.com/api/v1/users/%s/tokens'
};
module.exports = config;