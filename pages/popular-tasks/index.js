// 热门任务
Page({
  data: {
    unacceptedOrders: [],
    loading: true
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.loadUnacceptedOrders()
  },

  onShow() {
    console.log('页面显示')
    this.loadUnacceptedOrders()
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  // 加载未接取订单
  loadUnacceptedOrders() {
    this.setData({ loading: true })
    
    // 模拟数据加载
    setTimeout(() => {
      const mockOrders = [
        {
          _id: '1',
          title: '帮我买校园超市的咖啡',
          price: 15,
          tagText: '紧急',
          pickupLocation: '校园超市',
          deliveryLocation: '南区宿舍',
          startTimeText: '尽快',
          createdAtText: '10分钟前'
        },
        {
          _id: '2',
          title: '代取菜鸟驿站包裹',
          price: 5,
          tagText: '新任务',
          pickupLocation: '菜鸟驿站',
          deliveryLocation: '北区宿舍',
          startTimeText: '下午3点前',
          createdAtText: '30分钟前'
        },
        {
          _id: '3',
          title: '帮忙打印资料',
          price: 8,
          tagText: '待接单',
          location: '打印店',
          startTimeText: '明天上午',
          createdAtText: '1小时前'
        }
      ]
      
      this.setData({
        unacceptedOrders: mockOrders,
        loading: false
      })
    }, 1000)
  },

  // 导航到订单详情
  navigateToOrderDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order-detail/index?id=${id}` })
  }
})