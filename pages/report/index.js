// 举报
Page({
  data: {
    reportTypes: [
      { name: '虚假订单' },
      { name: '恶意骚扰' },
      { name: '欺诈行为' },
      { name: '其他问题' }
    ],
    selectedType: -1,
    description: '',
    images: [],
    contact: '',
    submitting: false
  },

  onLoad(options) {
    console.log('页面加载:', options)
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

  // 选择举报类型
  selectType(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ selectedType: parseInt(index) })
  },

  // 描述变更
  onDescriptionChange(e) {
    this.setData({ description: e.detail.value })
  },

  // 联系方式变更
  onContactChange(e) {
    this.setData({ contact: e.detail.value })
  },

  // 选择图片
  chooseImage() {
    const { images } = this.data
    if (images.length >= 3) {
      wx.showToast({ title: '最多上传3张图片', icon: 'none' })
      return
    }

    wx.chooseImage({
      count: 3 - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = [...images, ...res.tempFilePaths]
        this.setData({ images: newImages })
      }
    })
  },

  // 移除图片
  removeImage(e) {
    const { index } = e.currentTarget.dataset
    const { images } = this.data
    images.splice(index, 1)
    this.setData({ images })
  },

  // 提交举报
  submitReport() {
    const { selectedType, description, reportTypes } = this.data

    if (selectedType === -1) {
      wx.showToast({ title: '请选择举报类型', icon: 'none' })
      return
    }

    if (!description.trim()) {
      wx.showToast({ title: '请填写详细描述', icon: 'none' })
      return
    }

    this.setData({ submitting: true })

    // 模拟提交
    setTimeout(() => {
      wx.showToast({ title: '举报成功', icon: 'success' })
      this.setData({ submitting: false })

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 2000)
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  }
})