let mtl = (function () {

  let instance = {};

  instance.baseUrl = 'https://mdoctor.yonyoucloud.com/debugger/demo/app'

  // 获取起始页面
  instance.getStartPage = function ({ baseUrl = this.baseUrl, success, fail, complete }) {
    dd.httpRequest({
      url: `${baseUrl}/project.json`,
      success: res => {
        if (res.status == 200) {
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