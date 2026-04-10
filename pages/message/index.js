// 消息
Page({
  data: {
    conversations: [],
    loading: false
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.loadConversations()
  },

  onShow() {
    console.log('页面显示')
    this.loadConversations()
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  // 加载会话列表
  loadConversations() {
    this.setData({ loading: true })
    wx.cloud.callFunction({
      name: 'getConversations',
      success: (res) => {
        console.log('获取会话列表成功:', res)
        if (res.result) {
          this.setData({
            conversations: res.result,
            loading: false
          })
        } else {
          // Mock 数据降级
          const mockConversations = [
            {
              id: '1',
              name: '张三',
              lastMessage: '15元，可以吗？',
              lastMessageTime: '10:04',
              unreadCount: 1
            },
            {
              id: '2',
              name: '李四',
              lastMessage: '好的，我明天帮你取快递',
              lastMessageTime: '昨天',
              unreadCount: 0
            },
            {
              id: '3',
              name: '王五',
              lastMessage: '考试已经帮你完成了',
              lastMessageTime: '3天前',
              unreadCount: 0
            }
          ]
          this.setData({
            conversations: mockConversations,
            loading: false
          })
        }
      },
      fail: (err) => {
        console.error('获取会话列表失败:', err)
        // Mock 数据降级
        const mockConversations = [
          {
            id: '1',
            name: '张三',
            lastMessage: '15元，可以吗？',
            lastMessageTime: '10:04',
            unreadCount: 1
          },
          {
            id: '2',
            name: '李四',
            lastMessage: '好的，我明天帮你取快递',
            lastMessageTime: '昨天',
            unreadCount: 0
          },
          {
            id: '3',
            name: '王五',
            lastMessage: '考试已经帮你完成了',
            lastMessageTime: '3天前',
            unreadCount: 0
          }
        ]
        this.setData({
          conversations: mockConversations,
          loading: false
        })
      }
    })
  },

  // 导航到聊天页面
  navigateToChat(e) {
    const conversation = e.currentTarget.dataset.conversation
    wx.navigateTo({
      url: `/pages/chat/index?id=${conversation.id}&name=${conversation.name}`
    })
  }
})
