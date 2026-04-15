// 消息
import api from '../../utils/api'

Page({
  data: {
    conversations: [],
    unreadTotal: 0,
    isLoading: false,
    hasMore: true,
    loadingMore: false
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.loadConversations()
  },

  onShow() {
    console.log('页面显示')
    this.syncTabBar()
    this.loadConversations()
    const app = getApp()
    if (app.globalData && app.globalData.hasLogin) {
      this.startUnreadRefresh()
    }
  },

  syncTabBar() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabBar && tabBar.data.selected !== 2) {
      tabBar.setData({ selected: 2 })
    }
  },

  onHide() {
    console.log('页面隐藏')
    this.stopUnreadRefresh()
  },

  onUnload() {
    console.log('页面卸载')
    this.stopUnreadRefresh()
  },

  // 加载会话列表
  async loadConversations() {
    this.setData({ isLoading: true })

    try {
      const app = getApp()
      if (!app.globalData.hasLogin) {
        this.setData({ isLoading: false, unreadTotal: 0, conversations: [] })
        this.updateTabBarUnread(0)
        wx.showToast({ title: '请先登录', icon: 'none' })
        return
      }

      const userInfo = app.globalData.userInfo || {}
      const response = await api.getConversations(userInfo.openid)
      if (response && response.list && response.list.length) {
        const conversations = response.list.map(item => ({
          ...item,
          lastMessageTime: new Date(item.lastMessageTime || item.createTime || Date.now()).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }))
        const unreadTotal = conversations.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0)

        this.setData({
          conversations: conversations,
          unreadTotal,
          isLoading: false
        })
        this.updateTabBarUnread(unreadTotal)
      } else {
        this.setData({
          conversations: [],
          unreadTotal: 0,
          isLoading: false,
          hasMore: false
        })
        this.updateTabBarUnread(0)
      }
    } catch (error) {
      console.error('加载会话列表失败:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ isLoading: false })
    }
  },

  startUnreadRefresh() {
    this.stopUnreadRefresh()
    this.unreadTimer = setInterval(() => {
      this.loadConversations()
    }, 15000)
  },

  stopUnreadRefresh() {
    if (this.unreadTimer) {
      clearInterval(this.unreadTimer)
      this.unreadTimer = null
    }
  },

  updateTabBarUnread(count) {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabBar) {
      tabBar.setData({ unreadCount: count })
    }
  },

  refreshMessages() {
    this.loadConversations()
  },

  // 导航到聊天页面
  navigateToChat(e) {
    const conversation = e.currentTarget.dataset.conversation
    const targetOpenid = conversation.targetOpenid ? `&targetOpenid=${encodeURIComponent(conversation.targetOpenid)}` : ''
    wx.navigateTo({
      url: `/pages/chat/index?id=${conversation.id}&name=${encodeURIComponent(conversation.name)}${targetOpenid}`
    })
  },

  // 加载更多
  loadMore() {
    if (this.data.loadingMore || !this.data.hasMore) return

    this.setData({ loadingMore: true })

    // 模拟加载更多
    setTimeout(() => {
      this.setData({ loadingMore: false, hasMore: false })
    }, 1000)
  }
})
