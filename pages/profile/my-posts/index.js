// 我的发布
import api from '../../../utils/api'

Page({
  data: {
    currentTab: 'unaccepted',
    tabCounts: {
      unaccepted: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    },
    isLoading: false,
    isLoadingData: false, // 防止重复加载的标志
    displayOrders: [],
    emptyTitle: '暂无待接取任务',
    emptyDesc: '您还没有发布任何任务',
    hasMore: true,
    loadingMore: false,
    swipeStartX: 0,
    swipeStartY: 0,
    // 分类专属显示文本映射
    tabEmptyTexts: {
      unaccepted: {
        title: '暂无待接取任务',
        desc: '您还没有发布任何任务'
      },
      processing: {
        title: '暂无进行中任务',
        desc: '您的任务正在被处理中'
      },
      completed: {
        title: '暂无已完成任务',
        desc: '您还没有已完成的任务'
      },
      cancelled: {
        title: '暂无已取消任务',
        desc: '您还没有取消的任务'
      }
    }
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

  getCurrentOpenid() {
    const app = getApp()
    if (app.checkLoginStatus && app.checkLoginStatus()) {
      const userInfo = app.globalData.userInfo || {}
      if (userInfo.openid) return userInfo.openid
    }

    const storedUserInfo = wx.getStorageSync('userInfo') || {}
    return storedUserInfo.openid || wx.getStorageSync('openid') || ''
  },

  // 加载订单
  async loadOrders() {
    // 防止重复加载，避免无限循环
    if (this.data.isLoadingData) {
      console.log('正在加载中，跳过重复调用')
      return
    }

    this.setData({ isLoading: true, isLoadingData: true })

    const openid = this.getCurrentOpenid()
    if (!openid) {
      this.setData({
        displayOrders: [],
        isLoading: false,
        isLoadingData: false,
        emptyTitle: this.data.tabEmptyTexts[this.data.currentTab].title,
        emptyDesc: '请先登录后查看已发布任务'
      })
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    try {
      const result = await api.getOrders(openid, '', '', 1, 100)
      const orders = (result && result.list) || []
      const statusMap = {
        'PENDING': 'unaccepted',
        'pending': 'unaccepted',
        'WAITING_PAYMENT': 'unaccepted',
        'PROCESSING': 'processing',
        'accepted': 'processing',
        'COMPLETED': 'completed',
        'finished': 'completed',
        'CANCELLED': 'cancelled',
        'cancelled': 'cancelled'
      }

      const filteredOrders = orders.filter(order => {
        const pageStatus = statusMap[order.status]
        return pageStatus === this.data.currentTab
      }).map(order => {
        return {
          id: order.id,
          _id: order.id,
          title: order.title,
          price: (Number(order.price || 0) / 100).toFixed(2),
          createdAt: order.createTime || order.createdAt,
          createdAtText: new Date(order.createTime || order.createdAt || Date.now()).toLocaleString('zh-CN'),
          locationInfo: order.location || order.address || '校园内',
          status: statusMap[order.status] || 'unaccepted',
          swiped: false
        }
      })

      const tabCounts = {
        unaccepted: orders.filter(order => order.status === 'PENDING' || order.status === 'pending' || order.status === 'WAITING_PAYMENT').length,
        processing: orders.filter(order => order.status === 'PROCESSING' || order.status === 'accepted').length,
        completed: orders.filter(order => order.status === 'COMPLETED' || order.status === 'finished').length,
        cancelled: orders.filter(order => order.status === 'CANCELLED' || order.status === 'cancelled').length
      }

      this.setData({
        displayOrders: filteredOrders,
        tabCounts: tabCounts,
        isLoading: false,
        isLoadingData: false,
        emptyTitle: this.data.tabEmptyTexts[this.data.currentTab].title,
        emptyDesc: this.data.tabEmptyTexts[this.data.currentTab].desc
      })
    } catch (err) {
      console.error('加载订单失败:', err)
      this.setData({ isLoading: false, isLoadingData: false })
      wx.showToast({
        title: '网络请求失败，请稍后重试',
        icon: 'none'
      })
    }
  },

  // 切换标签
  switchTab(e) {
    const { tab } = e.currentTarget.dataset
    this.setData({
      currentTab: tab,
      // 更新空状态文本
      emptyTitle: this.data.tabEmptyTexts[tab].title,
      emptyDesc: this.data.tabEmptyTexts[tab].desc
    }, () => {
      this.loadOrders()
    })
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
    const tappedOrder = this.data.displayOrders.find(order => String(order.id) === String(id))
    if (tappedOrder && tappedOrder.swiped) {
      this.closeSwipedOrders()
      return
    }
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

  onOrderTouchStart(e) {
    const touch = e.touches && e.touches[0]
    if (!touch) return

    this.setData({
      swipeStartX: touch.clientX,
      swipeStartY: touch.clientY
    })
  },

  onOrderTouchMove(e) {
    const touch = e.touches && e.touches[0]
    if (!touch) return

    const { index } = e.currentTarget.dataset
    const deltaX = touch.clientX - this.data.swipeStartX
    const deltaY = Math.abs(touch.clientY - this.data.swipeStartY)

    if (deltaY > 80 || Math.abs(deltaX) < 28) return

    if (deltaX < -35) {
      this.setOrderSwiped(index, true)
    } else if (deltaX > 35) {
      this.setOrderSwiped(index, false)
    }
  },

  setOrderSwiped(index, swiped) {
    const displayOrders = this.data.displayOrders.map((order, orderIndex) => ({
      ...order,
      swiped: orderIndex === Number(index) ? swiped : false
    }))
    this.setData({ displayOrders })
  },

  closeSwipedOrders() {
    const displayOrders = this.data.displayOrders.map(order => ({
      ...order,
      swiped: false
    }))
    this.setData({ displayOrders })
  },

  handleSwipeDelete(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '提示',
      content: '你确定要删除此订单吗',
      confirmText: '确定',
      cancelText: '取消',
      success: async (res) => {
        if (!res.confirm) {
          this.closeSwipedOrders()
          return
        }

        try {
          await api.deleteOrder(id)
          this.removeOrderFromList(id)
          wx.showToast({ title: '删除成功', icon: 'success' })
        } catch (error) {
          wx.showToast({ title: error.message || '删除失败', icon: 'none' })
          this.closeSwipedOrders()
        }
      }
    })
  },

  removeOrderFromList(id) {
    const deletedOrder = this.data.displayOrders.find(order => String(order.id) === String(id))
    const displayOrders = this.data.displayOrders.filter(order => String(order.id) !== String(id))
    const tabCounts = { ...this.data.tabCounts }

    if (deletedOrder && tabCounts[deletedOrder.status] > 0) {
      tabCounts[deletedOrder.status] -= 1
    }

    this.setData({
      displayOrders,
      tabCounts,
      emptyTitle: this.data.tabEmptyTexts[this.data.currentTab].title,
      emptyDesc: this.data.tabEmptyTexts[this.data.currentTab].desc
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
