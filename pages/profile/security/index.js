// 账号安全
Page({
  data: {
    // 页面数据
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

  changePassword() {
    wx.navigateTo({
      url: '/pages/profile/auth/index?type=changePassword'
    })
  },

  deleteAccount() {
    wx.showModal({
      title: '注销账号',
      content: '确定要注销账号吗？注销后所有数据将被清除，无法恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '二次确认',
            content: '请再次确认是否要注销账号，此操作不可撤销。',
            success: (secondRes) => {
              if (secondRes.confirm) {
                wx.cloud.callFunction({
                  name: 'deleteAccount',
                  success: (res) => {
                    console.log('注销账号成功:', res)
                    // 清除本地数据
                    wx.clearStorageSync()
                    wx.showToast({
                      title: '账号已注销',
                      icon: 'success'
                    })
                    // 跳转到登录页
                    setTimeout(() => {
                      wx.redirectTo({
                        url: '/pages/login/index'
                      })
                    }, 1500)
                  },
                  fail: (err) => {
                    console.error('注销账号失败:', err)
                    wx.showToast({
                      title: '注销失败',
                      icon: 'none'
                    })
                  }
                })
              }
            }
          })
        }
      }
    })
  }
})
