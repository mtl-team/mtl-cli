Page({
  data: {
    
  },
  onLoad(query) {
    // 页面加载
    this.setData({
      query: JSON.stringify(query)
    });
  },
  onPostMessage(){
    return this.data;
  },
  onReady() {
    let baseUrl = 'http://localhost:3000';
    let url = `${baseUrl}/project.json`;
    dd.httpRequest({
      url: url,
      success: res => {
        if (res.status == 200) {
          let { startPage, technologyStack } = res.data.config;
          let port = 3000;
          if (technologyStack === 'mdf') {
            port = 3003;
          }
          baseUrl = `http://localhost:${port}`

          let appCode = res.data.config.ddAppCode;
          if (startPage && startPage.indexOf('http') == -1) {
            res.pageUrl = `${baseUrl}/${startPage}`;
          } else {
            res.pageUrl = `${startPage}`;
          }
          this.setData({
            url: res.pageUrl,
            appCode: appCode,
            baseUrl: baseUrl,
            serviceUrl:res.data.config.serviceUrl
          })
        }
      },
      fail: res => {
        console.log('fail', res);
      }
    });
    
  },
  onShow() {
    // 页面显示
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
});
