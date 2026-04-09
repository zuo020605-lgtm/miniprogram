// 聊天
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
    const chatUserName = options.name || '张三'
    
    this.setData({
      conversationId: conversationId,
      chatUserName: chatUserName
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
  initializeChat() {
    const conversationId = this.data.conversationId || 'default'
    
    // 接入云函数获取历史消息
    wx.cloud.callFunction({
      name: 'getMessages',
      data: {
        conversationId: conversationId
      },
      success: (res) => {
        console.log('获取历史消息成功:', res)
        if (res.result) {
          // 预处理时间字段
          const processedMessages = res.result.map(msg => ({
            ...msg,
            formattedTime: this.formatTime(msg.time)
          }))
          
          this.setData({
            messages: processedMessages
          })
          
          // 滚动到最新消息
          setTimeout(() => {
            this.scrollToBottom()
          }, 100)
        }
      },
      fail: (err) => {
        console.error('获取历史消息失败:', err)
        wx.showToast({
          title: '获取消息失败',
          icon: 'none'
        })
      }
    })
    
    // 监听新消息
    this.listenForNewMessages()
  },

  // 监听新消息
  listenForNewMessages() {
    const conversationId = this.data.conversationId || 'default'
    
    // 这里可以使用微信小程序云开发的实时数据库监听
    // 或者使用 WebSocket 连接
    // 示例代码（实际实现需要根据具体的实时通信方案调整）
    wx.cloud.callFunction({
      name: 'listenMessages',
      data: {
        conversationId: conversationId
      },
      success: (res) => {
        console.log('开始监听新消息:', res)
        // 监听逻辑
      },
      fail: (err) => {
        console.error('监听新消息失败:', err)
      }
    })
  },

  // 输入框内容变化
  onInputTextChange(e) {
    this.setData({
      inputText: e.detail.value
    })
  },

  // 发送消息
  sendMessage() {
    const content = this.data.inputText.trim()
    if (!content) return
    
    const newMessage = {
      isSelf: true,
      content: content,
      time: new Date().toISOString(),
      formattedTime: this.formatTime(new Date().toISOString())
    }
    
    const updatedMessages = [...this.data.messages, newMessage]
    
    this.setData({
      messages: updatedMessages,
      inputText: ''
    })
    
    // 滚动到最新消息
    this.scrollToBottom()
    
    // 接入云函数发送消息
    wx.cloud.callFunction({
      name: 'sendMessage',
      data: {
        content: content,
        conversationId: this.data.conversationId
      },
      success: (res) => {
        console.log('发送消息成功:', res)
      },
      fail: (err) => {
        console.error('发送消息失败:', err)
        wx.showToast({
          title: '发送消息失败',
          icon: 'none'
        })
      }
    })
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
