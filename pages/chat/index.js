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
    // 模拟历史消息数据
    const mockMessages = [
      {
        isSelf: false,
        content: '你好，我来取快递',
        time: new Date(Date.now() - 3600000).toISOString()
      },
      {
        isSelf: true,
        content: '好的，请问您是哪位？',
        time: new Date(Date.now() - 3540000).toISOString()
      },
      {
        isSelf: false,
        content: '我是订单号ORD20260408001的用户',
        time: new Date(Date.now() - 3480000).toISOString()
      },
      {
        isSelf: true,
        content: '好的，我现在在菜鸟驿站，您的快递已经取到了',
        time: new Date(Date.now() - 3420000).toISOString()
      },
      {
        isSelf: false,
        content: '谢谢，麻烦您送到南区宿舍楼下，我在那里等您',
        time: new Date(Date.now() - 3360000).toISOString()
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
      time: new Date().toISOString()
    }
    
    const updatedMessages = [...this.data.messages, newMessage]
    
    this.setData({
      messages: updatedMessages,
      inputText: ''
    })
    
    // 滚动到最新消息
    this.scrollToBottom()
    
    // 模拟对方回复
    setTimeout(() => {
      const replyMessage = {
        isSelf: false,
        content: '好的，我知道了',
        time: new Date().toISOString()
      }
      
      this.setData({
        messages: [...updatedMessages, replyMessage]
      })
      
      // 滚动到最新消息
      this.scrollToBottom()
    }, 1000)
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
