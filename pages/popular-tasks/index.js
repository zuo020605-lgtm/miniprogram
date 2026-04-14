// 热门任务
import api from '../../utils/api'

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

    // 从本地服务器获取订单数据
    api.request('/api/order/all').then(res => {
      if (res.success && res.data && res.data.list) {
        const orders = res.data.list

        // 过滤出已支付且未接取的订单
        const unacceptedOrders = orders.filter(order => order.status === 'PENDING' && order.paymentStatus === 'PAID').map(order => {
          return {
            _id: order.id,
            title: order.title,
            price: Number(order.price || 0) / 100,
            tagText: '待接单',
            pickupLocation: order.location || '校园内',
            deliveryLocation: order.location || '校园内',
            startTimeText: '尽快',
            createdAtText: this._getTimeAgo(order.createTime || order.createdAt)
          }
        })

        this.setData({
          unacceptedOrders: unacceptedOrders,
          loading: false
        })
      } else {
        this.setData({
          unacceptedOrders: [],
          loading: false
        })
      }
    }).catch(err => {
      console.error('加载未接取订单失败:', err)
      this.setData({ loading: false })
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

  // 导航到订单详情
  navigateToOrderDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order-detail/index?id=${id}&status=pending` })
  }
})
