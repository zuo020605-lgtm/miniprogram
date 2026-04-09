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
          this.setData({ loading: false })
          wx.showToast({
            title: '获取会话列表失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('获取会话列表失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '获取会话列表失败',
          icon: 'none'
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
