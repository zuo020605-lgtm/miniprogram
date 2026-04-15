import api from '../utils/api'

Component({
  data: {
    selected: -1,
    unreadCount: 0,
    color: '#7b8794',
    selectedColor: '#0a84ff',
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconClass: 'icon-home'
      },
      {
        pagePath: '/pages/order/index',
        text: '订单',
        iconClass: 'icon-order'
      },
      {
        pagePath: '/pages/message/index',
        text: '消息',
        iconClass: 'icon-message'
      },
      {
        pagePath: '/pages/profile/index',
        text: '我的',
        iconClass: 'icon-profile'
      }
    ]
  },

  lifetimes: {
    attached() {
      this.updateSelected()
    }
  },

  pageLifetimes: {
    show() {
      this.updateSelected()
    }
  },

  methods: {
    updateSelected() {
      const pages = getCurrentPages()
      const current = pages[pages.length - 1]
      if (!current) return

      const route = `/${current.route}`
      const selected = this.data.list.findIndex(item => item.pagePath === route)
      if (selected >= 0 && selected !== this.data.selected) {
        this.setData({ selected })
      }
      this.refreshUnreadCount()
    },

    async refreshUnreadCount() {
      try {
        const app = getApp()
        const globalData = app.globalData || {}
        const userInfo = globalData.userInfo || {}
        if (!globalData.hasLogin || !userInfo.openid) {
          this.setData({ unreadCount: 0 })
          return
        }

        const result = await api.getUnreadCount(userInfo.openid)
        this.setData({ unreadCount: result.count || 0 })
      } catch (error) {
        console.warn('刷新未读数失败:', error.message)
      }
    },

    switchTab(e) {
      const { path } = e.currentTarget.dataset
      if (!path) return

      const pages = getCurrentPages()
      const current = pages[pages.length - 1]
      if (current && `/${current.route}` === path) return

      wx.switchTab({ url: path })
    }
  }
})
