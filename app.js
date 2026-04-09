// 小程序初始化
const config = require('./config')
App({
  onLaunch(options) {
    console.log('小程序启动', options)
    this.initCloud()
  },
  
  onShow(options) {
    console.log('小程序显示', options)
  },
  
  onHide() {
    console.log('小程序隐藏')
  },
  
  initCloud() {
    if (!wx.cloud) {
      console.warn('云开发未可用，请使用 2.2.3 或以上的基础库')
      return
    }
    
    try {
      // 初始化云开发
      wx.cloud.init({
        env: config.cloud.env,
        traceUser: config.cloud.traceUser
      })
      console.log('云开发初始化成功')
    } catch (err) {
      console.warn('云开发初始化失败:', err)
    }
  },
  
  globalData: {
    userInfo: null,
    hasLogin: false
  }
})
