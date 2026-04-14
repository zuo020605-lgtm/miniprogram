// 校园跑腿
import api from '../../utils/api'

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

  async loadTasks() {
    this.setData({ loading: true })

    try {
      const tasks = await api.getAvailableOrders('campus-errand')
      this.setData({
        tasks: this.formatTasks(tasks),
        loading: false
      })
    } catch (err) {
      console.error('获取任务列表失败:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '获取任务失败',
        icon: 'none'
      })
    }
  },

  formatTasks(tasks) {
    return tasks.map(task => ({
      ...task,
      price: Number(task.price || 0) / 100,
      time: task.time || '尽快',
      publisher: task.openid || '发布者',
      location: task.location || task.pickupLocation || '校园内'
    }))
  },

  async acceptTask(e) {
    const taskId = e.currentTarget.dataset.id
    try {
      const app = getApp()
      await api.acceptOrder(taskId, app.globalData.userInfo && app.globalData.userInfo.openid)
      wx.showToast({
        title: '接单成功',
        icon: 'success'
      })
      this.loadTasks()
    } catch (err) {
      console.error('接单失败:', err)
      wx.showToast({
        title: err.message || '接单失败',
        icon: 'none'
      })
    }
  }
})
