import api from '../../utils/api.js'

Page({
  data: {
    selectedType: 'campus-class',
    courseName: '',
    courseTeacher: '',
    courseLocation: '',
    courseTime: '',
    week: '',
    day: '',
    teachingBuilding: '',
    classroom: '',
    needSignIn: false,
    classroomSize: 'small',
    price: '',
    taskDetail: '',
    contactInfo: '',
    canPublish: false,
    isPublishing: false,
    orderInfo: null
  },

  onLoad(options) {
    console.log('发布代课页面加载:', options)
    this.initFromCourse(options || {})
  },

  onShow() {
    this.setData({ isPublishing: false })
  },

  initFromCourse(options) {
    const courseName = options.courseName ? decodeURIComponent(options.courseName) : ''
    const courseTeacher = options.courseTeacher ? decodeURIComponent(options.courseTeacher) : ''
    const courseLocation = options.courseLocation ? decodeURIComponent(options.courseLocation) : ''
    const courseTime = options.courseTime ? decodeURIComponent(options.courseTime) : ''
    const { teachingBuilding, classroom } = this.parseLocation(courseLocation)

    this.setData({
      courseName,
      courseTeacher,
      courseLocation,
      courseTime,
      week: options.week || '',
      day: options.day || '',
      teachingBuilding,
      classroom,
      taskDetail: courseName ? `请帮忙代上${courseName}${courseTime ? `（${courseTime}）` : ''}` : ''
    })
    this.checkCanPublish()
  },

  parseLocation(location) {
    if (!location) {
      return { teachingBuilding: '', classroom: '' }
    }

    const matched = String(location).match(/^(.+?)([A-Za-z]?\d+.*)$/)
    if (!matched) {
      return { teachingBuilding: location, classroom: '' }
    }

    return {
      teachingBuilding: matched[1],
      classroom: matched[2]
    }
  },

  onTeachingBuildingChange(e) {
    this.setData({ teachingBuilding: e.detail.value })
    this.checkCanPublish()
  },

  onClassroomChange(e) {
    this.setData({ classroom: e.detail.value })
    this.checkCanPublish()
  },

  onNeedSignInChange(e) {
    this.setData({ needSignIn: e.detail.value })
  },

  selectClassroomSize(e) {
    const { size } = e.currentTarget.dataset
    this.setData({ classroomSize: size })
  },

  onPriceChange(e) {
    this.setData({ price: e.detail.value })
    this.checkCanPublish()
  },

  onTaskDetailChange(e) {
    this.setData({ taskDetail: e.detail.value })
    this.checkCanPublish()
  },

  onContactInfoChange(e) {
    this.setData({ contactInfo: e.detail.value })
    this.checkCanPublish()
  },

  checkCanPublish() {
    const { price, taskDetail, contactInfo, teachingBuilding, classroom } = this.data
    this.setData({
      canPublish: !!(price && taskDetail && contactInfo && teachingBuilding && classroom)
    })
  },

  async publishTask() {
    if (!this.data.canPublish || this.data.isPublishing) return

    const {
      courseName,
      courseTeacher,
      courseTime,
      teachingBuilding,
      classroom,
      needSignIn,
      classroomSize,
      price,
      taskDetail,
      contactInfo
    } = this.data

    const priceNumber = Number(price)
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      wx.showToast({ title: '请输入正确的金额', icon: 'none' })
      return
    }

    const previewContent = [
      `任务类型：校园代课`,
      courseName ? `课程：${courseName}` : '',
      courseTeacher ? `教师：${courseTeacher}` : '',
      courseTime ? `时间：${courseTime}` : '',
      `地点：${teachingBuilding} ${classroom}`,
      `是否签到：${needSignIn ? '需要' : '不需要'}`,
      `教室类型：${classroomSize === 'large' ? '大教室' : '小教室'}`,
      `金额：¥${price}`,
      `详情：${taskDetail}`,
      `联系方式：${contactInfo}`
    ].filter(Boolean).join('\n')

    wx.showModal({
      title: '发布确认',
      content: previewContent,
      confirmText: '确认发布',
      cancelText: '取消',
      success: async (res) => {
        if (!res.confirm) return

        this.setData({ isPublishing: true })
        wx.showLoading({ title: '发布中...' })

        try {
          const app = getApp()
          const userInfo = app.globalData.userInfo

          if (!userInfo || !userInfo.openid) {
            throw new Error('请先登录')
          }

          const location = `${teachingBuilding} ${classroom}`.trim()
          const orderData = {
            openid: userInfo.openid,
            title: courseName ? `代课-${courseName}` : '校园代课',
            description: taskDetail,
            price: Math.round(priceNumber * 100),
            location,
            contact: {
              phone: contactInfo,
              method: 'wechat'
            },
            type: 'campus-class',
            examLocation: location,
            examSubject: courseName,
            examClassroom: classroom,
            teachingBuilding,
            classroom,
            courseName,
            courseTeacher,
            courseTime,
            needSignIn,
            classroomSize,
            time: courseTime
          }

          const order = await api.createOrder(orderData)
          if (!order) {
            throw new Error('发布失败')
          }

          this.setData({ orderInfo: order })
          wx.hideLoading({
            complete: () => {
              this.navigateToPayment(order)
            }
          })
        } catch (error) {
          wx.hideLoading()
          this.setData({ isPublishing: false })
          wx.showToast({
            title: error.message || '发布失败',
            icon: 'none'
          })
        }
      }
    })
  },

  navigateToPayment(order) {
    const orderId = order && order.id
    if (!orderId) {
      this.setData({ isPublishing: false })
      wx.showToast({ title: '订单数据异常', icon: 'none' })
      return
    }

    const url = `/pages/payment/index?orderId=${encodeURIComponent(orderId)}`
    wx.navigateTo({
      url,
      fail: () => {
        wx.redirectTo({
          url,
          fail: () => {
            this.setData({ isPublishing: false })
            wx.showToast({ title: '进入支付页失败', icon: 'none' })
          }
        })
      }
    })
  }
})
