// 我的接单
Page({
  data: {
    activeTab: 'pending',
    filteredOrders: [],
    loading: true
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.loadOrders()
  },

  onShow() {
    console.log('页面显示')
    this.loadOrders()
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  // 加载订单
  loadOrders() {
    this.setData({ loading: true })

    // 模拟数据加载
    setTimeout(() => {
      const mockOrders = [
        {
          _id: '1',
          title: '帮我买校园超市的咖啡',
          price: '15.00',
          status: 'pending',
          statusText: '待处理',
          createdAtText: '10分钟前'
        },
        {
          _id: '2',
          title: '代取菜鸟驿站包裹',
          price: '5.00',
          status: 'processing',
          statusText: '进行中',
          createdAtText: '30分钟前'
        },
        {
          _id: '3',
          title: '帮忙打印资料',
          price: '8.00',
          status: 'completed',
          statusText: '已完成',
          createdAtText: '1小时前'
        }
      ]

      const filtered = mockOrders.filter(order => order.status === this.data.activeTab)

      this.setData({
        filteredOrders: filtered,
        loading: false
      })
    }, 1000)
  },

  // 切换标签
  switchTab(e) {
    const { tab } = e.currentTarget.dataset
    this.setData({ activeTab: tab })
    this.loadOrders()
  },

  // 查看详情
  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order-detail/index?id=${id}` })
  },

  // 开始任务
  startOrder(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '开始任务',
      content: '确定要开始这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '任务已开始', icon: 'success' })
          this.loadOrders()
        }
      }
    })
  },

  // 完成任务
  completeOrder(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '完成任务',
      content: '确定要完成这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '任务已完成', icon: 'success' })
          this.loadOrders()
        }
      }
    })
  },

  // 导航到首页
  navigateToHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})