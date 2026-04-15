// 聊天
import api from '../../utils/api'

Page({
  data: {
    chatUserName: '张三',
    inputText: '',
    messages: [],
    scrollTop: 0
  },

  onLoad(options) {
    console.log('页面加载:', options)
    const conversationId = options.id || 'default'
    const chatUserName = options.name ? decodeURIComponent(options.name) : '订单会话'
    const targetOpenid = options.targetOpenid ? decodeURIComponent(options.targetOpenid) : ''
    
    this.setData({
      conversationId: conversationId,
      chatUserName: chatUserName,
      targetOpenid: targetOpenid
    })
    
    this.initializeChat()
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

  // 初始化聊天
  async initializeChat() {
    const conversationId = this.data.conversationId || 'default'

    try {
      const app = getApp()
      const openid = app.globalData.userInfo && app.globalData.userInfo.openid
      if (!openid) {
        wx.showToast({ title: '请先登录', icon: 'none' })
        this.setData({ messages: [] })
        return
      }
      const result = await api.getMessages(openid, conversationId)
      const messageList = result.list || []
      const processedMessages = messageList.map(msg => ({
        ...msg,
        isSelf: msg.fromOpenid === openid || msg.userId === openid,
        time: msg.createTime,
        formattedTime: this.formatTime(msg.createTime)
      })).reverse()

      this.setData({ messages: processedMessages })
      await api.markConversationAsRead(openid, conversationId)
      this.refreshTabBarUnread()
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    } catch (err) {
      console.error('获取历史消息失败:', err)
      wx.showToast({
        title: err.message || '获取消息失败',
        icon: 'none'
      })
      this.setData({ messages: [] })
    }
    
    // 监听新消息
    this.listenForNewMessages()
  },

  // 监听新消息
  listenForNewMessages() {
    const conversationId = this.data.conversationId || 'default'
    
    // 后续可在 3000 Mock 服务稳定后升级为 WebSocket 或轮询
    console.log('开始监听新消息:', conversationId)
  },

  refreshTabBarUnread() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabBar && typeof tabBar.refreshUnreadCount === 'function') {
      tabBar.refreshUnreadCount()
    }
  },

  // 输入框内容变化
  onInputTextChange(e) {
    this.setData({
      inputText: e.detail.value
    })
  },

  // 发送消息
  async sendMessage() {
    const content = this.data.inputText.trim()
    if (!content) return
    
    try {
      const app = getApp()
      const fromOpenid = app.globalData.userInfo && app.globalData.userInfo.openid
      const savedMessage = await api.sendMessage(fromOpenid, this.data.targetOpenid || '', content, this.data.conversationId)
      const newMessage = {
        ...savedMessage,
        isSelf: true,
        content: savedMessage.content || content,
        time: savedMessage.createTime || new Date().toISOString(),
        formattedTime: this.formatTime(savedMessage.createTime || new Date().toISOString())
      }

      this.setData({
        messages: [...this.data.messages, newMessage],
        inputText: '',
        targetOpenid: savedMessage.toOpenid || this.data.targetOpenid || ''
      })

      // 滚动到最新消息
      this.scrollToBottom()
    } catch (err) {
      console.error('发送消息失败:', err)
      wx.showToast({
        title: err.message || '发送消息失败',
        icon: 'none'
      })
    }
  },

  // 滚动到最新消息
  scrollToBottom() {
    const query = wx.createSelectorQuery()
    query.select('.message-list').boundingClientRect()
    query.select('.message-list').scrollOffset()
    query.exec((res) => {
      if (res[0]) {
        this.setData({
          scrollTop: res[1].scrollHeight
        })
      }
    })
  },

  // 格式化时间
  formatTime(timeString) {
    const date = new Date(timeString)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) {
      return '刚刚'
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`
    } else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
  },

  // 加载更多消息
  loadMoreMessages() {
    console.log('加载更多消息')
    // 这里可以实现加载历史消息的逻辑
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  }
})
