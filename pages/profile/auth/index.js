// 实名认证
Page({
  data: {
    realName: '',
    idCard: '',
    phone: '',
    verificationCode: '',
    countdown: 0,
    countdownText: ''
  },

  onLoad(options) {
    console.log('页面加载:', options)
  },

  onShow() {
    console.log('页面显示')
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
    // 清除倒计时
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  },

  // 真实姓名变更
  onRealNameChange(e) {
    this.setData({ realName: e.detail.value })
  },

  // 身份证号变更
  onIdCardChange(e) {
    this.setData({ idCard: e.detail.value })
  },

  // 手机号变更
  onPhoneChange(e) {
    this.setData({ phone: e.detail.value })
  },

  // 验证码变更
  onVerificationCodeChange(e) {
    this.setData({ verificationCode: e.detail.value })
  },

  // 获取验证码
  getVerificationCode() {
    const { phone, countdown } = this.data
    
    if (countdown > 0) return
    
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    
    // 模拟发送验证码
    wx.showToast({ title: '验证码已发送', icon: 'success' })
    
    // 开始倒计时
    let count = 60
    this.setData({ 
      countdown: count,
      countdownText: count + 's后重新获取'
    })
    
    this.countdownTimer = setInterval(() => {
      count--
      if (count <= 0) {
        clearInterval(this.countdownTimer)
        this.setData({ 
          countdown: 0,
          countdownText: ''
        })
      } else {
        this.setData({ 
          countdown: count,
          countdownText: count + 's后重新获取'
        })
      }
    }, 1000)
  },

  // 提交认证
  submitAuth() {
    const { realName, idCard, phone, verificationCode } = this.data
    
    if (!realName) {
      wx.showToast({ title: '请输入真实姓名', icon: 'none' })
      return
    }
    
    if (!idCard || idCard.length !== 18) {
      wx.showToast({ title: '请输入正确的身份证号', icon: 'none' })
      return
    }
    
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    
    if (!verificationCode || verificationCode.length !== 6) {
      wx.showToast({ title: '请输入正确的验证码', icon: 'none' })
      return
    }
    
    wx.showLoading({ title: '提交中...' })
    
    // 模拟提交
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '认证成功', icon: 'success' })
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 2000)
  }
})