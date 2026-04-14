Component({
  data: {
    selected: -1,
    color: '#74777a',
    selectedColor: '#005da4',
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconPath: '/static/tab_home.png',
        selectedIconPath: '/static/tab_home_active.png'
      },
      {
        pagePath: '/pages/order/index',
        text: '订单',
        iconPath: '/static/tab_order.png',
        selectedIconPath: '/static/tab_order_active.png'
      },
      {
        pagePath: '/pages/message/index',
        text: '消息',
        iconPath: '/static/tab_message.png',
        selectedIconPath: '/static/tab_message_active.png'
      },
      {
        pagePath: '/pages/profile/index',
        text: '我的',
        iconPath: '/static/tab_profile.png',
        selectedIconPath: '/static/tab_profile_active.png'
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
