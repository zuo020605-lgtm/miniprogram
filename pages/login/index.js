// 登录
Page({
  data: {
    phone: '',
    code: '',
    countdown: 0,
    timer: null,
    sendingCode: false
  },

  onLoad(options) {
    console.log('页面加载:', options)
    // 初始化页面
  },

  onShow() {
    console.log('页面显示')
    // 每次显示时执行
  },

  onHide() {
    console.log('页面隐藏')
    this.clearTimer()
  },

  onUnload() {
    console.log('页面卸载')
    this.clearTimer()
  },

  clearTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
      this.setData({ timer: null })
    }
  },

  getVerificationCode() {
    const { phone, countdown, sendingCode } = this.data
    if (countdown > 0 || sendingCode) return
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    this.setData({ sendingCode: true })
    // Mock 发送验证码
    setTimeout(() => {
      console.log('发送验证码成功: Mock 数据')
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
      this.setData({ countdown: 60 })
      this.data.timer = setInterval(() => {
        this.setData({
          countdown: this.data.countdown - 1
        })
        if (this.data.countdown <= 0) {
          this.clearTimer()
        }
      }, 1000)
      this.setData({ sendingCode: false })
    }, 500)
  },

  loginByPhone() {
    const { phone, code } = this.data
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    if (!code || code.length !== 6) {
      wx.showToast({
        title: '请输入正确的验证码',
        icon: 'none'
      })
      return
    }
    // Mock 手机号登录
    console.log('手机号登录成功: Mock 数据')
    wx.setStorageSync('token', 'mock-token')
    wx.setStorageSync('userInfo', {
      nickName: '测试用户',
      avatar: '/static/default-avatar.png',
      phone: phone
    })
    wx.showToast({
      title: '登录成功',
      icon: 'success'
    })
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  loginByWechat() {
    // Mock 微信登录
    console.log('微信登录成功: Mock 数据')
    wx.setStorageSync('token', 'mock-token')
    wx.setStorageSync('userInfo', {
      nickName: '微信用户',
      avatar: '/static/default-avatar.png'
    })
    wx.showToast({
      title: '登录成功',
      icon: 'success'
    })
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
