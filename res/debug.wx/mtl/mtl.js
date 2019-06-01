let mtl = (function () {

  let instance = {};

  instance.baseUrl = 'http://localhost:3000'

  // 获取起始页面
  instance.getStartPage = function ({ baseUrl = this.baseUrl, success, fail, complete }) {
    wx.request({
      url: `${baseUrl}/project.json`,
      complete: res => {
        if (res.statusCode == 200) {
          console.log(res);
          let startPage = res.data.config.startPage;
          if (startPage) {
            res.pageUrl = `${baseUrl}/${startPage}`;
            if (success) success(res);
            if (complete) complete(res);
            return;
          }
        }
        if (fail) fail(res);
        if (complete) complete(res);
      }
    })
  }
  return instance;

})();

export { mtl }