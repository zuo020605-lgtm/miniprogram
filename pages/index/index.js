// 首页逻辑
import api from '../../utils/api'

Page({
  data: {
    userAvatar: '/static/default-avatar.png',
    currentCampus: '北京大学-校本部',
    searchKeyword: '',
    searchFocused: false,
    showSearchHistory: false,
    searchHistory: [],
    unreadCount: 3,
    popularOrders: [],
    latestOrders: [],
    loading: true,
    campusList: ['北京大学-校本部', '清华大学', '人民大学'],
    selectedCampus: 0
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
    this._loadPopularTasks()
    this._loadLatestPosts()
    this.loadSearchHistory()
  },

  onShow() {
    this.syncTabBar()
    // onShow 时只刷新数据，不检查登录状态
    this._loadPopularTasks()
    this._loadLatestPosts()
    this._loadUnreadCount()
  },

  syncTabBar() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabBar && tabBar.data.selected !== 0) {
      tabBar.setData({ selected: 0 })
    }
  },

  onPullDownRefresh() {
    Promise.all([
      new Promise(resolve => this._loadPopularTasks(resolve)),
      new Promise(resolve => this._loadLatestPosts(resolve))
    ]).then(() => {
      wx.stopPullDownRefresh()
    })
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

  _getTagClass(tagText) {
    const tagMap = {
      '紧急': 'urgent',
      'Urgent': 'urgent',
      '新任务': 'new',
      'New': 'new',
      '已完成': 'success',
      '进行中': 'warning'
    }
    return tagMap[tagText] || 'new'
  },

  _getIconByServiceType(serviceType) {
    const iconMap = {
      'campus-errand': { iconName: '🏃', color: 'secondary', bg: 'secondary' },
      'express': { iconName: '📦', color: 'tertiary', bg: 'tertiary' },
      'exam': { iconName: '📝', color: 'primary', bg: 'primary' },
      'campus-class': { iconName: '📚', color: 'secondary', bg: 'secondary' }
    }
    return iconMap[serviceType] || { iconName: '🏫', color: 'primary', bg: 'primary' }
  },

  _loadPopularTasks(callback) {
    this.setData({ loading: true })

    const done = (tasks) => {
      const formattedTasks = tasks.map((task) => {
        return {
          _id: task.id,
          serviceType: 'campus-errand', // 默认服务类型
          status: task.status,
          price: Number(task.price || 0) / 100,
          title: task.title,
          tagText: task.status === 'WAITING_PAYMENT' ? '待支付' : (task.status === 'PENDING' ? 'New' : (task.status === 'PROCESSING' ? '进行中' : '已完成')),
          tagClass: this._getTagClass(task.status === 'WAITING_PAYMENT' ? '待支付' : (task.status === 'PENDING' ? 'New' : (task.status === 'PROCESSING' ? '进行中' : '已完成'))),
          locationText: task.location || '校园内',
          timeText: new Date(task.createTime || task.createdAt).toLocaleString('zh-CN')
        }
      })
      this.setData({ popularOrders: formattedTasks, loading: false })
      if (typeof callback === 'function') {
        callback()
      }
    }

    // 使用真实 API 获取订单数据
    api.request('/api/order/all').then(res => {
      if (res.success && res.data && res.data.list) {
        // 仅展示已支付且待接单的订单，隐藏待支付、进行中、已完成、已取消订单
        const tasks = res.data.list
          .filter(order => this._isPublicVisibleOrder(order))
          .slice(0, 10)
        done(tasks)
      } else {
        done([])
      }
    }).catch(err => {
      console.error('加载热门任务失败:', err)
      done([])
    })
  },

  _loadLatestPosts(callback) {
    const done = (posts) => {
      this.setData({ latestOrders: posts })
      if (typeof callback === 'function') {
        callback()
      }
    }

    // 使用真实 API 获取订单数据
    api.request('/api/order/all').then(res => {
      if (res.success && res.data && res.data.list) {
        // 最新发布同样只展示可接单订单
        const sortedPosts = res.data.list.filter(order => this._isPublicVisibleOrder(order)).sort((a, b) => {
          const timeA = new Date(a.createTime || a.createdAt).getTime()
          const timeB = new Date(b.createTime || b.createdAt).getTime()
          return timeB - timeA
        })

        const formattedPosts = sortedPosts.slice(0, 10).map(post => {
          const iconInfo = this._getIconByServiceType('campus-errand') // 默认服务类型
          return {
            _id: post.id,
            serviceType: 'campus-errand',
            title: post.title,
            price: Number(post.price || 0) / 100,
            location: post.location || '校园内',
            timeAgo: this._getTimeAgo(post.createTime || post.createdAt),
            iconName: iconInfo.iconName,
            color: iconInfo.color,
            bg: iconInfo.bg
          }
        })
        done(formattedPosts)
      } else {
        done([])
      }
    }).catch(err => {
      console.error('加载最新发布失败:', err)
      done([])
    })
  },

  _isPublicVisibleOrder(order) {
    return order &&
      order.status === 'PENDING' &&
      order.paymentStatus === 'PAID'
  },

  // 计算时间差
  _getTimeAgo(timestamp) {
    const now = new Date().getTime()
    const postTime = new Date(timestamp).getTime()
    const diff = now - postTime

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) {
      return '刚刚'
    } else if (minutes < 60) {
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else {
      return `${days}天前`
    }
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
    wx.navigateTo({ url: '/pages/popular-tasks/index?keyword=' + encodeURIComponent(keyword) })
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

  navigateToPopularTasks() {
    wx.navigateTo({ url: '/pages/popular-tasks/index' })
  },

  navigateToOrderDetail(e) {
    const id = e.currentTarget.dataset.id
    const status = e.currentTarget.dataset.status || 'pending'
    const serviceType = e.currentTarget.dataset.serviceType || 'campus-errand'
    wx.navigateTo({ url: '/pages/order-detail/index?id=' + id + '&status=' + status + '&serviceType=' + serviceType })
  }
})
