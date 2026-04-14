import api from '../../utils/api.js'

// 订单
Page({
  data: {
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '全部', count: 0 },
      { key: 'waitingPayment', label: '待支付', count: 0 },
      { key: 'pending', label: '待接单', count: 0 },
      { key: 'processing', label: '进行中', count: 0 },
      { key: 'completed', label: '已完成', count: 0 },
      { key: 'cancelled', label: '已取消', count: 0 }
    ],
    orders: [],
    filteredOrders: [],
    loading: false,
    isLoadingData: false, // 防止重复加载的标志
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
    this.syncTabBar()
    this.loadOrders()
  },

  syncTabBar() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabBar && tabBar.data.selected !== 1) {
      tabBar.setData({ selected: 1 })
    }
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
      'PENDING': 'pending',
      'WAITING_PAYMENT': 'pending',
      'PROCESSING': 'processing',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    }
    return colorMap[status] || 'pending'
  },

  // 状态文本映射
  getStatusText(status) {
    const textMap = {
      'PENDING': '待接单',
      'WAITING_PAYMENT': '待支付',
      'PROCESSING': '进行中',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    }
    return textMap[status] || '未知状态'
  },

  // 服务类型文本映射
  getServiceTypeText(serviceType) {
    const textMap = {
      'campus-errand': '校园跑腿',
      'express': '快递代取',
      'exam': '考试代替',
      'campus-class': '校园代课'
    }
    return textMap[serviceType] || '其他服务'
  },

  // 加载订单列表
  async loadOrders() {
    // 防止重复加载，避免无限循环
    if (this.data.isLoadingData) {
      console.log('正在加载中，跳过重复调用')
      return
    }
    
    this.setData({ loading: true, isLoadingData: true })

    try {
      const app = getApp()
      console.log('=== 订单页面调试信息 ===')
      console.log('app.globalData:', app.globalData)
      console.log('hasLogin:', app.globalData.hasLogin)
      console.log('userInfo:', app.globalData.userInfo)

      if (!app.checkAndHandleLogin()) {
        console.log('检查登录失败，返回')
        this.setData({ loading: false, isLoadingData: false })
        return
      }

      const userInfo = app.globalData.userInfo
      console.log('获取的 userInfo:', userInfo)
      console.log('userInfo.openid:', userInfo?.openid)

      if (!userInfo || !userInfo.openid) {
        console.log('用户信息不完整')
        wx.showToast({ title: '用户信息不完整', icon: 'none' })
        this.setData({ loading: false, isLoadingData: false })
        return
      }

      // 调用API获取订单列表
      const result = await api.getOrders(userInfo.openid, '', '')

      if (result && result.list) {
        const orders = result.list
        const formattedOrders = orders.map(order => ({
          ...order,
          _id: order.id,
          status: order.status,
          statusText: this.getStatusText(order.status),
          statusColor: this.getStatusColor(order.status),
          serviceType: order.type,
          serviceTypeText: this.getServiceTypeText(order.type),
          serviceIcon: this.getServiceIcon(order.type),
          price: (Number(order.price || 0) / 100).toFixed(2), // 转换为元并避免被原始分金额覆盖
          createdAt: order.createdAt || order.createTime,
          createdAtText: new Date(order.createTime || order.createdAt || Date.now()).toLocaleString(),
          orderNo: 'ORD' + order.id
        }))

        this.setData({
          orders: formattedOrders,
          filteredOrders: formattedOrders,
          hasMore: result.page < result.totalPages,
          loading: false,
          isLoadingData: false
        })
        this.updateTabCounts(formattedOrders)
        this.filterOrders(this.data.activeTab)
      } else {
        throw new Error(result.message || '获取订单失败')
      }
    } catch (error) {
      console.error('加载订单失败:', error)
      wx.showToast({ title: error.message || '加载失败', icon: 'none' })
      this.setData({ loading: false, isLoadingData: false })
    }
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
    const statusMap = {
      waitingPayment: 'WAITING_PAYMENT',
      pending: 'PENDING',
      processing: 'PROCESSING',
      completed: 'COMPLETED',
      cancelled: 'CANCELLED'
    }
    
    if (activeTab !== 'all') {
      filtered = orders.filter(function(order) {
        return order.status === statusMap[activeTab]
      })
    }
    
    this.setData({ filteredOrders: filtered })
  },

  updateTabCounts(orders) {
    const countMap = {
      all: orders.length,
      waitingPayment: orders.filter(order => order.status === 'WAITING_PAYMENT').length,
      pending: orders.filter(order => order.status === 'PENDING').length,
      processing: orders.filter(order => order.status === 'PROCESSING').length,
      completed: orders.filter(order => order.status === 'COMPLETED').length,
      cancelled: orders.filter(order => order.status === 'CANCELLED').length
    }

    const tabs = this.data.tabs.map(tab => ({
      ...tab,
      count: countMap[tab.key] || 0
    }))

    this.setData({ tabs })
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
  async cancelOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.cancelOrder(id, getApp().globalData.userInfo.openid)

            wx.showToast({ title: '订单已取消', icon: 'success' })
            this.loadOrders()
          } catch (error) {
            wx.showToast({ title: error.message || '取消失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 修改订单
  editOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/publish/index?id=' + id })
  },

  goPay(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/payment/index?orderId=${id}` })
  }
})
