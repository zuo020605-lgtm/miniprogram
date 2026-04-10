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
        } else {
          // 无结果时使用 Mock 数据
          this.setMockMessages()
        }
      },
      fail: (err) => {
        console.error('获取历史消息失败:', err)
        // 云函数失败时使用 Mock 数据
        this.setMockMessages()
      }
    })
    
    // 监听新消息
    this.listenForNewMessages()
  },

  // 设置 Mock 消息数据
  setMockMessages() {
    const mockMessages = [
      {
        isSelf: false,
        content: '你好，有什么可以帮你的吗？',
        time: new Date(Date.now() - 3600000).toISOString(),
        formattedTime: this.formatTime(new Date(Date.now() - 3600000).toISOString())
      },
      {
        isSelf: true,
        content: '我想请你帮我取个快递',
        time: new Date(Date.now() - 3500000).toISOString(),
        formattedTime: this.formatTime(new Date(Date.now() - 3500000).toISOString())
      },
      {
        isSelf: false,
        content: '好的，具体在哪里取呢？',
        time: new Date(Date.now() - 3400000).toISOString(),
        formattedTime: this.formatTime(new Date(Date.now() - 3400000).toISOString())
      },
      {
        isSelf: true,
        content: '在菜鸟驿站，大概下午3点可以吗？',
        time: new Date(Date.now() - 3300000).toISOString(),
        formattedTime: this.formatTime(new Date(Date.now() - 3300000).toISOString())
      },
      {
        isSelf: false,
        content: '可以的，到时候联系你',
        time: new Date(Date.now() - 3200000).toISOString(),
        formattedTime: this.formatTime(new Date(Date.now() - 3200000).toISOString())
      }
    ]
    
    this.setData({
      messages: mockMessages
    })
    
    // 滚动到最新消息
    setTimeout(() => {
      this.scrollToBottom()
    }, 100)
  },

  // 监听新消息
  listenForNewMessages() {
    const conversationId = this.data.conversationId || 'default'
    
    // 测试阶段：暂时注释掉云函数调用
    // 实际实现应使用 wx.cloud.database().watch() 或 WebSocket
    console.log('开始监听新消息:', conversationId)
    
    // 示例：使用 setTimeout 模拟接收新消息
    setTimeout(() => {
      const newMessage = {
        isSelf: false,
        content: '这是一条模拟的新消息',
        time: new Date().toISOString(),
        formattedTime: this.formatTime(new Date().toISOString())
      }
      
      const updatedMessages = [...this.data.messages, newMessage]
      this.setData({
        messages: updatedMessages
      })
      
      // 滚动到最新消息
      this.scrollToBottom()
    }, 5000)
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
