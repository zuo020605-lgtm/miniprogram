// 支付
import api from '../../utils/api'

Page({
  data: {
    selectedPayment: 'wechat', // 默认选择微信支付
    orderAmount: 0,
    serviceFee: 0,
    totalAmount: 0,
    orderAmountText: '0.00',
    serviceFeeText: '0.00',
    totalAmountText: '0.00',
    orderAmountCent: 0,
    serviceFeeCent: 0,
    totalAmountCent: 0,
    orderData: null,
    loading: false
  },

  async onLoad(options) {
    console.log('页面加载:', options)
    await this.loadPaymentOrder(options)
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

  async loadPaymentOrder(options = {}) {
    this.setData({ loading: true })

    try {
      let orderData = null
      const orderId = options.orderId ? decodeURIComponent(options.orderId) : ''

      if (orderId) {
        orderData = await api.getOrderDetail(orderId)
      } else if (options.orderData) {
        orderData = JSON.parse(decodeURIComponent(options.orderData))
      }

      if (!orderData || !orderData.id) {
        throw new Error('订单不存在')
      }

      this.setPaymentOrder(orderData)
    } catch (e) {
      console.error('加载支付订单失败:', e)
      wx.showToast({
        title: e.message || '订单数据异常',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  setPaymentOrder(orderData) {
    const orderAmountCent = Number(orderData.price || 0)
    if (!Number.isFinite(orderAmountCent) || orderAmountCent <= 0) {
      throw new Error('订单金额异常')
    }

    const serviceFeeCent = Math.round(orderAmountCent * 0.2)
    const totalAmountCent = orderAmountCent + serviceFeeCent

    this.setData({
      orderData,
      orderAmountCent,
      serviceFeeCent,
      totalAmountCent,
      orderAmount: orderAmountCent / 100,
      serviceFee: serviceFeeCent / 100,
      totalAmount: totalAmountCent / 100,
      orderAmountText: (orderAmountCent / 100).toFixed(2),
      serviceFeeText: (serviceFeeCent / 100).toFixed(2),
      totalAmountText: (totalAmountCent / 100).toFixed(2),
      loading: false
    })
  },

  // 立即支付
  async pay() {
    const { selectedPayment, totalAmount, orderAmount, serviceFee, orderData, totalAmountCent } = this.data
    if (!orderData || !orderData.id || !totalAmountCent) {
      wx.showToast({ title: '订单数据异常', icon: 'none' })
      return
    }

    wx.showLoading({ title: '支付中...' })

    try {
      const app = getApp()
      const openid = app.globalData.userInfo && app.globalData.userInfo.openid
      const paymentResult = await api.mockPay(orderData.id, openid || '', totalAmountCent, selectedPayment)
      wx.hideLoading()

      wx.showModal({
        title: '支付成功',
        content: `已成功支付 ¥${totalAmount.toFixed(2)}`,
        showCancel: false,
        success: () => {
          // 跳转到支付成功页面，传递金额数据
          wx.redirectTo({
            url: `/pages/pay-success/index?totalAmount=${totalAmount}&orderAmount=${orderAmount}&serviceFee=${serviceFee}&orderId=${orderData.id}&tradeNo=${paymentResult.out_trade_no || ''}`
          })
        }
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: err.message || '支付失败',
        icon: 'none'
      })
    }
  }
})
