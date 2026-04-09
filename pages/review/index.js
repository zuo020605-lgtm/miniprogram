// 评价
Page({
  data: {
    rating: 0,
    tags: ['服务态度好', '速度快', '价格合理', '专业可靠', '沟通顺畅'],
    selectedTags: [],
    content: '',
    canSubmit: false,
    orderId: ''
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.setData({ orderId: options.orderId || '' })
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

  submitReview() {
    const { rating, selectedTags, content, orderId } = this.data
    if (!this.data.canSubmit) return
    wx.cloud.callFunction({
      name: 'submitReview',
      data: {
        orderId: orderId,
        rating: rating,
        tags: selectedTags,
        content: content
      },
      success: (res) => {
        console.log('评价提交成功:', res)
        wx.showToast({
          title: '评价成功',
          icon: 'success'
        })
        wx.navigateBack()
      },
      fail: (err) => {
        console.error('评价提交失败:', err)
        wx.showToast({
          title: '评价失败',
          icon: 'none'
        })
      }
    })
  }
})
