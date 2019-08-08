Page({
  onLoad(option) {
    let _this = this;
    let baseUrl = 'http://mobile.yyuap.com:3000';
    let url = `${baseUrl}/project.json`;
    console.log("onLoad");
    wx.login({
      success: res => {
        let authCode = res.code;
        if (authCode) {
          wx.request({
            url: url,
            success: res => {
              console.log('success', res);
              if (res.statusCode == 200) {
                let startPage = res.data.config.startPage;
                let appCode = res.data.config.wxAppCode;
                if (startPage && startPage.indexOf('http') == -1) {
                  res.pageUrl = `${baseUrl}/${startPage}`;
                } else {
                  res.pageUrl = `${startPage}`;
                }
                res.pageUrl = `${res.pageUrl}?authCode=${authCode}&appCode=${appCode}`
                _this.setData({
                  url: res.pageUrl,
                })
                console.log('url=', _this.data.url);
              }
            },
            fail: res => {
              console.log('fail', res);
            }
          })
        }
      }
    });
   

  }
})