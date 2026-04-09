// 校园代课
Page({
  data: {
    week: 1,
    weeks: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    dates: ['04-08', '04-09', '04-10', '04-11', '04-12', '04-13', '04-14'],
    courseTime: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
    courses: [],
    loading: false,
    showtip: false,
    showpoint: false,
    showCourseDialog: false,
    selectedCourse: {}
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.loadCourses()
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

  // 计算课程 grid 位置
  calculateCourseGrid(courses) {
    return courses.map(course => {
      return {
        ...course,
        gridColumn: course.day,
        gridRow: course.startTime,
        gridRowEnd: course.endTime + 1
      }
    })
  },

  // 加载课程
  loadCourses() {
    // 模拟课程数据
    const mockCourses = [
      {
        name: '高等数学',
        location: '教学楼A101',
        teacher: '张老师',
        day: 1,
        startTime: 1,
        endTime: 2
      },
      {
        name: '大学英语',
        location: '教学楼B203',
        teacher: '李老师',
        day: 2,
        startTime: 3,
        endTime: 4
      },
      {
        name: '计算机基础',
        location: '实验楼C305',
        teacher: '王老师',
        day: 3,
        startTime: 5,
        endTime: 6
      }
    ]

    const coursesWithGrid = this.calculateCourseGrid(mockCourses)
    this.setData({ courses: coursesWithGrid })
  },

  // 显示/隐藏菜单
  showtip() {
    this.setData({ showtip: !this.data.showtip })
  },

  // 显示/隐藏周次选择
  showpoint() {
    this.setData({ showpoint: !this.data.showpoint })
  },

  // 选择周次
  onPoint(e) {
    const { week } = e.currentTarget.dataset
    this.setData({ week: parseInt(week), showpoint: false })
  },

  // 导入课程
  importCourse() {
    this.setData({ loading: true })
    
    // 模拟导入
    setTimeout(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '导入成功', icon: 'success' })
    }, 2000)
  },

  // 处理导入课程
  handleImportCourse() {
    this.setData({ showtip: false })
    this.importCourse()
  },

  // 处理刷新课程
  handleRefreshCourse() {
    this.setData({ showtip: false })
    this.loadCourses()
    wx.showToast({ title: '刷新成功', icon: 'success' })
  },

  // 处理清空课程
  handleClearCourse() {
    this.setData({ showtip: false })
    wx.showModal({
      title: '清空课表',
      content: '确定要清空课表吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ courses: [] })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  // 显示课程信息
  showCourseInfo(e) {
    const { course } = e.currentTarget.dataset
    this.setData({
      selectedCourse: course,
      showCourseDialog: true
    })
  },

  // 确认代课
  confirmSubstitute() {
    this.setData({ showCourseDialog: false })
    wx.navigateTo({ url: '/pages/publish/index' })
  }
})