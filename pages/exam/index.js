// 考试代替
Page({
  data: {
    tasks: [],
    loading: false
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.loadTasks()
  },

  onShow() {
    console.log('页面显示')
    this.loadTasks()
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  loadTasks() {
    this.setData({ loading: true })
    wx.cloud.callFunction({
      name: 'getTasks',
      data: {
        type: 'exam',
        status: 'pending'
      },
      success: (res) => {
        console.log('获取任务列表成功:', res)
        this.setData({
          tasks: res.result || [],
          loading: false
        })
      },
      fail: (err) => {
        console.error('获取任务列表失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '获取任务失败',
          icon: 'none'
        })
      }
    })
  },

  acceptTask(e) {
    const taskId = e.currentTarget.dataset.id
    wx.cloud.callFunction({
      name: 'acceptTask',
      data: {
        taskId: taskId
      },
      success: (res) => {
        console.log('接单成功:', res)
        wx.showToast({
          title: '接单成功',
          icon: 'success'
        })
        this.loadTasks()
      },
      fail: (err) => {
        console.error('接单失败:', err)
        wx.showToast({
          title: '接单失败',
          icon: 'none'
        })
      }
    })
  }
})
