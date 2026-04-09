// 我的发布
Page({
  data: {
    currentTab: 'unaccepted',
    tabCounts: {
      unaccepted: 2,
      processing: 1,
      completed: 3
    },
    isLoading: false,
    displayOrders: [],
    emptyTitle: '暂无待接取任务',
    emptyDesc: '您还没有发布任何任务',
    hasMore: true,
    loadingMore: false
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
    this.setData({ isLoading: true })
    
    // 模拟数据加载
    setTimeout(() => {
      const mockOrders = [
        {
          _id: '1',
          title: '取快递',
          price: 5,
          createdAt: new Date().toISOString(),
          createdAtText: '2026-04-08 10:00',
          locationInfo: '菜鸟驿站 -> 南区宿舍',
          status: 'unaccepted'
        },
        {
          _id: '2',
          title: '买奶茶',
          price: 15,
          createdAt: new Date().toISOString(),
          createdAtText: '2026-04-08 09:30',
          locationInfo: '奶茶店 -> 北区宿舍',
          status: 'unaccepted'
        },
        {
          _id: '3',
          title: '打印资料',
          price: 10,
          createdAt: new Date().toISOString(),
          createdAtText: '2026-04-08 09:00',
          locationInfo: '打印店 -> 教学楼',
          status: 'processing'
        },
        {
          _id: '4',
          title: '取外卖',
          price: 8,
          createdAt: new Date().toISOString(),
          createdAtText: '2026-04-07 18:00',
          locationInfo: '校门口 -> 南区宿舍',
          status: 'completed'
        }
      ]
      
      const filteredOrders = mockOrders.filter(order => order.status === this.data.currentTab)
      
      this.setData({
        displayOrders: filteredOrders,
        isLoading: false
      })
    }, 1000)
  },

  // 切换标签
  switchTab(e) {
    const { tab } = e.currentTarget.dataset
    this.setData({ currentTab: tab })
    this.loadOrders()
  },

  // 加载更多
  loadMore() {
    if (this.data.loadingMore || !this.data.hasMore) return
    
    this.setData({ loadingMore: true })
    
    // 模拟加载更多
    setTimeout(() => {
      this.setData({ loadingMore: false, hasMore: false })
    }, 1000)
  },

  // 打开详情
  openDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order-detail/index?id=${id}` })
  },

  // 去发布
  goPublish() {
    wx.navigateTo({ url: '/pages/publish/index' })
  },

  // 取消订单
  handleCancel(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          // 这里可以调用取消订单的API
          wx.showToast({ title: '订单已取消', icon: 'success' })
          this.loadOrders()
        }
      }
    })
  },

  // 再来一单
  handleRepost(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '再来一单',
      content: '确定要发布相同的任务吗？',
      success: (res) => {
        if (res.confirm) {
          // 这里可以调用发布任务的API
          wx.showToast({ title: '任务已发布', icon: 'success' })
          this.setData({ currentTab: 'unaccepted' })
          this.loadOrders()
        }
      }
    })
  }
})
