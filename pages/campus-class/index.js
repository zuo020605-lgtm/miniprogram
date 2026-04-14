// 校园代课
const COURSE_COLORS = ['#005da4', '#23a6d5', '#4caf50', '#ff9800', '#b31b25', '#6b8afd']

Page({
  data: {
    week: 1,
    currentWeek: 1,
    weekNumbers: Array.from({ length: 20 }, (_, index) => index + 1),
    weekList: [],
    time: {
      one: [
        { index: 1, timeStart: '08:00', timeEnd: '08:45' },
        { index: 2, timeStart: '08:55', timeEnd: '09:40' },
        { index: 3, timeStart: '09:50', timeEnd: '10:35' },
        { index: 4, timeStart: '10:45', timeEnd: '11:30' }
      ],
      two: [
        { index: 5, timeStart: '14:00', timeEnd: '14:45' },
        { index: 6, timeStart: '14:55', timeEnd: '15:40' }
      ],
      three: [
        { index: 7, timeStart: '15:50', timeEnd: '16:35' },
        { index: 8, timeStart: '16:45', timeEnd: '17:30' }
      ]
    },
    schedule: {
      one: [],
      two: [],
      three: [],
      four: []
    },
    courses: [],
    loading: false,
    showtip: false,
    showpoint: false,
    isShow: false,
    current: {}
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.updateWeekList()
    this.loadCourses()
  },

  onShow() {
    console.log('页面显示')
    this.updateWeekList()
  },

  updateWeekList() {
    const today = new Date()
    const day = today.getDay() || 7
    const monday = new Date(today)
    monday.setDate(today.getDate() - day + 1)

    const labels = ['周一', '周二', '周三', '周四', '周五']
    const weekList = labels.map((label, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return {
        week: label,
        day: this.formatDate(date),
        isCurr: this.isSameDay(date, today)
      }
    })

    this.setData({ weekList })
  },

  formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day}`
  },

  isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
  },

  createEmptyRow() {
    return Array.from({ length: 5 }, (_, index) => ({
      sub: '',
      add: '',
      tec: '',
      color: '#f7f9fc',
      type: 0,
      day: index + 1
    }))
  },

  getRowKey(startTime) {
    if (startTime <= 2) return 'one'
    if (startTime <= 4) return 'two'
    if (startTime <= 6) return 'three'
    return 'four'
  },

  getCourseTimeLabel(course) {
    const allTimes = [
      ...this.data.time.one,
      ...this.data.time.two,
      ...this.data.time.three
    ]
    const start = allTimes.find(item => item.index === course.startTime)
    const end = allTimes.find(item => item.index === course.endTime)
    if (!start || !end) return '待确认'
    return `${start.timeStart}-${end.timeEnd}`
  },

  buildSchedule(courses) {
    const schedule = {
      one: this.createEmptyRow(),
      two: this.createEmptyRow(),
      three: this.createEmptyRow(),
      four: this.createEmptyRow()
    }

    courses.forEach((course, index) => {
      const rowKey = this.getRowKey(course.startTime)
      const dayIndex = Math.max(0, Math.min(4, (course.day || 1) - 1))
      schedule[rowKey][dayIndex] = {
        ...course,
        sub: course.name,
        add: course.location,
        tec: course.teacher,
        timeLabel: this.getCourseTimeLabel(course),
        color: course.color || COURSE_COLORS[index % COURSE_COLORS.length],
        type: 1
      }
    })

    this.setData({ schedule, courses })
  },

  loadCourses() {
    const mockCourses = [
      {
        id: 'math-1',
        name: '高等数学',
        location: '教学楼A101',
        teacher: '张老师',
        day: 1,
        startTime: 1,
        endTime: 2
      },
      {
        id: 'english-1',
        name: '大学英语',
        location: '教学楼B203',
        teacher: '李老师',
        day: 2,
        startTime: 3,
        endTime: 4
      },
      {
        id: 'computer-1',
        name: '计算机基础',
        location: '实验楼C305',
        teacher: '王老师',
        day: 3,
        startTime: 5,
        endTime: 6
      },
      {
        id: 'sport-1',
        name: '大学体育',
        location: '体育馆1号场',
        teacher: '陈老师',
        day: 5,
        startTime: 7,
        endTime: 8
      }
    ]

    this.buildSchedule(mockCourses)
  },

  showtip() {
    this.setData({ showtip: !this.data.showtip })
  },

  showpoint() {
    this.setData({ showpoint: !this.data.showpoint })
  },

  onPoint(e) {
    const { week } = e.currentTarget.dataset
    this.setData({
      week: Number(week),
      currentWeek: Number(week),
      showpoint: false
    })
  },

  importCourse() {
    this.setData({ loading: true })

    setTimeout(() => {
      this.loadCourses()
      this.setData({ loading: false })
      wx.showToast({ title: '导入成功', icon: 'success' })
    }, 800)
  },

  handleImportCourse() {
    this.setData({ showtip: false })
    this.importCourse()
  },

  handleRefreshCourse() {
    this.setData({ showtip: false })
    this.loadCourses()
    wx.showToast({ title: '刷新成功', icon: 'success' })
  },

  handleClearCourse() {
    this.setData({ showtip: false })
    wx.showModal({
      title: '清空课表',
      content: '确定要清空课表吗？',
      success: (res) => {
        if (res.confirm) {
          this.buildSchedule([])
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  getDetail(e) {
    const { item } = e.currentTarget.dataset
    if (!item || !item.type) return

    this.setData({
      current: item,
      isShow: true
    })
  },

  close() {
    this.setData({ isShow: false })
  },

  noop() {},

  publishSubstitute() {
    const course = this.data.current || {}
    if (!course.type) return

    this.setData({ isShow: false })
    wx.navigateTo({
      url: '/pages/campus-class-publish/index' +
        `?courseName=${encodeURIComponent(course.sub || '')}` +
        `&courseLocation=${encodeURIComponent(course.add || '')}` +
        `&courseTeacher=${encodeURIComponent(course.tec || '')}` +
        `&courseTime=${encodeURIComponent(course.timeLabel || '')}` +
        `&week=${encodeURIComponent(this.data.currentWeek)}` +
        `&day=${encodeURIComponent(course.day || '')}`
    })
  }
})
