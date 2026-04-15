// 我的
import api from '../../utils/api'

Page({
  data: {
    isLoggedIn: false, // 默认未登录状态
    userName: '未登录',
    userId: '',
    regTime: '',
    isAuth: false,
    avatarUrl: '/static/default-avatar.png',
    isRunner: false,
    runnerVerified: false,
    runnerApplied: false,
    todayIncome: '¥0.00',
    completedOrders: 0,
    rating: 0,
    averageRating: '0.0',
    reviewCount: 0,
    recentReviews: []
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.loadUserInfo()
  },

  onShow() {
    console.log('页面显示')
    this.syncTabBar()
    this.loadUserInfo()
  },

  syncTabBar() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabBar && tabBar.data.selected !== 3) {
      tabBar.setData({ selected: 3 })
    }
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const app = getApp()
      const userInfo = app.globalData.userInfo

      if (userInfo && app.globalData.hasLogin) {
        // 使用全局用户信息
        this.setData({
          isLoggedIn: true,
          userName: userInfo.nickName || '用户',
          userId: userInfo.openid || '100000',
          isAuth: !!userInfo.phone,
          avatarUrl: userInfo.avatarUrl || '/static/default-avatar.png',
          isRunner: !!userInfo.isRunner,
          runnerVerified: !!userInfo.runnerVerified,
          runnerApplied: !!userInfo.runnerAppliedAt
        })
        if (userInfo.runnerVerified) {
          await this.loadRunnerReviewStats(userInfo.openid)
        } else {
          this.setData({
            completedOrders: 0,
            rating: 0,
            averageRating: '0.0',
            reviewCount: 0,
            recentReviews: []
          })
        }
      } else {
        // 未登录
        this.setData({
          isLoggedIn: false,
          userName: '未登录',
          userId: '',
          isAuth: false,
          avatarUrl: '/static/default-avatar.png',
          isRunner: false,
          runnerVerified: false,
          runnerApplied: false,
          completedOrders: 0,
          rating: 0,
          averageRating: '0.0',
          reviewCount: 0,
          recentReviews: []
        })
      }
    } catch (e) {
      console.error('获取用户信息失败:', e)
      this.setData({ isLoggedIn: false })
    }
  },

  async loadRunnerReviewStats(openid) {
    try {
      const stats = await api.getReviewStats({ runnerOpenid: openid })
      const recentReviews = (stats.latestReviews || []).map(review => ({
        ...review,
        ratingText: `${review.rating || 0}星`,
        tagsText: (review.tags || []).join('、'),
        createTimeText: new Date(review.createTime || Date.now()).toLocaleDateString()
      }))

      this.setData({
        completedOrders: stats.completedOrders || 0,
        rating: stats.goodRate || 0,
        averageRating: stats.averageRatingText || '0.0',
        reviewCount: stats.totalReviews || 0,
        recentReviews
      })
    } catch (error) {
      console.error('加载评价统计失败:', error)
      this.setData({
        completedOrders: 0,
        rating: 0,
        averageRating: '0.0',
        reviewCount: 0,
        recentReviews: []
      })
    }
  },

  // 导航到认证页面
  navigateToAuth() {
    wx.navigateTo({ url: '/pages/profile/auth/index' })
  },

  // 导航到接单员认证页面
  navigateToRunnerAuth() {
    wx.navigateTo({ url: '/pages/profile/auth/index?type=runner' })
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
    const app = getApp()
    const globalData = app.globalData || {}
    const userInfo = globalData.userInfo || {}
    const isRunner = !!((globalData.isRunner || userInfo.isRunner) && userInfo.runnerVerified)
    if (!isRunner) {
      wx.showModal({
        title: '权限提示',
        content: '仅通过认证的接单员才可接单',
        showCancel: true,
        cancelText: '我知道了',
        confirmText: '申请认证',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/profile/auth/index?type=runner' })
          }
        }
      })
      return
    }

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
          const app = getApp()
          app.setLoginState(null)
          app.navigateToLogin('profile logout')
        }
      }
    })
  },

  // 导航到登录页面
  navigateToLogin() {
    wx.navigateTo({ url: '/pages/login/index' })
  }
})
