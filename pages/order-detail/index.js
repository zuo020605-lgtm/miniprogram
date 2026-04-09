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
          this.setData({ loading: false })
          wx.showToast({
            title: '获取订单详情失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('获取订单详情失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '获取订单详情失败',
          icon: 'none'
        })
      }
    })
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
