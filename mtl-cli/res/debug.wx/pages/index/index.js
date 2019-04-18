import { mtl } from '../../mtl/mtl';

Page({
  onReady() {
    mtl.getStartPage({
      success: res => {
        this.setData({
          url: res.pageUrl,
        })
      }
    })
  }
})