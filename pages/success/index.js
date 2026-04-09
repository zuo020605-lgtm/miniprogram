// 发布成功
Page({
  data: {
    countdown: '05:00',
    showPayButton: false
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.startCountdown()
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

  // 开始倒计时
  startCountdown() {
    let minutes = 5
    let seconds = 0

    this.countdownTimer = setInterval(() => {
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(this.countdownTimer)
          return
        }
        minutes--
        seconds = 59
      } else {
        seconds--
      }

      const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      this.setData({ countdown: timeStr })

      // 模拟3秒后显示支付按钮（实际应该是有人接单后才显示）
      if (minutes === 4 && seconds === 57) {
        this.setData({ showPayButton: true })
      }
    }, 1000)
  },

  // 导航到支付页面
  navigateToPayment() {
    wx.navigateTo({ url: '/pages/payment/index' })
  }
})