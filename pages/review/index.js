// 评价
import api from '../../utils/api'

Page({
  data: {
    rating: 0,
    tags: ['服务态度好', '速度快', '价格合理', '专业可靠', '沟通顺畅'],
    selectedTags: [],
    content: '',
    canSubmit: false,
    orderId: '',
    order: {},
    priceText: '¥0.00',
    ratingText: '请选择评分'
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.setData({
      orderId: options.orderId || '',
      priceText: '¥' + (options.price || '0.00')
    })
    if (options.orderId) {
      this.loadOrder(options.orderId)
    }
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

  handleRating(e) {
    const rating = Number(e.currentTarget.dataset.rating || 0)
    const ratingTextMap = {
      1: '很不满意',
      2: '不太满意',
      3: '基本满意',
      4: '满意',
      5: '非常满意'
    }
    this.setData({
      rating,
      ratingText: ratingTextMap[rating] || '请选择评分'
    })
    this.checkCanSubmit()
  },

  async loadOrder(orderId) {
    try {
      const order = await api.getOrderDetail(orderId)
      this.setData({
        order,
        priceText: '¥' + (Number(order.price || 0) / 100).toFixed(2)
      })
    } catch (error) {
      console.error('评价页加载订单失败:', error)
    }
  },

  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag
    let selectedTags = this.data.selectedTags
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter(t => t !== tag)
    } else {
      selectedTags.push(tag)
    }
    this.setData({ selectedTags: selectedTags })
    this.checkCanSubmit()
  },

  handleContentChange(e) {
    this.setData({ content: e.detail.value })
    this.checkCanSubmit()
  },

  checkCanSubmit() {
    const { rating, selectedTags, content } = this.data
    const canSubmit = rating > 0 && selectedTags.length > 0 && content.trim().length > 0
    this.setData({ canSubmit: canSubmit })
  },

  async submitReview() {
    const { rating, selectedTags, content, orderId } = this.data
    if (!this.data.canSubmit) return

    this.setData({ submitting: true })
    try {
      const app = getApp()
      await api.submitReview(orderId, {
        openid: app.globalData.userInfo && app.globalData.userInfo.openid,
        rating,
        tags: selectedTags,
        content
      })
      wx.showToast({
        title: '评价成功',
        icon: 'success'
      })
      wx.navigateBack()
    } catch (err) {
      console.error('评价提交失败:', err)
      wx.showToast({
        title: err.message || '评价失败',
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  navigateBack() {
    wx.navigateBack()
  }
})
