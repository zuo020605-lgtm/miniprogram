// 登录
import api from '../../utils/api'

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

  async loginByPhone() {
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
    try {
      wx.showLoading({ title: '登录中...' })
      const loginResult = await api.login('phone_mock_code_' + Date.now())
      const userInfo = await api.getUserInfo(loginResult.openid)
      userInfo.phone = phone
      getApp().setLoginState(userInfo)
      wx.hideLoading()
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      wx.switchTab({
        url: '/pages/index/index'
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      })
    }
  },

  async loginByWechat() {
    try {
      wx.showLoading({ title: '登录中...' })
      const loginResult = await api.login('wechat_mock_code_' + Date.now())
      const userInfo = await api.getUserInfo(loginResult.openid)
      getApp().setLoginState(userInfo)
      wx.hideLoading()
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      wx.switchTab({
        url: '/pages/index/index'
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      })
    }
  }
})
