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
    priceText: '¥0.00'
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.setData({
      orderId: options.orderId || '',
      priceText: '¥' + (options.price || '0.00')
    })
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
    const rating = e.currentTarget.dataset.rating
    this.setData({ rating: rating })
    this.checkCanSubmit()
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
