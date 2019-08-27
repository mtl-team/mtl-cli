Page({
  onLoad(option) {
    wx.request({
      url: 'http://localhost:3000/project.json',
      success: res => {
        let { startPage, technologyStack } = res.data.config;
        let port = 3000;
        if (technologyStack === 'mdf') {
          port = 3003;
        }
        let url = `http://localhost:${port}/${startPage}`
        this.setData({
          url: url
        })
      }
    })
  }
})