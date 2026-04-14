// 消息
import api from '../../utils/api'

Page({
  data: {
    conversations: [],
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
  },

  syncTabBar() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabBar && tabBar.data.selected !== 2) {
      tabBar.setData({ selected: 2 })
    }
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  // 加载会话列表
  async loadConversations() {
    this.setData({ isLoading: true })

    try {
      const app = getApp()
      if (!app.globalData.hasLogin) {
        this.setData({ isLoading: false })
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

        this.setData({
          conversations: conversations,
          isLoading: false
        })
      } else {
        this.setData({
          conversations: [],
          isLoading: false,
          hasMore: false
        })
      }
    } catch (error) {
      console.error('加载会话列表失败:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ isLoading: false })
    }
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
