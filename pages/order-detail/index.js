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
  loadOrderDetail(orderId) {
    this.setData({ loading: true })
    
    wx.cloud.callFunction({
      name: 'getOrderDetail',
      data: {
        orderId: orderId
      },
      success: (res) => {
        console.log('获取订单详情成功:', res)
        if (res.result) {
          this.setData({
            order: res.result,
            loading: false
          })
        } else {
          // 云函数成功但无结果，使用 Mock 数据
          this.setMockOrderData()
        }
      },
      fail: (err) => {
        console.error('获取订单详情失败:', err)
        // 云函数失败，使用 Mock 数据
        this.setMockOrderData()
      }
    })
  },

  // 设置 Mock 订单数据
  setMockOrderData() {
    const options = this.options || {}
    const mockOrder = {
      _id: options.id || 'mock-order-id',
      status: options.status || 'pending',
      statusText: this.getStatusText(options.status || 'pending'),
      statusDesc: this.getStatusDesc(options.status || 'pending'),
      progressPercent: this.getProgressPercent(options.status || 'pending'),
      currentStep: this.getCurrentStep(options.status || 'pending'),
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
      'pending': '待接单',
      'processing': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '待接单'
  },

  // 获取状态描述
  getStatusDesc(status) {
    const descMap = {
      'unaccepted': '等待接单人接单',
      'pending': '等待接单人接单',
      'processing': '任务进行中',
      'completed': '任务已完成',
      'cancelled': '订单已取消'
    }
    return descMap[status] || '等待接单人接单'
  },

  // 获取进度百分比
  getProgressPercent(status) {
    const percentMap = {
      'unaccepted': 0,
      'pending': 0,
      'processing': 50,
      'completed': 100,
      'cancelled': 100
    }
    return percentMap[status] || 0
  },

  // 获取当前步骤
  getCurrentStep(status) {
    const stepMap = {
      'unaccepted': 0,
      'pending': 0,
      'processing': 1,
      'completed': 2,
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
  cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          // 这里可以调用取消订单的API
          wx.showToast({ title: '订单已取消', icon: 'success' })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
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
      success: (res) => {
        if (res.confirm) {
          // 这里可以调用确认完成的API
          wx.showToast({ title: '任务已完成', icon: 'success' })
          setTimeout(() => {
            this.setData({
              'order.status': 'completed',
              'order.statusText': '已完成',
              'order.statusDesc': '任务已完成',
              'order.progressPercent': 100,
              'order.currentStep': 2
            })
          }, 1000)
        }
      }
    })
  },

  // 去评价
  goReview() {
    const orderId = this.data.order._id
    wx.navigateTo({ url: `/pages/review/index?id=${orderId}` })
  }
})
