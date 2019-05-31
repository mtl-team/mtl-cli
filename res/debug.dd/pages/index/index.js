import { mtl } from '../../mtl/mtl';
import uuid from '../../utils/uuid.js'
let app = getApp();

Page({
  data: {
    // url: 'https://mdoctor.yonyoucloud.com/debugger/ssssss/app/example.html'
    // url: 'http://littlemeaning.gz01.bdysite.com',
    // url:'http://172.20.4.61:8080/mobile/#/login'
    // url: 'http://jetyonyou.vaiwan.com/example.html',
  },
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
     this.webViewContext = dd.createWebViewContext('web-view-1');
  },
  onReady() {
    let _this = this;
    console.log("ready");
    mtl.getStartPage({
      success: res => {
        console.log('res', res.pageUrl)
        _this.setData({
          url: res.pageUrl,
        })
        console.log('url=', _this.data.url);
      },
      
    })
  },
  onShow() {
    // 页面显示
    console.log('url=', this.data.url);
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

  onAlert(obj) {
    if (app.global.debug) {
      dd.alert({
        title: 'action',
        content: `${obj.action}`
      })
    }
  },
  onAction(e) {
    let obj = e.detail;
    this[obj.action](obj);
    this.onAlert(obj);
  },
  /**
   * 扫一扫，支持扫描二维码和条形码
   * @param {*} obj 
   */
  scanQRCode(obj) {
    let _this = this;
    let { scanType } = obj;
    let scanObject = { type: scanType };
    Object.assign(scanObject, _this.getCommonObject(obj))
    scanObject.success = (res) => {
      obj.method = 'success'
      res.resultStr = res.code;
      obj.parameters = res;
      _this.webViewContext.postMessage(obj);
    }
    dd.scan(scanObject)
  },

  getCommonObject(obj) {
    let _this = this;
    return {
      success: (res) => {
        obj.method = 'success'
        obj.parameters = res;
        dd.alert({ content: 'success' });
        _this.webViewContext.postMessage(obj);
      },
      fail: res => {
        obj.method = 'fail'
        obj.parameters = res;
        dd.alert({ content: 'fail' });
        _this.webViewContext.postMessage(obj);
      },
      // complete: res => {
      //   obj.method = 'complete'
      //   obj.parameters = res;
      //   dd.alert({ content: 'success' });
      //   _this.webViewContext.postMessage(obj);
      // }
    }
  },
  /**
    * 保留当前页面，跳转到应用内的某个指定页面，可以使用 dd.navigateBack 返回到原来页面。
    * @param {{ page: 'index',parameters: {key: 'value'}}} obj 
    */
  navigateTo(obj) {
    let _this = this;
    let target = { url: _this._getUrl(obj) }
    Object.assign(target, _this.getCommonObject(obj))
    dd.navigateTo(target)
  },

  /**
   * 关闭当前页面，跳转到应用内的某个指定页面。
   * @param {*} obj 
   */
  redirectTo(obj) {
    let _this = this;
    let target = { url: _this._getUrl(obj) }
    Object.assign(target, _this.getCommonObject(obj))
    dd.redirectTo(target);
  },

  /**
   * 关闭当前页面，返回上一页面
   */
  navigateBack() {
    dd.navigateBack({
      delta: 1
    })
  },

  /**
   * 拍照或从手机相册中选图接口
   * @param {*} obj 
   */
  chooseImage(obj) {
    let _this = this;
    let target = {
      count: obj.count || 9,
      sourceType: obj.sourceType || ['album', 'camera']
    }
    Object.assign(target, _this.getCommonObject(obj))
    target.success = (res) => {
      let resource = {};
       resource.localIds = res.filePaths.map(value => {
        //todo 生成唯一的UUID
        let localId = uuid(22);
        app.global.localIds[localId] = value;
        value = localId;
        return value;
      });
      dd.alert({
        content: `${JSON.stringify(resource)}`
      })
      obj.method = 'success'
      obj.parameters = resource;
      _this.webViewContext.postMessage(obj);
    }
    dd.chooseImage(target);
  },

  /**
   * 预览图片接口
   * @param {*} obj 
   */
  previewImage(obj) {
    let currentLink = obj.current;
    let current = obj.urls.indexOf(currentLink);
    dd.previewImage({
      current: current, //当前显示图片索引，默认 0
      urls: obj.urls || [], //要预览的图片链接列表
    });
  },

  /**
   * 上传图片接口
   * @param {*} obj 
   */
  uploadImage(obj) {
    //todo 需要在开发者后台将上传URL设置为HTTP安全域名
    obj.fileType = 'image';
    this.uploadFile(obj)
  },

  /**
   * 上传文件
   * @param {*} obj 
   */
  uploadFile(obj) {
    let url = "";
    let fileType = obj.fileType;
    let localId = obj.localId;
    let filePath = app.global.localIds[localId];
    let fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    let target = {
      url: url,
      fileType: fileType,
      fileName: fileName,
      filePath: filePath
    }
    Object.assign(target, this.getCommonObject(obj));
    dd.uploadFile(target);
  },

  /**
   * 下载图片接口
   * @param {*} obj 
   */
  downloadImage(obj) {
    this.downloadFile(obj);
  },

  downloadFile(obj) {
    let _this = this;
    let url = "",
      serverId = obj.serverId;
    //todo 通过serverId请求服务器获取图片链接
    let target = {
      url: url
    }
    Object.assign(target, this.getCommonObject(obj));
    target.success = (res) => {
      let localId = uuid(22);
      app.global.localIds[localId] = res.apFilePath || res.filepath;
      obj.method = 'success'
      obj.parameters = resource;
      _this.webViewContext.postMessage(obj);
    }
    dd.downloadFile(target);
  },

  /**
   * 获取本地图片 imgSrc 接口
   * @param {*} obj 
   */
  getLocalImgSrc(obj) {
    let src = app.global.localIds[obj.localId];
    dd.alert({
      title: 'src',
      content: `${src}`
    });
    if (src) {
      obj.method = 'success'
      let res = {
        imgSrc: src
      };
      obj.parameters = res;
      this.webViewContext.postMessage(obj);
    } else {
      obj.method = 'fail'
      obj.parameters = '图片没有找到';
      this.webViewContext.postMessage(obj);
    }

  },
  /**
   * 获取本地图片 base64 接口
   * 未完成
   * @param {*} obj 
   */
  getLocalImgData(obj) {
    let src = app.global.localIds[obj.localId];
    if (src) {
      obj.method = 'success'
      let res = {
        localData: src
      };
      obj.parameters = res;
      this.webViewContext.postMessage(obj);
    } else {
      obj.method = 'fail'
      obj.parameters = '图片没有找到';
      this.webViewContext.postMessage(obj);
    }
  },

  /**
   * 获取地理位置接口
   * @param {*} obj 
   */
  getLocation(obj) {
    let _this = this;
    dd.alert({
      title: 'action',
      content: `${obj.action}`
    })
    dd.getLocation({
      success: (res) => {
        obj.method = 'success';
        obj.parameters = res;
        _this.webViewContext.postMessage(obj);
      },
      fail: res => {
        obj.method = 'fail';
        obj.parameters = res;
        _this.webViewContext.postMessage(obj);
      },
      complete: res => {
        obj.method = 'complete'
        obj.parameters = res;
        _this.webViewContext.postMessage(obj);
      }
    });
  },

  /**
   * 使用内置地图查看位置接口
   * @param {*} obj 
   */
  openLocation(obj) {
    let _this = this;
    dd.alert({
      title: 'action',
      content: `${obj.action}`
    })
    let { latitude = 0, longitude = 0, name = '', address = '', scale = 1, infoUrl = '' } = obj;
    if (scale > 19) {
      scale = 19;
    }
    dd.openLocation({
      longitude: longitude,
      latitude: latitude,
      name: name,
      address: address,
      scale: scale
    });
  },

  /**
   * 获取网络状态
   * @param {*} obj 
   */
  getNetworkType(obj) {
    let _this = this;
    let target = {};
    Object.assign(target, _this.getCommonObject(obj))
    target.success = (res) => {
      let result = {
        "NOTREACHABLE": "none",
        "WIFI": "wifi",
        "2G": '2g',
        "3G": '3g',
        "4G": '4g',
        "WWAN": 'wifi',
        "UNKNOWN": 'unknown',

      }
      res.networkType = result[res.networkType];
      obj.method = 'success'
      res.resultStr = res.code;
      obj.parameters = res;
      _this.webViewContext.postMessage(obj);
    }
    dd.getNetworkType(target)
  },

  /**
   * 开始录音接口
   */
  startRecord() {
    let rm = dd.getRecorderManager()
    rm.start({ duration: 60 })
  },

  /**
   * 结束录音接口
   */
  stopRecord(obj) {
    let _this = this;
    let rm = dd.getRecorderManager();
    rm.onstop = (res) => {
      //todo 生成唯一的UUID
      let localId = uuid(22);
      app.global.voiceLocalIds[localId] = res.tempFilePath;
      let resource = {
        localId: localId
      }
      obj.method = 'success'
      obj.parameters = resource;
      _this.webViewContext.postMessage(obj);
    }
    rm.stop();
  },

  /**
   * 监听录音自动停止接口
   * @param {*} obj 
   */
  onVoiceRecordEnd(obj) {
    let _this = this;
    let rm = dd.getRecorderManager()
    rm.onstop = (res) => {
      //todo 生成唯一的UUID
      let localId = uuid(22);
      app.global.voiceLocalIds[localId] = res.tempFilePath;
      let resource = {
        localId: localId
      }
      obj.method = 'success'
      obj.parameters = resource;
      _this.webViewContext.postMessage(obj);

    }
  },

  /**
   * 播放语音接口
   * @param {*} obj 
   */
  playVoice(obj) {
    let filePath = app.global.voiceLocalIds[obj.localId];
    let currentTime = app.global.voiceCurrentTimes[obj.localId] || 0;
    let manager = dd.getBackgroundAudioManager();
    manager.title = "录音";
    manager.src = filePath;
    manager.seek(currentTime);
    manager.onPlay = (event) => { };
    manager.onPause = (event) => { };
    manager.onTimeUpdate = (event) => {
      // {"type":"onTimeUpdate","NBPageUrl":"https://2019042664358099.eco.dingtalkapps.com/index.html#pages/api/api","currentTime":1}
      let { currentTime } = event;
      app.global.voiceCurrentTimes[obj.localId] = currentTime;
    };

  },

  /**
   * 暂停播放接口
   * @param {*} obj 
   */
  pauseVoice(obj) {
    let filePath = app.global.voiceLocalIds[obj.localId];
    let manager = dd.getBackgroundAudioManager();
    if (!manager.paused) {
      manager.pause();
    }

  },

  /**
   * 结束播放接口
   */
  stopVoice() {
    let filePath = app.global.voiceLocalIds[obj.localId];
    voiceCurrentTimes[obj.localId] = 0;
    let manager = dd.getBackgroundAudioManager();
    manager.stop();
  },

  /**
   * 监听语音播放完毕接口
   * @param {*} obj 
   */
  onVoicePlayEnd(obj) {
    let manager = dd.getBackgroundAudioManager();
    let src = manager.src;
    let filePath = src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('=') + 1);
    manager.onEnded = (event) => {
      // {"type":"onEnded","NBPageUrl":"https://2019042664358099.eco.dingtalkapps.com/index.html#pages/api/api"}
      for (const key in app.global.voiceLocalIds) {
        if (app.global.voiceLocalIds.hasOwnProperty(key)) {
          let element = app.global.voiceLocalIds[key];
          console.log(element);
          if (element.includes(filePath)) {
            let res = {
              localId: key
            };
            obj.method = 'success'
            obj.parameters = res;
            _this.webViewContext.postMessage(obj);
            break;
          }
        }
      }
    };
  },

  /**
   * 上传语音接口
   * @param {*} obj 
   */
  uploadVoice(obj) {
    //todo 需要在开发者后台将上传URL设置为HTTP安全域名
    this.uploadFile(obj)
  },

  /**
   * 下载语音接口
   * @param {*} obj 
   */
  downloadVoice(obj) {
    this.downloadFile(obj);
  },
  /**
   * 
   * @param {*} obj 
   * @returns string
   */
  _getUrl(obj) {
    let { page, parameters } = obj;
    let suffix = "";
    for (let key in parameters) {
      suffix += `${key}=${parameters[key]}&`;
    }
    let url = `${page}?${suffix.substring(0, suffix.length - 1)}`
    return url;
  },
  scanInvoice(obj) {
    let _this = this;
    dd.chooseImage({
      count: 1,
      success: (res) => {
        let src = res.filePaths[0];
        obj.success = (res) => {
          _this._identifyInvoice(res);

        };
        obj.fail = (res) => {
          obj.method = 'fail';
          obj.parameters = res;
          _this.webViewContext.postMessage(obj);
        }
        obj.src = src;
        _this._getImageUrl(obj);
      }
    });

  },

  recognizeInvoice(obj) {
    let _this = this;
    let { appCode, image } = obj;
    let localId = image;
    let filePath = app.global.localIds[localId];
    obj.src = filePath;
    obj.success = (res) => {
      _this._identifyInvoice(res);
    };
    obj.fail = (res) => {
      obj.method = 'fail';
      obj.parameters = res;
      _this.webViewContext.postMessage(obj);
    }
    _this._getImageUrl(obj);
  },

  _getImageUrl(obj) {
    let { src } = obj;
    dd.getImageInfo({
      src: src,
      success: (res) => {
        // {"width":200,"height":200,"path":"temp://1559014415464.jpeg"}
        let path = res.path;
        let fileName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
        dd.uploadFile({
          url: 'https://mdoctor.yonyoucloud.com/mtldebugger/mtl/file/upload',
          fileType: 'image',
          fileName: fileName,
          filePath: path,
          success: (res) => {
            let data = res.data;
            let imageUrl = `https://mdoctor.yonyoucloud.com/${JSON.parse(data).data}`;
            obj.imageUrl = imageUrl;
            obj.success && obj.success(obj);

          },
          fail: (res) => {
            obj.fail && obj.fail(res)
            dd.alert({
              title: 'fail',
              content: `${JSON.stringify(res)}`
            })
          }
        });
      },

    });
  },
  _identifyInvoice(obj) {
    let _this = this;
    let { imageUrl } = obj;
    let url = 'https://ocrapi-invoice.taobao.com/ocrservice/invoice';
    let appCode = obj.appCode || '397a546045454397bfa68c918df3bb18';
    let params = { "url": `${imageUrl}` }
    dd.httpRequest({
      url: url,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `APPCODE ${appCode}`
      },
      method: 'POST',
      data: JSON.stringify(params),
      success: (res) => {
        obj.method = 'success'
        obj.parameters = res;
        _this.webViewContext.postMessage(obj);
      },
      fail: res => {
        obj.method = 'fail'
        obj.parameters = res;
        _this.webViewContext.postMessage(obj);
      }
    });
  },
  scanIDCard(obj) {

  },
  recognizeIDCard(obj) {

  },
  _identifyIDCard(obj) {
    let _this = this;
    let { imgBase64 } = obj;
    let url = 'https://dm-51.data.aliyun.com/rest/160601/ocr/ocr_idcard.json';
    let appCode = obj.appCode || '397a546045454397bfa68c918df3bb18';
    let params = { "image": `${imgBase64}` }
    dd.httpRequest({
      url: url,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `APPCODE ${appCode}`
      },
      method: 'POST',
      data: JSON.stringify(params),
      success: (res) => {
        obj.method = 'success'
        obj.parameters = res;
        _this.webViewContext.postMessage(obj);
      },
      fail: res => {
        obj.method = 'fail'
        obj.parameters = res;
        _this.webViewContext.postMessage(obj);
      }
    });
  },
  scanBankCard(obj) {

  },
  recognizeBankCard(obj) {

  },
  _identifyIDCard(obj) {
    let _this = this;
    let { imgBase64 } = obj;
    let url = 'https://dm-51.data.aliyun.com/rest/160601/ocr/ocr_idcard.json';
    let appCode = obj.appCode || '397a546045454397bfa68c918df3bb18';
    let params = { "image": `${imgBase64}` }
    dd.httpRequest({
      url: url,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `APPCODE ${appCode}`
      },
      method: 'POST',
      data: JSON.stringify(params),
      success: (res) => {
        obj.method = 'success'
        obj.parameters = res;
        _this.webViewContext.postMessage(obj);
      },
      fail: res => {
        obj.method = 'fail'
        obj.parameters = res;
        _this.webViewContext.postMessage(obj);
      }
    });
  },

});
