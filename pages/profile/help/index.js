// 帮助中心
Page({
  data: {
    helpList: [
      { id: 1, title: '如何发布任务' },
      { id: 2, title: '如何接单' },
      { id: 3, title: '如何支付' },
      { id: 4, title: '如何评价' },
      { id: 5, title: '常见问题' }
    ]
  },

  onLoad(options) {
    console.log('页面加载:', options)
    // 初始化页面
  },

  onShow() {
    console.log('页面显示')
    // 每次显示时执行
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  helpDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/profile/help/detail?id=' + id
    })
  },

  contactService() {
    wx.showActionSheet({
      itemList: ['在线客服', '电话客服'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 在线客服
          wx.navigateTo({
            url: '/pages/chat/index?type=customerService'
          })
        } else if (res.tapIndex === 1) {
          // 电话客服
          wx.makePhoneCall({
            phoneNumber: '400-123-4567',
            success: () => {
              console.log('拨打电话成功')
            },
            fail: (err) => {
              console.error('拨打电话失败:', err)
            }
          })
        }
      }
    })
  }
})
