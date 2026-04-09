// 支付
Page({
  data: {
    selectedPayment: 'wechat', // 默认选择微信支付
    orderAmount: 25.00,
    serviceFee: 2.00,
    totalAmount: 27.00
  },

  onLoad(options) {
    console.log('页面加载:', options)
    // 可以从options中获取订单信息
    if (options.amount) {
      this.setData({
        orderAmount: parseFloat(options.amount),
        totalAmount: parseFloat(options.amount) + this.data.serviceFee
      })
    }
  },

  onShow() {
    console.log('页面显示')
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  // 选择支付方式
  selectPayment(e) {
    const { method } = e.currentTarget.dataset
    this.setData({ selectedPayment: method })
  },

  // 立即支付
  pay() {
    const { selectedPayment, totalAmount } = this.data
    
    wx.showLoading({ title: '支付中...' })
    
    // 模拟支付过程
    setTimeout(() => {
      wx.hideLoading()
      
      wx.showModal({
        title: '支付成功',
        content: `已成功支付 ¥${totalAmount}`,
        showCancel: false,
        success: () => {
          // 跳转到支付成功页面
          wx.navigateTo({ url: '/pages/pay-success/index' })
        }
      })
    }, 1500)
  }
})
