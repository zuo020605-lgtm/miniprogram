// 我的接单
import api from '../../../utils/api'

Page({
  data: {
    activeTab: 'pending',
    filteredOrders: [],
    loading: true,
    isLoadingData: false // 防止重复加载的标志
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
    // 防止重复加载，避免无限循环
    if (this.data.isLoadingData) {
      console.log('正在加载中，跳过重复调用')
      return
    }

    this.setData({ loading: true, isLoadingData: true })

    // 从本地服务器获取订单数据
    api.request('/api/order/all').then(res => {
      if (res.success && res.data && res.data.list) {
        const orders = res.data.list

        // 状态映射：将服务器状态映射到页面状态
        const statusMap = {
          'PENDING': 'pending',
          'PROCESSING': 'processing',
          'COMPLETED': 'completed',
          'CANCELLED': 'cancelled'
        }

        // 状态文本映射
        const statusTextMap = {
          'pending': '待处理',
          'processing': '进行中',
          'completed': '已完成',
          'cancelled': '已取消'
        }

        // 过滤并格式化订单
        const filtered = orders.filter(order => {
          const pageStatus = statusMap[order.status]
          return pageStatus === this.data.activeTab
        }).map(order => {
          return {
            id: order.id,
            _id: order.id,
            title: order.title,
            price: order.price,
            status: statusMap[order.status] || 'pending',
            statusText: statusTextMap[statusMap[order.status]] || '待处理',
            createdAtText: this._getTimeAgo(order.createTime || order.createdAt)
          }
        })

        this.setData({
          filteredOrders: filtered,
          loading: false,
          isLoadingData: false
        })
      } else {
        this.setData({
          filteredOrders: [],
          loading: false,
          isLoadingData: false
        })
      }
    }).catch(err => {
      console.error('加载订单失败:', err)
      this.setData({ loading: false, isLoadingData: false })
    })
  },

  // 计算时间差
  _getTimeAgo(timestamp) {
    const now = new Date().getTime()
    const postTime = new Date(timestamp).getTime()
    const diff = now - postTime

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) {
      return '刚刚'
    } else if (minutes < 60) {
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else {
      return `${days}天前`
    }
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
