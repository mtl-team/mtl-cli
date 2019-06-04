Page({
  onLoad(option) {
    wx.request({
      url: 'http://mobile.yyuap.com:3000/project.json',
      success: res => {
        let startPage = res.data.config.startPage
        let url = 'http://mobile.yyuap.com:3000/' + startPage
        this.setData({
          url: url
        })
      }
    })
  }
})