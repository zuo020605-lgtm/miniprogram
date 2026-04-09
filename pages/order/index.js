// 订单
Page({
  data: {
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '全部', count: 0 },
      { key: 'pending', label: '待接单', count: 0 },
      { key: 'processing', label: '进行中', count: 0 },
      { key: 'completed', label: '已完成', count: 0 },
      { key: 'cancelled', label: '已取消', count: 0 }
    ],
    orders: [],
    filteredOrders: [],
    loading: false,
    hasMore: true,
    isRefreshing: false,
    emptyTitle: '暂无订单'
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

  // 服务类型图标映射
  getServiceIcon(serviceType) {
    const iconMap = {
      'campus-errand': '/static/run-icon.png',
      'express': '/static/package-icon.png',
      'exam': '/static/exam-icon.png',
      'campus-class': '/static/class-icon.png'
    }
    return iconMap[serviceType] || '/static/school-icon.png'
  },

  // 状态颜色映射
  getStatusColor(status) {
    const colorMap = {
      'unaccepted': 'unaccepted',
      'pending': 'pending',
      'processing': 'processing',
      'completed': 'completed',
      'cancelled': 'cancelled'
    }
    return colorMap[status] || 'unaccepted'
  },

  // 加载订单列表
  loadOrders() {
    this.setData({ loading: true })
    
    // 模拟数据加载
    setTimeout(function() {
      const mockOrders = [
        {
          _id: '1',
          status: 'pending',
          statusText: '待接单',
          statusColor: 'pending',
          serviceType: 'campus-errand',
          serviceTypeText: '校园跑腿',
          serviceIcon: this.getServiceIcon('campus-errand'),
          price: 15,
          createdAt: new Date().toISOString(),
          createdAtText: '2026-04-08 10:00',
          pickupLocation: '菜鸟驿站',
          deliveryLocation: '南区宿舍',
          orderNo: 'ORD20260408001'
        },
        {
          _id: '2',
          status: 'processing',
          statusText: '进行中',
          statusColor: 'processing',
          serviceType: 'express',
          serviceTypeText: '快递代取',
          serviceIcon: this.getServiceIcon('express'),
          price: 5,
          createdAt: new Date().toISOString(),
          createdAtText: '2026-04-08 09:30',
          pickupLocation: '顺丰快递点',
          deliveryLocation: '北区宿舍',
          orderNo: 'ORD20260408002',
          courierNickname: '张三'
        },
        {
          _id: '3',
          status: 'completed',
          statusText: '已完成',
          statusColor: 'completed',
          serviceType: 'campus-class',
          serviceTypeText: '校园代课',
          serviceIcon: this.getServiceIcon('campus-class'),
          price: 25,
          createdAt: new Date().toISOString(),
          createdAtText: '2026-04-07 14:00',
          teachingBuilding: '理教',
          examClassroom: '203',
          orderNo: 'ORD20260407003'
        }
      ]
      
      this.setData({
        orders: mockOrders,
        filteredOrders: mockOrders,
        loading: false
      })
    }.bind(this), 1000)
  },

  // 切换标签
  switchTab(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ activeTab: key })
    this.filterOrders(key)
  },

  // 过滤订单
  filterOrders(key) {
    const activeTab = key || this.data.activeTab
    const orders = this.data.orders
    let filtered = orders
    
    if (activeTab !== 'all') {
      filtered = orders.filter(function(order) {
        return order.status === activeTab
      })
    }
    
    this.setData({ filteredOrders: filtered })
  },

  // 加载更多
  loadMore() {
    if (this.data.loading || !this.data.hasMore) return
    
    // 模拟加载更多
    this.setData({ loading: true })
    setTimeout(function() {
      this.setData({ loading: false, hasMore: false })
    }.bind(this), 1000)
  },

  // 下拉刷新
  onRefresh() {
    this.setData({ isRefreshing: true })
    this.loadOrders()
    setTimeout(function() {
      this.setData({ isRefreshing: false })
    }.bind(this), 1000)
  },

  // 导航到订单详情
  navigateToOrderDetail(e) {
    const id = e.currentTarget.dataset.id
    const status = e.currentTarget.dataset.status
    const serviceType = e.currentTarget.dataset.serviceType
    wx.navigateTo({ url: '/pages/order-detail/index?id=' + id + '&status=' + status + '&serviceType=' + serviceType })
  },

  // 导航到发布页面
  navigateToPublish() {
    wx.navigateTo({ url: '/pages/publish/index' })
  },

  // 取消订单
  cancelOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: function(res) {
        if (res.confirm) {
          // 这里可以调用取消订单的API
          wx.showToast({ title: '订单已取消', icon: 'success' })
        }
      }
    })
  },

  // 修改订单
  editOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/publish/index?id=' + id })
  }
})
