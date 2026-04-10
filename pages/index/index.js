// 首页逻辑
Page({
  data: {
    userAvatar: '/static/default-avatar.png',
    currentCampus: '北京大学-校本部',
    searchKeyword: '',
    searchFocused: false,
    unreadCount: 3,
    popularOrders: [],
    latestOrders: [],
    loading: true,
    campusList: ['北京大学-校本部', '清华大学', '人民大学'],
    selectedCampus: 0
  },

  onLoad() {
    this._loadUserInfo()
    this._loadUnreadCount()
    this._loadPopularTasks()
    this._loadLatestPosts()
  },

  onShow() {
    this._loadPopularTasks()
    this._loadLatestPosts()
    this._loadUnreadCount()
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

  _isCloudAvailable() {
    return !!(wx.cloud && typeof wx.cloud.callFunction === 'function')
  },

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

    const mockTasks = [
      {
        _id: '1',
        serviceType: 'campus-errand',
        status: 'pending',
        price: 25,
        title: '二教帮拿大件快递到寝',
        tagText: 'Urgent',
        tagClass: 'urgent',
        locationText: '燕园二教 -> 32号楼',
        timeText: '今天 18:00 前'
      },
      {
        _id: '2',
        serviceType: 'campus-class',
        status: 'pending',
        price: 15,
        title: '代课：近代史纲要 (45min)',
        tagText: 'New',
        tagClass: 'new',
        locationText: '理教 203',
        timeText: '周二 13:00'
      }
    ]

    const done = (tasks) => {
      const formattedTasks = tasks.map((task) => {
        return {
          _id: task._id,
          serviceType: task.serviceType,
          status: task.status,
          price: task.price,
          title: task.title,
          tagText: task.tagText,
          tagClass: task.tagClass || this._getTagClass(task.tagText),
          locationText: task.locationText,
          timeText: task.timeText
        }
      })
      this.setData({ popularOrders: formattedTasks, loading: false })
      if (typeof callback === 'function') {
        callback()
      }
    }

    if (!this._isCloudAvailable()) {
      return done(mockTasks)
    }

    wx.cloud.callFunction({
      name: 'order',
      data: { action: 'getPopularTasks', limit: 10 }
    }).then(function(res) {
      const tasks = (res.result && res.result.length > 0) ? res.result : mockTasks
      const formattedTasks = tasks.map(function(task) {
        return {
          _id: task._id || task.id,
          serviceType: task.serviceType || task.category,
          status: task.status || 'pending',
          price: task.price,
          title: task.title,
          tagText: task.tagText || 'New',
          tagClass: this._getTagClass(task.tagText || 'New'),
          locationText: task.locationText || task.location || '校园内',
          timeText: task.timeText || task.time || '刚刚'
        }
      }.bind(this))
      done(formattedTasks)
    }.bind(this)).catch(function() {
      done(mockTasks)
    })
  },

  _loadLatestPosts(callback) {
    const mockPosts = [
      {
        _id: '3',
        serviceType: 'campus-errand',
        title: '食堂代买五四麻辣烫',
        price: 8,
        location: '五四食堂',
        timeAgo: '2分钟前',
        iconName: 'directions_run',
        color: 'secondary',
        bg: 'secondary'
      },
      {
        _id: '4',
        serviceType: 'express',
        title: '打印资料并送到图书馆',
        price: 12,
        location: '图书馆南门',
        timeAgo: '15分钟前',
        iconName: 'package',
        color: 'tertiary',
        bg: 'tertiary'
      },
      {
        _id: '5',
        serviceType: 'campus-errand',
        title: '帮忙喂一下宿舍楼下的流浪猫',
        price: 5,
        location: '45号楼',
        timeAgo: '40分钟前',
        iconName: 'directions_run',
        color: 'secondary',
        bg: 'secondary'
      }
    ]

    const done = (posts) => {
      this.setData({ latestOrders: posts })
      if (typeof callback === 'function') {
        callback()
      }
    }

    if (!this._isCloudAvailable()) {
      return done(mockPosts)
    }

    wx.cloud.callFunction({
      name: 'order',
      data: { action: 'getLatestPosts', limit: 10 }
    }).then(function(res) {
      const posts = (res.result && res.result.length > 0) ? res.result : mockPosts
      const formattedPosts = posts.map(function(post) {
        const iconInfo = this._getIconByServiceType(post.serviceType || post.category)
        return {
          _id: post._id || post.id,
          serviceType: post.serviceType || post.category || 'campus-errand',
          title: post.title,
          price: post.price,
          location: post.location || '校园内',
          timeAgo: post.timeAgo || post.time || '刚刚',
          iconName: iconInfo.iconName,
          color: iconInfo.color,
          bg: iconInfo.bg
        }
      }.bind(this))
      done(formattedPosts)
    }.bind(this)).catch(function() {
      done(mockPosts)
    })
  },

  _loadUnreadCount() {
    if (!this._isCloudAvailable()) return

    wx.cloud.callFunction({
      name: 'login',
      data: { action: 'getUnreadCount' }
    }).then(function(res) {
      const count = (res.result && res.result.count !== undefined) ? res.result.count : 0
      this.setData({ unreadCount: count })
    }.bind(this)).catch(function() { /* 保持默认值 */ })
  },

  // ── 搜索 ─────────────────────────────────────

  onSearchKeywordChange(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  onSearchFocus() {
    this.setData({ searchFocused: true })
  },

  onSearchBlur() {
    this.setData({ searchFocused: false })
  },

  handleSearch() {
    const keyword = this.data.searchKeyword.trim()
    if (!keyword) {
      return wx.showToast({ title: '请输入搜索内容', icon: 'none' })
    }
    wx.navigateTo({ url: '/pages/popular-tasks/index?keyword=' + encodeURIComponent(keyword) })
  },

  clearSearch() {
    this.setData({ searchKeyword: '' })
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
