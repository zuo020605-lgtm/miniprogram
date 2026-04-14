// 小程序初始化
const config = require('./config')
App({
  onLaunch(options) {
    console.log('小程序启动', options)
    this.initConfig()
  },

  onShow(options) {
    console.log('小程序显示', options)
  },

  onHide() {
    console.log('小程序隐藏')
  },

  initConfig() {
    // 初始化配置
    this.globalData = {
      userInfo: null,
      hasLogin: false,
      useMock: config.local.useMock,
      baseUrl: config.local.baseUrl,
      serverChecked: false,
      loginRedirect: false // 标记是否需要跳转登录
    }
    console.log('配置初始化完成，使用Mock:', this.globalData.useMock)

    // 启动期同步恢复登录状态，避免首页 onLoad 先于登录恢复而误跳登录页
    this.restoreLoginStatus()

    // 检查服务器是否可用
    this.checkServer()
  },

  // 从本地存储恢复登录状态
  restoreLoginStatus() {
    const storedLogin = wx.getStorageSync('hasLogin')
    const storedUserInfo = wx.getStorageSync('userInfo')
    const storedToken = wx.getStorageSync('token')

    console.log('恢复登录状态 - 本地存储:', {
      hasLogin: storedLogin,
      userInfo: storedUserInfo,
      token: storedToken
    })

    // 检查登录状态是否有效 - 支持字符串 'true' 和布尔值 true
    const isValidLogin = (storedLogin === 'true' || storedLogin === true) &&
      storedUserInfo &&
      storedUserInfo.openid

    if (isValidLogin) {
      this.globalData.userInfo = storedUserInfo
      this.globalData.hasLogin = true
      console.log('从本地存储恢复登录状态成功')
    } else {
      // 如果数据无效，清理本地存储
      if (storedLogin || storedUserInfo || storedToken) {
        console.log('检测到无效的登录数据，清理本地存储')
        wx.removeStorageSync('hasLogin')
        wx.removeStorageSync('userInfo')
        wx.removeStorageSync('token')
        this.globalData.userInfo = null
        this.globalData.hasLogin = false
      }
    }
  },

  // 设置登录状态
  setLoginState(userInfo) {
    this.globalData.userInfo = userInfo
    this.globalData.hasLogin = !!userInfo
    this.globalData.loginRedirect = false
    // 保存到本地存储，防止页面刷新丢失
    if (userInfo) {
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('hasLogin', 'true') // 使用字符串 'true' 避免类型问题
      // 生成并保存token
      const token = 'mock_token_' + Date.now()
      wx.setStorageSync('token', token)
      console.log('保存到本地存储: hasLogin=true, userInfo=', userInfo)
    } else {
      wx.removeStorageSync('userInfo')
      wx.removeStorageSync('hasLogin')
      wx.removeStorageSync('token')
      console.log('从本地存储清除登录状态')
    }
    console.log('登录状态已更新:', {
      hasLogin: this.globalData.hasLogin,
      userInfo: userInfo
    })
  },

  // 检查登录状态（不进行页面跳转）
  checkLoginStatus() {
    console.log('=== 检查登录状态 ===')
    console.log('内存中的 hasLogin:', this.globalData.hasLogin)
    console.log('内存中的 userInfo:', this.globalData.userInfo)

    // 优先检查内存中的状态
    if (this.globalData.hasLogin && this.globalData.userInfo && this.globalData.userInfo.openid) {
      console.log('从内存检测到已登录')
      return true
    }

    // 如果内存中没有，检查本地存储
    const storedLogin = wx.getStorageSync('hasLogin')
    console.log('本地存储的 hasLogin:', storedLogin, '类型:', typeof storedLogin)

    const storedUserInfo = wx.getStorageSync('userInfo')
    console.log('本地存储的 userInfo:', storedUserInfo)

    // 检查存储的登录状态，只接受 'true' 字符串或布尔值 true
    const isValidLogin = (storedLogin === 'true' || storedLogin === true) &&
                         storedUserInfo &&
                         storedUserInfo.openid

    if (isValidLogin) {
      this.globalData.userInfo = storedUserInfo
      this.globalData.hasLogin = true
      console.log('从本地存储恢复登录状态')
      return true
    }

    console.log('检测到未登录')
    return false
  },

  // 调试登录状态
  debugLoginStatus() {
    console.log('=== 调试登录状态 ===')
    console.log('globalData:', this.globalData)
    console.log('本地存储 hasLogin:', wx.getStorageSync('hasLogin'))
    console.log('本地存储 userInfo:', wx.getStorageSync('userInfo'))
  },

  // 检查并处理登录状态（带页面跳转）
  checkAndHandleLogin() {
    console.log('=== checkAndHandleLogin 执行 ===')
    console.log('当前 globalData:', this.globalData)

    // 先尝试从本地存储恢复
    const storedLogin = wx.getStorageSync('hasLogin')
    const storedUserInfo = wx.getStorageSync('userInfo')

    if (storedLogin === 'true' && storedUserInfo && storedUserInfo.openid) {
      // 如果本地存储有有效数据，恢复到内存
      this.globalData.userInfo = storedUserInfo
      this.globalData.hasLogin = true
      console.log('从本地存储恢复登录状态')
    }

    const isLoggedIn = this.checkLoginStatus()
    console.log('isLoggedIn 结果:', isLoggedIn)

    if (!isLoggedIn && !this.globalData.loginRedirect) {
      console.log('检测到未登录，停止当前受限操作')
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return false
    }

    console.log('checkAndHandleLogin 返回 true')
    return true
  },

  // 安全跳转登录页：避免启动期清栈导致页面栈异常
  navigateToLogin(reason) {
    if (this.globalData.loginRedirect) return

    console.log('准备跳转登录页:', reason || '')
    this.globalData.loginRedirect = true

    setTimeout(() => {
      const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
      const currentPage = pages[pages.length - 1]
      if (currentPage && currentPage.route === 'pages/login/index') {
        return
      }

      wx.navigateTo({
        url: '/pages/login/index',
        fail: (err) => {
          console.error('跳转登录页失败:', err)
          this.globalData.loginRedirect = false
        }
      })
    }, 120)
  },

  // 检查服务器状态
  checkServer() {
    if (this.globalData.serverChecked) return

    wx.request({
      url: `${this.globalData.baseUrl}/health`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          console.log('服务器连接正常')
          this.globalData.serverChecked = true
        }
      },
      fail: (err) => {
        console.warn('服务器连接失败，请确保本地服务器正在运行:', err)
        wx.showToast({
          title: '服务器未启动',
          icon: 'none',
          duration: 3000
        })
      }
    })
  },

  // 统一的API请求方法
  request(options) {
    const { url, method = 'GET', data = {}, timeout = 10000 } = options
    const fullUrl = `${this.globalData.baseUrl}${url}`

    // 添加认证token
    const token = wx.getStorageSync('token')
    const header = {}
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    console.log('发起请求:', {
      url: fullUrl,
      method: method,
      data: data,
      timeout: timeout,
      header: header
    })

    return new Promise((resolve, reject) => {
      wx.request({
        url: fullUrl,
        method: method,
        data: data,
        timeout: timeout,
        header: header,
        success: (res) => {
          console.log('请求响应:', res)
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            // token过期，清除登录状态
            this.setLoginState(null)
            wx.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none'
            })
            reject(new Error('登录已过期，请重新登录'))
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`))
          }
        },
        fail: (err) => {
          console.error('请求失败:', err)
          reject(err)
        }
      })
    })
  }
})
