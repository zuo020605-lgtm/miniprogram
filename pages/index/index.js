Page({
  data: {
    userAvatar: '/static/default-avatar.png',
    currentCampus: '北京大学-校本部',
    searchKeyword: '',
    searchFocused: false,
    showSearchHistory: false,
    searchHistory: [],
    unreadCount: 3,
    campusList: ['北京大学-校本部', '清华大学', '人民大学'],
    selectedCampus: 0,
    featureImageVisible: true,
    featureImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=480&q=60'
  },

  onLoad() {
    // 使用全局登录状态管理
    const app = getApp()

    // 调试：打印当前登录状态
    app.debugLoginStatus()

    // 先检查登录状态，避免异步问题
    const isLoggedIn = app.checkLoginStatus()
    console.log('首页检查登录结果:', isLoggedIn)

    if (!isLoggedIn) {
      console.log('首页检测到未登录，仅加载可浏览内容')
    } else {
      console.log('首页检测到已登录，正常加载')
    }

    this._loadUserInfo()
    this._loadUnreadCount()
    this.loadSearchHistory()
  },

  onShow() {
    this.syncTabBar()
    // onShow 时只刷新数据，不检查登录状态
    this._loadUnreadCount()
  },

  syncTabBar() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabBar && tabBar.data.selected !== 0) {
      tabBar.setData({ selected: 0 })
    }
  },

  onPullDownRefresh() {
    this._loadUserInfo()
    this._loadUnreadCount()
    wx.stopPullDownRefresh()
  },

  // ── 私有方法 ─────────────────────────────────

  _loadUserInfo() {
    try {
      const app = getApp() || {}
      const globalData = app.globalData || {}
      if (globalData.userInfo && globalData.userInfo.avatar) {
        this.setData({ userAvatar: globalData.userInfo.avatar })
      }
    } catch (e) { /* 静默处理 */ }
  },

  _loadUnreadCount() {
    // 暂时设置为 0，需要实现消息功能
    this.setData({ unreadCount: 0 })
  },

  // ── 搜索 ─────────────────────────────────────

  onSearchKeywordChange(e) {
    this.setData({
      searchKeyword: e.detail.value,
      showSearchHistory: this.data.searchFocused && this.data.searchHistory.length > 0
    })
  },

  onSearchFocus() {
    if (this.searchBlurTimer) {
      clearTimeout(this.searchBlurTimer)
      this.searchBlurTimer = null
    }
    this.setData({
      searchFocused: true,
      showSearchHistory: this.data.searchHistory.length > 0
    })
  },

  onSearchBlur() {
    this.searchBlurTimer = setTimeout(() => {
      this.setData({
        searchFocused: false,
        showSearchHistory: false
      })
    }, 160)
  },

  handleSearch(keywordValue) {
    const keyword = typeof keywordValue === 'string'
      ? keywordValue.trim()
      : this.data.searchKeyword.trim()
    if (!keyword) {
      return wx.showToast({ title: '请输入搜索内容', icon: 'none' })
    }
    this.saveSearchHistory(keyword)
    this.setData({
      searchKeyword: keyword,
      showSearchHistory: false
    })
    wx.showToast({ title: '已记录搜索关键词', icon: 'none' })
  },

  clearSearch() {
    this.setData({ searchKeyword: '' })
  },

  loadSearchHistory() {
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ searchHistory: Array.isArray(history) ? history.slice(0, 10) : [] })
  },

  saveSearchHistory(keyword) {
    const history = [keyword]
      .concat(this.data.searchHistory.filter(item => item !== keyword))
      .slice(0, 10)
    wx.setStorageSync('searchHistory', history)
    this.setData({ searchHistory: history })
  },

  selectSearchHistory(e) {
    const { keyword } = e.currentTarget.dataset
    if (!keyword) return
    if (this.searchBlurTimer) {
      clearTimeout(this.searchBlurTimer)
      this.searchBlurTimer = null
    }
    this.handleSearch(keyword)
  },

  clearSearchHistory() {
    wx.removeStorageSync('searchHistory')
    this.setData({
      searchHistory: [],
      showSearchHistory: false
    })
  },

  // ── 导航 ─────────────────────────────────────

  showCampusPicker() {
    wx.showActionSheet({
      itemList: this.data.campusList,
      success: function(res) {
        this.setData({
          selectedCampus: res.tapIndex,
          currentCampus: this.data.campusList[res.tapIndex]
        })
      }.bind(this)
    })
  },

  navigateToMessage() {
    wx.switchTab({ url: '/pages/message/index' })
  },

  navigateToOrder() {
    wx.switchTab({ url: '/pages/order/index' })
  },

  navigateToProfile() {
    wx.switchTab({ url: '/pages/profile/index' })
  },

  navigateToCampusClass() {
    wx.navigateTo({ url: '/pages/campus-class/index' })
  },

  navigateToPublish(e) {
    const type = e.currentTarget.dataset.type
    const url = type ? '/pages/publish/index?type=' + type : '/pages/publish/index'
    wx.navigateTo({ url: url })
  },

  onFeatureImageError() {
    this.setData({ featureImageVisible: false })
  }
})
