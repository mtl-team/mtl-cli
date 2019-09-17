import uuid from '../../utils/uuid.js'
let app = getApp();

Component({
  data: {
  },
  props: {
    url: "",
    //获取传递的数据类
    onPostMessage: () => { }
  },
  didMount() {
    this.webViewContext = dd.createWebViewContext('mtl-api-webview');
  },
  didUpdate() {
    if (!!!this.data.pages) {
      let baseUrl = this.props.onPostMessage().baseUrl;
      console.log('receiveMessage', this.props.onPostMessage());
      dd.httpRequest({
        url: `${baseUrl}/pages.json`,
        success: (res) => {
          if (res.status == 200) {
            res.data.platforms.forEach((element) => {
              if ("dd" == element.platform) {
                this.setData({
                  pages: element.pages
                });
              }
            })
          }
        }
      });
    }

  },
  didUnmount() { },
  methods: {
    onAlert({ action }) {
      if (app.global.debug) {
        dd.alert({
          title: 'action',
          content: action
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
  
     */

    sendSuccessResult({ action, uuid, data }) {
      this.webViewContext.postMessage({
        action: action,
        uuid: uuid,
        code: 200,
        data: data
      });
    },

    sendFailResult(data) {
      this.webViewContext.postMessage(data);
    },
    getFailFunction({ action, uuid }) {
      return res => {
        this.sendFailResult({
          action: action,
          uuid: uuid,
          message: JSON.stringify(res),
          code: -1,
        });
      };
    },

    scanQRCode(obj) {
      let { scanType } = obj.obj;
      let scanObject = { type: scanType };
      scanObject.success = (res) => {
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              resultStr: res.code
            }
          }
        });
      }
      scanObject.fail = this.getFailFunction(obj);
      dd.scan(scanObject);
    },
    /**
     * 保留当前页面，跳转到应用内的某个指定页面，可以使用 dd.navigateBack 返回到原来页面。
     * @param {{ page: 'index',parameters: {key: 'value'}}} obj 
     */
    navigateTo(obj) {
      let target = { url: this._getUrl(obj) }
      dd.navigateTo(target)
    },

    /**
     * 关闭当前页面，跳转到应用内的某个指定页面。
     * @param {*} obj 
     */
    redirectTo(obj) {
      let target = { url: this._getUrl(obj) }
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
      let target = {
        count: obj.obj.count || 9,
        sourceType: obj.obj.sourceType || ['album', 'camera']
      }
      target.success = (res) => {
        let resource = {};
        resource.localIds = res.filePaths.map(value => {
          //todo 生成唯一的UUID
          let localId = uuid(22);
          app.global.localIds[localId] = value;
          value = localId;
          return value;
        });

        this.sendSuccessResult({
          ...obj, ...{
            data: {
              localIds: resource.localIds
            }
          }
        });

      };
      target.fail == this.getFailFunction(obj);
      dd.chooseImage(target);
    },

    /**
     * 预览图片接口
     * @param {*} obj 
     */
    previewImage({ obj }) {
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
      // let localId = obj.localId;
      let src = app.global.localIds[obj.obj.localId];
      dd.getImageInfo({
        src: src,
        success: (res) => {
          // {"width":200,"height":200,"path":"temp://1559014415464.jpeg"}
          let path = res.path;
          obj.fileName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
          obj.filePath = path;
          this.uploadFile(obj)
        },
        fail: this.getFailFunction(obj),
      });

    },

    /**
     * 上传文件
     * @param {*} obj 
     */
    uploadFile(obj) {
      let url = this.props.onPostMessage().serviceUrl.uploadUrl;
      if (!!!url) {
        let resource = {
          code: -1,
          message: '上传服务器地址没有配置，请在project.json配置',
          action: obj.action,
          uuid: obj.uuid,
        }
        this.sendFailResult(resource);
        return ;
      }
      let { fileType, fileName, filePath } = obj;

      let target = {
        url: url,
        fileType: fileType,
        fileName: fileName,
        filePath: filePath
      }
      target.success = (res) => {
        let serverId = JSON.parse(res.data).data;
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              serverId: serverId
            }
          }
        });
      };
      target.fail == this.getFailFunction(obj);
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
      let serverId = obj.obj.serverId;
      let url = this.props.onPostMessage().serviceUrl.downloadUrl;
      if (!!!url) {
        let resource = {
          code: -1,
          message: '下载服务器地址没有配置，请在project.json配置',
          action: obj.action,
          uuid: obj.uuid,
        }
        this.sendFailResult(resource);
        return ;
      }
       url = `${url}?serviceId=${serverId}`;

      //todo 通过serverId请求服务器获取图片链接
      let target = {
        url: url
      }
      target.success = ({ filePath }) => {
        let localId = uuid(22);
        app.global.localIds[localId] = filePath;
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              localId: localId
            }
          }
        });
      }
      target.fail = this.getFailFunction(obj);
      dd.downloadFile(target);
    },

    /**
     * 获取本地图片 imgSrc 接口
     * @param {*} obj 
     */
    getLocalImgSrc(obj) {
      let src = app.global.localIds[obj.obj.localId];
      if (src) {
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              imgSrc: src
            }
          }
        });
      } else {
        let resource = {
          code: -1,
          message: '图片没有找到',
          action: obj.action,
          uuid: obj.uuid,
        }
        this.sendFailResult(resource);
      }

    },
    /**
     * 获取本地图片 base64 接口
     * 未完成
     * @param {*} obj 
     */
    getLocalImgData(obj) {
      let src = app.global.localIds[obj.obj.localId];
      if (src) {
        dd.getImageInfo({
          src: src,
          success: (res) => {
            // {"width":200,"height":200,"path":"temp://1559014415464.image"}
            let path = res.path;
            let fileName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
            // 钉钉的图片后缀名为image，base64编码加上image不识别，默认采用png格式
            let imgType = 'png';
            let prefix = `data:image/${imgType};base64,`
            let target = {
              url: 'https://mdoctor.yonyoucloud.com/mtldebugger/mtl/file/convertBase64',
              fileType: 'image',
              fileName: fileName,
              filePath: path,
            };
            target.success = (res) => {
              let result = JSON.parse(res.data);
              let base64ImgCode = result.data;
              let src = (base64ImgCode.startsWith('data:') ? "" : prefix) + base64ImgCode;

              this.sendSuccessResult({
                ...obj, ...{
                  data: {
                    localData: src
                  }
                }
              });
            };
            target.fail = this.getFailFunction(obj);
            dd.uploadFile(target);
          },
          fail: this.getFailFunction(obj),
        });
      } else {
        let resource = {
          action: obj.action,
          uuid: obj.uuid,
          code: -1,
          message: '图片没有找到'
        }
        this.sendFailResult(resource)
      }


    },

    /**
     * 获取地理位置接口
     * @param {*} obj 
     */
    getLocation(obj) {
      let target = {};
      target.success = res => {
        let data = {
          action: obj.action,
          uuid: obj.uuid,
          code: 200,
          data: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        };
        this.sendSuccessResult(data);
      };
      target.fail = this.getFailFunction(obj);
      dd.getLocation(target);
    },

    /**
     * 使用内置地图查看位置接口
     * @param {*} obj 
     */
    openLocation(obj) {
      let { latitude = 0, longitude = 0, name = '', address = '', scale = 1, infoUrl = '' } = obj.obj;
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
      let target = {};
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
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              networkType: res.networkType
            }
          }
        });
      };
      target.fail = this.getFailFunction(obj);
      dd.getNetworkType(target)
    },

    /**
     * 开始录音接口
     */
    startRecord(obj) {
      let rm = dd.getRecorderManager();
      rm.start({ duration: 60 })
    },

    /**
     * 结束录音接口
     */
    stopRecord(obj) {
      let rm = dd.getRecorderManager();
      rm.onstop = (res) => {
        //todo 生成唯一的UUID
        let localId = uuid(22);
        app.global.voiceLocalIds[localId] = res.tempFilePath;
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              localId: localId
            }
          }
        });
      }
      rm.stop();
    },

    /**
     * 监听录音自动停止接口
     * @param {*} obj 
     */
    onVoiceRecordEnd(obj) {
      let rm = dd.getRecorderManager()
      rm.onstop = (res) => {
        //todo 生成唯一的UUID
        let localId = uuid(22);
        app.global.voiceLocalIds[localId] = res.tempFilePath;
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              localId: localId
            }
          }
        });
      }
    },

    /**
     * 播放语音接口
     * @param {*} obj 
     */
    playVoice(obj) {
      let filePath = app.global.voiceLocalIds[obj.obj.localId];
      let currentTime = app.global.voiceCurrentTimes[obj.obj.localId] || 0;
      let manager = dd.getBackgroundAudioManager();
      console.log('play-currentTime', currentTime);
      manager.onPlay = (event) => {
        console.log('onPlay', JSON.stringify(event));
      };
      manager.onPause = (event) => {
        console.log('onPause', JSON.stringify(event));
        console.log('dd.currentTime', dd.currentTime);
      };
      manager.onTimeUpdate = (event) => {
        console.log('onTimeUpdate', JSON.stringify(event));
        // {"type":"onTimeUpdate","NBPageUrl":"https://2019042664358099.eco.dingtalkapps.com/index.html#pages/api/api","currentTime":1}
        let { currentTime } = event;
        app.global.voiceCurrentTimes[obj.obj.localId] = currentTime;
      };
      manager.title = "录音";
      manager.src = filePath;
      manager.seek(currentTime);
      manager.play();
      console.log('dd.duration', dd.duration);
    },

    /**
     * 暂停播放接口
     * @param {*} obj 
     */
    pauseVoice(obj) {
      let filePath = app.global.voiceLocalIds[obj.obj.localId];
      let manager = dd.getBackgroundAudioManager();
      if (!manager.paused) {
        app.global.voiceCurrentTimes[obj.localId] = manager.currentTime;
        manager.pause();
      }
    },

    /**
     * 结束播放接口
     */
    stopVoice(obj) {
      let filePath = app.global.voiceLocalIds[obj.obj.localId];
      app.global.voiceCurrentTimes[obj.obj.localId] = 0;
      let manager = dd.getBackgroundAudioManager();
      manager.stop();
      app.global.voiceCurrentTimes[obj.obj.localId] = 0;
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
              this.sendSuccessResult({
                ...obj, ...{
                  data: {
                    localId: key
                  }
                }
              });
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
      let path = app.global.localIds[obj.obj.localId];
      obj.filePath = path;
      obj.fileName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
      obj.fileType = 'audio';
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
     * todo
     * @param {*} obj 
     * @returns string
     */
    _getUrl(obj) {
      //page统一梳理
      let suffix = "";
      let { page, parameters } = obj.obj;
      let pages = this.data.pages;
      if (pages && pages.hasOwnProperty(page)) {
        page = pages[page].url;
        for (let key in parameters) {
          suffix += `${key}=${parameters[key]}&`;
        }
        let url = `${page}?${suffix.substring(0, suffix.length - 1)}`
        return url;
      } else {
        let resource = {
          code: -1,
          message: '页面路径没有找到，请配置pages.json',
          action: obj.action,
          uuid: obj.uuid,
        }
        this.sendFailResult(resource);
      }

    },
    scanInvoice(obj) {
      dd.chooseImage({
        count: 1,
        success: (res) => {
          let src = res.filePaths[0];
          obj.success = (res) => {
            this._identifyInvoice(res);
          };
          obj.src = src;
          this._getImageUrl(obj);
        },
        fail: this.getFailFunction(obj)
      });

    },

    recognizeInvoice(obj) {
      let src = app.global.localIds[obj.obj.image];
      if (src.startsWith('data:')) {
        obj.imgBase64 = src;
        this._identifyInvoice(obj)
      } else {
        let { appCode, image } = obj.obj;
        let localId = image;
        let filePath = app.global.localIds[localId];
        obj.src = filePath;
        obj.success = (res) => {
          this._identifyInvoice(res);
        };
        obj.fail = this.getFailFunction(obj);
        this._getImageUrl(obj);
      }
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
            fail: this.getFailFunction(obj)
          });
        },
        fail: this.getFailFunction(obj)

      });
    },
    _identifyInvoice(obj) {
      let { imageUrl, imgBase64 } = obj;
      let url = 'https://ocrapi-invoice.taobao.com/ocrservice/invoice';
      let appCode = obj.obj.appCode;
      if (!!!appCode) {
        let data = {
          action: obj.action,
          uuid: obj.uuid,
          message: 'appCode 不能为空',
          code: -1
        }
        this.sendFailResult(data);
        return;
      }

      let params = !!imageUrl ? { "url": `${imageUrl}` } : { "img": imgBase64 }
      let target = {
        url: url,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Authorization: `APPCODE ${appCode}`
        },
        method: 'POST',
        data: JSON.stringify(params),
      }
      target.success = (res) => {
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              data: res.data.data
            }
          }
        });
      };
      target.fail = this.getFailFunction(obj);
      dd.httpRequest(target);
    },

    scanIDCard(obj) {
      dd.chooseImage({
        count: 1,
        success: (res) => {
          let value = res.filePaths[0];
          //todo 生成唯一的UUID
          let localId = uuid(22);
          app.global.localIds[localId] = value;
          obj.obj.image = localId;
          this.recognizeIDCard(obj);
        },
        fail: this.getFailFunction(obj)
      });
    },
    recognizeIDCard(obj) {
      let image = obj.obj.image;
      if (image.startsWith('data:')) {
        obj.imgBase64 = image;
        this._identifyIDCard(obj)
      } else {
        obj.success = (res) => {
          this._identifyIDCard(res);
        }
        obj.fail = this.getFailFunction(obj)
        obj.src = app.global.localIds[image];
        this._getImageUrl(obj);
      }


    },
    _identifyIDCard(obj) {
      let { imgBase64, imageUrl } = obj;
      let { appCode, side } = obj.obj;
      let url = 'https://dm-51.data.aliyun.com/rest/160601/ocr/ocr_idcard.json';
      // let appCode = appCode || '397a546045454397bfa68c918df3bb18';
      if (!!!appCode) {
        let resource = {
          action: obj.action,
          uuid: obj.uuid,
          code: -1,
          message: 'appCode is null '
        }
        this.sendFailResult(resource)
        return;
      }
      let params = {
        "image": `${imgBase64 ? imgBase64 : imageUrl}`,
        "configure": {
          side: side
        }
      }
      let target = {
        url: url,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Authorization: `APPCODE ${appCode}`
        },
        method: 'POST',
        data: JSON.stringify(params),
      };
      target.success = (res) => {
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              data: res.data
            }
          }
        });
      };
      target.fail = this.getFailFunction(obj);
      dd.httpRequest(target);
    },
    scanBankCard(obj) {
      dd.chooseImage({
        count: 1,
        success: (res) => {
          let value = res.filePaths[0];
          //todo 生成唯一的UUID
          let localId = uuid(22);
          app.global.localIds[localId] = value;
          obj.obj.image = localId;
          this.recognizeBankCard(obj);
        },
        fail: this.getFailFunction(obj)
      });
    },
    recognizeBankCard(obj) {
      let src = app.global.localIds[obj.obj.image];
      if (src.startsWith('data:')) {
        obj.imgBase64 = src;
        this._identifyBankCard(obj);
      } else {
        obj.success = (res) => {
          this._identifyBankCard(res);
        };
        obj.fail = this.getFailFunction(obj);
        obj.src = src;
        this._getImageUrl(obj);
      }


    },
    _identifyBankCard(obj) {
      let { imgBase64, imageUrl } = obj;
      let url = 'https://yhk.market.alicloudapi.com/rest/160601/ocr/ocr_bank_card.json'
      let appCode = obj.obj.appCode;
      if (!!!appCode) {
        let data = {
          action: obj.action,
          uuid: obj.uuid,
          message: 'appCode 不能为空',
          code: -1
        }
        this.sendFailResult(data);
        return;
      }
      let params = { "image": `${imgBase64 ? imgBase64 : imageUrl}` }
      let target = {
        url: url,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Authorization: `APPCODE ${appCode}`
        },
        method: 'POST',
        data: JSON.stringify(params),
      };
      target.success = (res) => {
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              data: res.data
            }
          }
        });
      };
      target.fail = this.getFailFunction(obj);
      dd.httpRequest(target);
    },

    _getImageBase64(obj) {
      let src = app.global.localIds[obj.obj.image];
      dd.getImageInfo({
        src: src,
        success: (res) => {
          // {"width":200,"height":200,"path":"temp://1559014415464.image"}
          let path = res.path;
          let fileName = path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
          // 钉钉的图片后缀名为image，base64编码加上image不识别，默认采用png格式
          let imgType = 'jpg';
          let prefix = `data:image/${imgType};base64,`
          dd.uploadFile({
            url: 'https://mdoctor.yonyoucloud.com/mtldebugger/mtl/file/convertBase64',
            fileType: 'image',
            fileName: fileName,
            filePath: path,
            success: (res) => {
              let data = JSON.parse(res.data);
              let base64ImgCode = data.data;
              obj.imgBase64 = (base64ImgCode.startsWith('data:') ? "" : prefix) + base64ImgCode;
              obj.success && obj.success(obj)
            },
            fail: this.getFailFunction(obj)
          });
        },
        fail: this.getFailFunction(obj),
      });
    },
    setStorage(obj) {
      let { domain = 'domain.default', key, data } = obj.obj;
      if (typeof key != 'string') {
        this.sendFailResult({
          action: obj.action,
          uuid: obj.uuid,
          message: '"key" should be a string',
          code: -1
        })
        return;
      }
      dd.getStorage({
        key: domain,
        success: function (res) {
          let structs = res.data || {};
          structs[key] = data;
          dd.setStorageSync({
            key: domain,
            data: structs
          });
        },
        fail: this.getFailFunction(obj)
      });

    },
    getStorage(obj) {
      let { domain = 'domain.default', key } = obj.obj;
      dd.getStorage({
        key: domain,
        success: res => {
          let result = res.data || {}
          if (result.hasOwnProperty(key)) {
            this.sendSuccessResult({
              ...obj, ...{
                data: {
                  data: result[key]
                }
              }
            });
          } else {
            let resource = {
              action: obj.action,
              uuid: obj.uuid,
              code: -1,
              message: `not found data for key ${key}`,
            }
            this.sendFailResult(resource);
          }
        },
        fail: this.getFailFunction(obj)
      });
    },
    removeStorage(obj) {
      let { domain = 'domain.default', key } = obj.obj;
      dd.getStorage({
        key: domain,
        success: res => {
          let structs = res.data || {};
          delete structs[key];
          dd.setStorageSync({
            key: domain,
            data: structs
          });
        },

      });

    },
    clearStorage(obj) {
      let { domain = 'domain.default' } = obj.obj;
      dd.removeStorage({
        key: domain,
        success: res => { },
        fail: this.getFailFunction(obj)
      });
    },
    getAuthCode(obj) {
      let target = {};
      target.success = (res) => {
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              authCode: res.authCode
            }
          }
        });
      }
      target.fail = this.getFailFunction(obj);
      dd.getAuthCode(target);
    },
    showAlert(obj) {
      dd.alert({
        content: obj.obj.msg
      });
    },
    getAppCode(obj) {
      let appCode = this.props.onPostMessage().appCode;
      if (appCode) {
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              appCode: appCode || "dingnlb2wikil7pldytf"
            }
          }
        });
      } else {
        this.sendFailResult({
          action: obj.action,
          uuid: obj.uuid,
          message: "appCode 未配置",
          code: -1
        })
      }

    },
    addPushListener(obj) {
      try {
        let query = this.props.onPostMessage().query;
        query = JSON.parse(query.substring(0, query.length - 1));
        let pushMsg = {};
        let { type } = query;
        if (type) {
          pushMsg = query;
        }
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              msg: pushMsg
            }
          }
        });
      } catch (error) {
        this.sendSuccessResult({
          ...obj, ...{
            data: {
              msg: {}
            }
          }
        });
      }

    },
  },
});
