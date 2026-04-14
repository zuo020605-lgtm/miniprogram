// 支付成功
import api from '../../utils/api'

Page({
  data: {
    totalAmount: 0,
    orderAmount: 0,
    serviceFee: 0,
    totalAmountText: '0.00',
    orderAmountText: '0.00',
    serviceFeeText: '0.00',
    orderId: '',
    tradeNo: '',
    paymentTime: '',
    paymentVerified: false,
    verificationText: '订单支付状态验证中'
  },

  async onLoad(options) {
    console.log('页面加载:', options)
    // 接收传递的金额数据
    if (options) {
      const totalAmount = parseFloat(options.totalAmount) || 0
      const orderAmount = parseFloat(options.orderAmount) || 0
      const serviceFee = parseFloat(options.serviceFee) || 0

      this.setData({
        totalAmount,
        orderAmount,
        serviceFee,
        totalAmountText: totalAmount.toFixed(2),
        orderAmountText: orderAmount.toFixed(2),
        serviceFeeText: serviceFee.toFixed(2),
        orderId: options.orderId || '',
        tradeNo: options.tradeNo || '',
        paymentTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
      })
    }

    await this.verifyPaidOrder()
  },

  onShow() {
    console.log('页面显示')
    // 每次显示时执行
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  navigateToOrderDetail() {
    wx.navigateTo({
      url: `/pages/order-detail/index?id=${this.data.orderId}`
    })
  },

  async verifyPaidOrder() {
    if (!this.data.orderId) {
      this.setData({
        paymentVerified: false,
        verificationText: '缺少订单编号，无法验证支付状态'
      })
      return
    }

    try {
      const order = await api.getOrderDetail(this.data.orderId)
      const paymentVerified = order.paymentStatus === 'PAID' || order.paid === true
      this.setData({
        paymentVerified,
        verificationText: paymentVerified ? '订单已完成支付验证' : '订单支付状态未确认'
      })
    } catch (error) {
      console.error('验证支付订单失败:', error)
      this.setData({
        paymentVerified: false,
        verificationText: '订单支付状态验证失败'
      })
    }
  },

  navigateToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
