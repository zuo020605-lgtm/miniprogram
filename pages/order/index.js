import api from '../../utils/api.js'

// 订单
Page({
  data: {
    mainTab: 'recent',
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '全部', count: 0 },
      { key: 'waitingPayment', label: '待支付', count: 0 },
      { key: 'pending', label: '待接单', count: 0 },
      { key: 'processing', label: '进行中', count: 0 },
      { key: 'completed', label: '已完成', count: 0 },
      { key: 'cancelled', label: '已取消', count: 0 }
    ],
    recentOrders: [],
    recentLoading: false,
    isRunner: false,
    recentTab: 'pending',
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
    this.syncRunnerState()
    if (this.data.isRunner) {
      this.loadRecentOrders()
    } else {
      this.setData({ recentOrders: [], recentLoading: false })
    }
  },

  onShow() {
    console.log('页面显示')
    this.syncTabBar()
    this.syncRunnerState()
    if (this.data.mainTab === 'recent') {
      if (this.data.isRunner) {
        this.loadRecentOrders()
      } else {
        this.setData({ recentOrders: [], recentLoading: false })
      }
    } else {
      this.loadMyOrders()
    }
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

  // 服务类型图标类名映射
  getServiceIcon(serviceType) {
    const iconMap = {
      'campus-errand': 'icon-run',
      'express': 'icon-package',
      'exam': 'icon-exam',
      'campus-class': 'icon-class'
    }
    return iconMap[serviceType] || 'icon-school'
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

  getCurrentUserInfo() {
    const app = getApp()
    console.log('=== 订单页面调试信息 ===')
    console.log('app.globalData:', app.globalData)
    console.log('hasLogin:', app.globalData.hasLogin)
    console.log('userInfo:', app.globalData.userInfo)

    if (!app.checkAndHandleLogin()) {
      console.log('检查登录失败，返回')
      return null
    }

    const userInfo = app.globalData.userInfo
    if (!userInfo || !userInfo.openid) {
      console.log('用户信息不完整')
      wx.showToast({ title: '用户信息不完整', icon: 'none' })
      return null
    }

    return userInfo
  },

  syncRunnerState() {
    const app = getApp()
    const globalData = app.globalData || {}
    const userInfo = globalData.userInfo || {}
    const isRunner = !!((globalData.isRunner || userInfo.isRunner) && userInfo.runnerVerified)
    this.setData({ isRunner })
    return isRunner
  },

  formatOrder(order) {
    const serviceType = order.type || order.serviceType || 'campus-errand'
    const createTime = order.createTime || order.createdAt || Date.now()
    const pickupText = order.pickupLocation || order.examLocation || order.teachingBuilding || order.location || '校园内'
    const deliveryText = order.deliveryLocation || order.classroom || ''
    const publisherName = order.publisher?.nickName ||
      order.creator?.nickName ||
      order.user?.nickName ||
      order.nickName ||
      (order.openid ? `同学${String(order.openid).slice(-4)}` : '匿名同学')

    return {
      ...order,
      _id: order.id,
      status: order.status,
      statusText: this.getStatusText(order.status),
      statusColor: this.getStatusColor(order.status),
      serviceType,
      serviceTypeText: this.getServiceTypeText(serviceType),
      serviceIcon: this.getServiceIcon(serviceType),
      price: (Number(order.price || 0) / 100).toFixed(2), // 转换为元并避免被原始分金额覆盖
      createdAt: createTime,
      createdAtText: new Date(createTime).toLocaleString(),
      orderNo: 'ORD' + order.id,
      displayTitle: order.title || this.getServiceTypeText(serviceType),
      pickupText,
      deliveryText,
      publisherName
    }
  },

  sortRecentOrders(orders) {
    return orders.sort((a, b) => {
      const statusRankA = a.status === 'PENDING' ? 0 : 1
      const statusRankB = b.status === 'PENDING' ? 0 : 1
      if (statusRankA !== statusRankB) {
        return statusRankA - statusRankB
      }
      const timeA = new Date(a.createTime || a.createdAt || 0).getTime()
      const timeB = new Date(b.createTime || b.createdAt || 0).getTime()
      return timeB - timeA
    })
  },

  // 切换顶部主视图
  switchMainTab(e) {
    const key = e.currentTarget.dataset.key
    if (!key || key === this.data.mainTab) {
      return
    }

    this.setData({ mainTab: key })
    if (key === 'recent') {
      if (this.syncRunnerState()) {
        this.loadRecentOrders()
      } else {
        this.setData({ recentOrders: [], recentLoading: false })
      }
    } else {
      this.loadMyOrders()
    }
  },

  // 加载最近发布列表
  async loadRecentOrders() {
    if (!this.syncRunnerState()) {
      this.setData({ recentOrders: [], recentLoading: false })
      return
    }

    if (this.data.recentLoading) {
      console.log('最近发布正在加载中，跳过重复调用')
      return
    }

    this.setData({ recentLoading: true })

    try {
      const userInfo = this.getCurrentUserInfo()
      if (!userInfo) {
        this.setData({ recentLoading: false })
        return
      }

      const result = await api.getAllOrders()
      const list = result.list || []
      const recentOrders = this.sortRecentOrders(list.filter(order => {
        return order &&
          (order.status === 'PENDING' || order.status === 'PROCESSING') &&
          order.paymentStatus === 'PAID' &&
          order.openid !== userInfo.openid
      })).map(order => this.formatOrder(order))

      this.setData({
        recentOrders,
        recentLoading: false
      })
    } catch (error) {
      console.error('加载最近发布失败:', error)
      wx.showToast({ title: error.message || '加载失败', icon: 'none' })
      this.setData({ recentLoading: false })
    }
  },

  // 加载我的发布订单列表
  async loadMyOrders() {
    // 防止重复加载，避免无限循环
    if (this.data.isLoadingData) {
      console.log('正在加载中，跳过重复调用')
      return
    }

    this.setData({ loading: true, isLoadingData: true })

    try {
      const userInfo = this.getCurrentUserInfo()
      if (!userInfo) {
        this.setData({ loading: false, isLoadingData: false })
        return
      }

      console.log('获取的 userInfo:', userInfo)
      console.log('userInfo.openid:', userInfo?.openid)

      // 调用API获取订单列表
      const result = await api.getOrders(userInfo.openid, '', '', 1, 100)

      if (result && result.list) {
        const formattedOrders = result.list
          .map(order => this.formatOrder(order))
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

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
    if (this.data.mainTab !== 'mine' || this.data.loading || !this.data.hasMore) return

    // 模拟加载更多
    this.setData({ loading: true })
    setTimeout(function() {
      this.setData({ loading: false, hasMore: false })
    }.bind(this), 1000)
  },

  // 下拉刷新
  async onRefresh() {
    this.setData({ isRefreshing: true })
    if (this.data.mainTab === 'recent') {
      if (this.syncRunnerState()) {
        await this.loadRecentOrders()
      }
    } else {
      await this.loadMyOrders()
    }
    this.setData({ isRefreshing: false })
  },

  // 导航到订单详情
  navigateToOrderDetail(e) {
    const id = e.currentTarget.dataset.id
    const status = e.currentTarget.dataset.status
    const serviceType = e.currentTarget.dataset.serviceType
    wx.navigateTo({ url: '/pages/order-detail/index?id=' + id + '&status=' + status + '&serviceType=' + serviceType })
  },

  // 接取最近发布订单
  async acceptOrder(e) {
    const id = e.currentTarget.dataset.id
    const userInfo = this.getCurrentUserInfo()
    if (!id || !userInfo || !this.syncRunnerState()) {
      return
    }

    wx.showModal({
      title: '确认接取该任务？',
      content: '接单后须按时完成，请确保自己有时间。',
      confirmText: '确认接单',
      cancelText: '再看看',
      success: async (res) => {
        if (!res.confirm) {
          return
        }

        const recentOrders = this.data.recentOrders.map(order => {
          if (String(order._id) !== String(id)) {
            return order
          }

          return {
            ...order,
            status: 'PROCESSING',
            statusText: this.getStatusText('PROCESSING'),
            statusColor: this.getStatusColor('PROCESSING')
          }
        })
        this.setData({ recentOrders })

        try {
          await api.acceptOrder(id, userInfo.openid)
          wx.showToast({ title: '接单成功！请前往我的接单查看', icon: 'none' })
          this.loadRecentOrders()
        } catch (error) {
          console.error('接单失败:', error)
          wx.showToast({ title: error.message || '接单失败', icon: 'none' })
          this.loadRecentOrders()
        }
      }
    })
  },

  navigateToRunnerAuth() {
    wx.navigateTo({ url: '/pages/profile/auth/index?type=runner' })
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
            this.loadMyOrders()
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
