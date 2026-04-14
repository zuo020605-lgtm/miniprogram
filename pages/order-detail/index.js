import api from '../../utils/api.js'

// 订单详情
Page({
  data: {
    loading: true,
    order: {
      _id: '',
      status: 'pending',
      statusText: '待接单',
      statusDesc: '等待接单人接单',
      progressPercent: 0,
      currentStep: 0,
      title: '代取快递',
      price: 10,
      createdAt: new Date().toISOString(),
      createdAtText: '2026-04-08 10:00',
      startTime: new Date().toISOString(),
      startTimeText: '2026-04-08 11:00',
      orderNo: 'ORD20260408001',
      serviceType: 'campus-errand',
      pickupLocation: '菜鸟驿站',
      deliveryLocation: '南区宿舍',
      courierNickname: '张三',
      weight: '5kg内',
      reviewed: false
    },
    steps: ['待接单', '进行中', '已完成', '已评价']
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.options = options
    this.loadOrderDetail(options.id)
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

  // 加载订单详情
  async loadOrderDetail(orderId) {
    this.setData({ loading: true })

    try {
      const order = await api.getOrderDetail(orderId)
      this.setData({
        order: this.formatOrder(order),
        loading: false
      })
    } catch (err) {
      console.error('获取订单详情失败:', err)
      this.setMockOrderData()
    }
  },

  formatOrder(order) {
    const normalizedStatus = this.normalizeStatus(order.status)
    const status = normalizedStatus === 'completed' && order.reviewed ? 'reviewed' : normalizedStatus
    const price = Number(order.price || 0) / 100
    const createdAt = order.createTime || order.createdAt || Date.now()

    return {
      ...order,
      _id: order.id,
      status,
      statusText: this.getStatusText(status),
      statusDesc: this.getStatusDesc(status),
      progressPercent: this.getProgressPercent(status),
      currentStep: this.getCurrentStep(status),
      price,
      createdAtText: new Date(createdAt).toLocaleString('zh-CN'),
      startTimeText: order.time || order.startTimeText || '尽快',
      orderNo: 'ORD' + order.id,
      serviceType: order.type || order.serviceType || 'campus-errand',
      pickupLocation: order.pickupLocation || order.location || '校园内',
      deliveryLocation: order.deliveryLocation || order.location || '校园内',
      courierNickname: order.runner && order.runner.nickName ? order.runner.nickName : ''
    }
  },

  normalizeStatus(status) {
    const statusMap = {
      PENDING: 'pending',
      WAITING_PAYMENT: 'waitingPayment',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      REVIEWED: 'reviewed',
      CANCELLED: 'cancelled',
      accepted: 'processing',
      finished: 'completed',
      reviewed: 'reviewed'
    }
    return statusMap[status] || status || 'pending'
  },

  // 设置 Mock 订单数据
  setMockOrderData() {
    const options = this.options || {}
    const mockStatus = this.normalizeStatus(options.status || 'pending')
    const mockOrder = {
      _id: options.id || 'mock-order-id',
      status: mockStatus,
      statusText: this.getStatusText(mockStatus),
      statusDesc: this.getStatusDesc(mockStatus),
      progressPercent: this.getProgressPercent(mockStatus),
      currentStep: this.getCurrentStep(mockStatus),
      title: '订单详情',
      price: 15,
      createdAt: new Date().toISOString(),
      createdAtText: new Date().toLocaleString('zh-CN'),
      startTime: new Date().toISOString(),
      startTimeText: new Date().toLocaleString('zh-CN'),
      orderNo: 'ORD' + new Date().getTime(),
      serviceType: options.serviceType || 'campus-errand',
      pickupLocation: '校园内',
      deliveryLocation: '校园内',
      courierNickname: '接单人',
      weight: '5kg内',
      reviewed: false
    }
    
    this.setData({
      order: mockOrder,
      loading: false
    })
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'unaccepted': '待接单',
      'waitingPayment': '待支付',
      'pending': '待接单',
      'processing': '进行中',
      'completed': '已完成',
      'reviewed': '已评价',
      'cancelled': '已取消'
    }
    return statusMap[status] || '待接单'
  },

  // 获取状态描述
  getStatusDesc(status) {
    const descMap = {
      'unaccepted': '等待接单人接单',
      'waitingPayment': '等待发布人完成支付',
      'pending': '等待接单人接单',
      'processing': '任务进行中',
      'completed': '任务已完成',
      'reviewed': '任务已完成评价',
      'cancelled': '订单已取消'
    }
    return descMap[status] || '等待接单人接单'
  },

  // 获取进度百分比
  getProgressPercent(status) {
    const percentMap = {
      'unaccepted': 0,
      'waitingPayment': 0,
      'pending': 0,
      'processing': 33,
      'completed': 66,
      'reviewed': 100,
      'cancelled': 100
    }
    return percentMap[status] || 0
  },

  // 获取当前步骤
  getCurrentStep(status) {
    const stepMap = {
      'unaccepted': 0,
      'waitingPayment': 0,
      'pending': 0,
      'processing': 1,
      'completed': 2,
      'reviewed': 3,
      'cancelled': 3
    }
    return stepMap[status] || 0
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  },

  // 复制订单编号
  copyOrderNo() {
    wx.setClipboardData({
      data: this.data.order.orderNo || this.data.order._id,
      success: () => {
        wx.showToast({ title: '复制成功', icon: 'success' })
      }
    })
  },

  // 联系接单人
  contactCourier() {
    wx.showModal({
      title: '联系接单人',
      content: '是否通过微信联系接单员？',
      success: (res) => {
        if (res.confirm) {
          // 这里可以实现跳转到微信聊天
          wx.showToast({ title: '正在跳转到微信', icon: 'success' })
        }
      }
    })
  },

  // 取消订单
  async cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const app = getApp()
            await api.cancelOrder(this.data.order._id, app.globalData.userInfo.openid)
            wx.showToast({ title: '订单已取消', icon: 'success' })
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          } catch (error) {
            wx.showToast({ title: error.message || '取消失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 修改订单
  editOrder() {
    const orderId = this.data.order._id
    wx.navigateTo({ url: `/pages/publish/index?id=${orderId}` })
  },

  // 确认完成
  confirmComplete() {
    wx.showModal({
      title: '确认完成',
      content: '确认任务已完成？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const app = getApp()
            await api.finishOrder(this.data.order._id, app.globalData.userInfo.openid)
            wx.showToast({ title: '任务已完成', icon: 'success' })
            this.setData({
              'order.status': 'completed',
              'order.statusText': '已完成',
              'order.statusDesc': '任务已完成',
              'order.progressPercent': 66,
              'order.currentStep': 2
            })
          } catch (error) {
            wx.showToast({ title: error.message || '确认失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 去评价
  goReview() {
    const orderId = this.data.order._id
    wx.navigateTo({ url: `/pages/review/index?orderId=${orderId}&price=${this.data.order.price}` })
  },

  goPay() {
    const orderId = this.data.order._id
    wx.navigateTo({ url: `/pages/payment/index?orderId=${orderId}` })
  }
})
