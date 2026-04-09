// 我的
Page({
  data: {
    isLoggedIn: true, // 默认已登录状态
    userName: '张三',
    userId: '100001',
    regTime: '2026-01-01',
    isAuth: true,
    todayIncome: '¥0.00',
    completedOrders: 12,
    rating: 100
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.loadUserInfo()
  },

  onShow() {
    console.log('页面显示')
    this.loadUserInfo()
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  // 加载用户信息
  loadUserInfo() {
    // 这里可以从本地存储或API获取用户信息
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.setData({
          userName: userInfo.nickName || '用户',
          userId: userInfo.userId || '100000',
          isAuth: userInfo.isAuth || false
        })
      }
    } catch (e) {
      console.error('获取用户信息失败:', e)
    }
  },

  // 导航到认证页面
  navigateToAuth() {
    wx.navigateTo({ url: '/pages/profile/auth/index' })
  },

  // 导航到钱包页面
  navigateToWallet() {
    wx.navigateTo({ url: '/pages/profile/wallet/index' })
  },

  // 导航到设置页面
  navigateToSettings() {
    wx.navigateTo({ url: '/pages/profile/settings/index' })
  },

  // 导航到帮助中心
  navigateToHelp() {
    wx.navigateTo({ url: '/pages/profile/help/index' })
  },

  // 导航到我的发布
  navigateToMyPosts() {
    wx.navigateTo({ url: '/pages/profile/my-posts/index' })
  },

  // 导航到我的接单
  navigateToMyOrders() {
    wx.navigateTo({ url: '/pages/profile/my-orders/index' })
  },

  // 导航到账号安全
  navigateToAccountSecurity() {
    wx.navigateTo({ url: '/pages/profile/security/index' })
  },

  // 切换账号
  switchAccount() {
    wx.showModal({
      title: '切换账号',
      content: '确定要切换账号吗？',
      success: (res) => {
        if (res.confirm) {
          // 这里可以实现切换账号的逻辑
          wx.showToast({ title: '切换账号功能开发中', icon: 'none' })
        }
      }
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息
          wx.removeStorageSync('userInfo')
          // 跳转到登录页面
          wx.navigateTo({ url: '/pages/login/index' })
        }
      }
    })
  },

  // 导航到登录页面
  navigateToLogin() {
    wx.navigateTo({ url: '/pages/login/index' })
  }
})
