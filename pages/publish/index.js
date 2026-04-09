// 发布任务
Page({
  data: {
    selectedType: '',
    selectedDate: '',
    startTime: '',
    endTime: '',
    pickupLocation: '',
    deliveryLocation: '',
    examLocation: '',
    examSubject: '',
    weightOptions: [
      { label: '1kg内', value: '1kg', index: 0 },
      { label: '5kg内', value: '5kg', index: 1 },
      { label: '10kg内', value: '10kg', index: 2 },
      { label: '10kg+', value: '10kg+', index: 3 }
    ],
    selectedWeight: '1kg',
    selectedWeightLabel: '1kg内',
    selectedWeightIndex: 0,
    sliderProgress: 0,
    minDate: '',
    price: '',
    taskDetail: '',
    contactInfo: '',
    canPublish: false,
    // 滑动相关
    sliderStartX: 0,
    sliderWidth: 0,
    currentProgress: 0
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.initDate()
    // 如果传入类型参数，自动选中
    if (options.type) {
      this.setData({ selectedType: options.type })
    }
  },

  onShow() {
    console.log('页面显示')
    // 获取滑块宽度
    this.getSliderWidth()
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  // 获取滑块宽度
  getSliderWidth() {
    const query = wx.createSelectorQuery()
    query.select('.weight-slider-track').boundingClientRect()
    query.exec((res) => {
      if (res && res[0]) {
        this.setData({ sliderWidth: res[0].width - 40 }) // 减去左右边距
      }
    })
  },

  // 初始化日期
  initDate() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const minDate = `${year}-${month}-${day}`
    
    this.setData({ minDate, selectedDate: minDate })
  },

  // 选择任务类型
  selectType(e) {
    const { type } = e.currentTarget.dataset
    
    // 当选择校园代课时，跳转到专用页面
    if (type === 'campus-class') {
      wx.navigateTo({ url: '/pages/campus-class/index' })
      return
    }
    
    this.setData({ selectedType: type })
    this.checkCanPublish()
  },

  // 日期变更
  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value })
  },

  // 开始时间变更
  onStartTimeChange(e) {
    this.setData({ startTime: e.detail.value })
  },

  // 结束时间变更
  onEndTimeChange(e) {
    this.setData({ endTime: e.detail.value })
  },

  // 取货地点变更
  onPickupLocationChange(e) {
    this.setData({ pickupLocation: e.detail.value })
    this.checkCanPublish()
  },

  // 送达地点变更
  onDeliveryLocationChange(e) {
    this.setData({ deliveryLocation: e.detail.value })
    this.checkCanPublish()
  },

  // 考试地点变更
  onExamLocationChange(e) {
    this.setData({ examLocation: e.detail.value })
    this.checkCanPublish()
  },

  // 考试科目变更
  onExamSubjectChange(e) {
    this.setData({ examSubject: e.detail.value })
    this.checkCanPublish()
  },

  // ========== 重量选择器 - 拖动功能 ==========
  
  // 触摸开始
  onSliderTouchStart(e) {
    const touch = e.touches[0]
    const query = wx.createSelectorQuery()
    query.select('.weight-slider-track').boundingClientRect()
    query.exec((res) => {
      if (res && res[0]) {
        const rect = res[0]
        const sliderWidth = rect.width - 40 // 减去左右边距
        const startX = rect.left + 20 // 左边距
        const currentX = touch.clientX - startX
        let progress = (currentX / sliderWidth) * 100
        
        // 限制范围 0-100
        progress = Math.max(0, Math.min(100, progress))
        
        this.setData({
          sliderStartX: startX,
          sliderWidth: sliderWidth,
          currentProgress: progress,
          sliderProgress: progress
        })
        
        this.snapToNearestNode(progress)
      }
    })
  },

  // 触摸移动
  onSliderTouchMove(e) {
    const touch = e.touches[0]
    const { sliderStartX, sliderWidth } = this.data
    
    if (sliderWidth === 0) return
    
    const currentX = touch.clientX - sliderStartX
    let progress = (currentX / sliderWidth) * 100
    
    // 限制范围 0-100
    progress = Math.max(0, Math.min(100, progress))
    
    this.setData({
      currentProgress: progress,
      sliderProgress: progress
    })
  },

  // 触摸结束
  onSliderTouchEnd(e) {
    const { currentProgress } = this.data
    this.snapToNearestNode(currentProgress)
  },

  // 吸附到最近的节点
  snapToNearestNode(progress) {
    // 四个节点的位置：0%, 33.33%, 66.66%, 100%
    const nodePositions = [0, 33.33, 66.66, 100]
    const threshold = 16.67 // 每个区间的一半
    
    let nearestIndex = 0
    let minDistance = Math.abs(progress - nodePositions[0])
    
    for (let i = 1; i < nodePositions.length; i++) {
      const distance = Math.abs(progress - nodePositions[i])
      if (distance < minDistance) {
        minDistance = distance
        nearestIndex = i
      }
    }
    
    // 只有当距离小于阈值时才吸附
    if (minDistance <= threshold) {
      this.selectWeightByIndex({ currentTarget: { dataset: { index: nearestIndex } } })
    }
  },

  // 通过索引选择重量
  selectWeightByIndex(e) {
    const { index } = e.currentTarget.dataset
    const { weightOptions } = this.data
    const selectedOption = weightOptions[index]
    
    // 计算进度位置
    const nodePositions = [0, 33.33, 66.66, 100]
    const progress = nodePositions[index]
    
    this.setData({
      selectedWeight: selectedOption.value,
      selectedWeightLabel: selectedOption.label,
      selectedWeightIndex: index,
      sliderProgress: progress,
      currentProgress: progress
    })
  },

  // 金额变更
  onPriceChange(e) {
    this.setData({ price: e.detail.value })
    this.checkCanPublish()
  },

  // 任务详情变更
  onTaskDetailChange(e) {
    this.setData({ taskDetail: e.detail.value })
    this.checkCanPublish()
  },

  // 联系方式变更
  onContactInfoChange(e) {
    this.setData({ contactInfo: e.detail.value })
    this.checkCanPublish()
  },

  // 检查是否可以发布
  checkCanPublish() {
    const { selectedType, price, taskDetail, contactInfo, pickupLocation, deliveryLocation, examLocation, examSubject } = this.data
    let canPublish = false
    
    if (selectedType === 'campus-errand' || selectedType === 'express') {
      canPublish = price && taskDetail && contactInfo && pickupLocation && deliveryLocation
    } else if (selectedType === 'exam') {
      canPublish = price && taskDetail && contactInfo && examLocation && examSubject
    }
    
    this.setData({ canPublish })
  },

  // 发布任务
  publishTask() {
    if (!this.data.canPublish) return
    
    // 发布前预览弹窗
    const { selectedType, selectedDate, startTime, price, taskDetail, contactInfo, pickupLocation, deliveryLocation, examLocation, examSubject } = this.data
    let previewContent = `任务类型：${selectedType === 'campus-errand' ? '校园跑腿' : selectedType === 'express' ? '快递代取' : '考试代替'}\n`
    previewContent += `日期：${selectedDate}\n`
    previewContent += `时间：${startTime}\n`
    
    if (selectedType === 'campus-errand' || selectedType === 'express') {
      previewContent += `取货地点：${pickupLocation}\n`
      previewContent += `送达地点：${deliveryLocation}\n`
    } else if (selectedType === 'exam') {
      previewContent += `考试地点：${examLocation}\n`
      previewContent += `考试科目：${examSubject}\n`
    }
    
    previewContent += `金额：¥${price}\n`
    previewContent += `详情：${taskDetail}\n`
    previewContent += `联系方式：${contactInfo}`
    
    wx.showModal({
      title: '发布确认',
      content: previewContent,
      confirmText: '确认发布',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '发布中...' })
          
          // 模拟发布成功
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '发布成功',
              icon: 'success'
            })
            
            // 返回首页
            setTimeout(() => {
              wx.switchTab({ url: '/pages/index/index' })
            }, 1500)
          }, 1000)
        }
      }
    })
  }
})
