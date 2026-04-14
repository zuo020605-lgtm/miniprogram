import api from '../../utils/api.js'

const app = getApp()

Page({
  data: {
    loading: false,
    loginError: '',
    userInfo: null,
    hasUserInfo: false,
    isLoggingIn: false,
    loginAttempts: 0,
    debugInfo: '',
    showDebugButtons: true
  },

  onLoad() {
    // 检查是否已登录
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    }
  },

  // 处理微信登录
  async handleLogin() {
    // 防止重复点击
    if (this.data.isLoggingIn) return

    // 限制重试次数，避免无限循环
    if (this.data.loginAttempts >= 3) {
      wx.showModal({
        title: '登录失败',
        content: '登录失败次数过多，请检查服务器是否正常运行',
        showCancel: false
      })
      return
    }

    this.setData({
      loading: true,
      loginError: '',
      isLoggingIn: true,
      loginAttempts: this.data.loginAttempts + 1
    })

    // 检查服务器状态
    const app = getApp()
    if (!app.globalData.serverChecked) {
      this.setData({
        loading: false,
        loginError: '服务器未启动，请先运行 start-server.bat',
        isLoggingIn: false
      })
      return
    }

    try {
      // 获取微信登录code
      console.log('开始获取微信登录code...')
      const loginResult = await wx.login()
      console.log('微信登录code:', loginResult.code)

      if (loginResult.code) {
        // 调用登录接口
        console.log('调用登录接口...')
        const authResult = await api.login(loginResult.code)

        console.log('登录响应:', authResult)

        if (authResult) {
          // 获取用户信息
          console.log('获取用户信息...')
          const userInfoResult = await api.getUserInfo(authResult.openid)

          console.log('用户信息响应:', userInfoResult)

          if (userInfoResult.success) {
            // 先更新本地状态
            this.setData({
              userInfo: userInfoResult.data,
              hasUserInfo: true
            })

            // 再更新全局状态
            console.log('开始设置全局登录状态...')
            app.setLoginState(userInfoResult)
            console.log('全局状态设置完成，hasLogin:', app.globalData.hasLogin)

            // 延迟一下再跳转，确保状态已设置
            setTimeout(() => {
              console.log('准备跳转首页...')
              wx.switchTab({
                url: '/pages/index/index',
                success: () => {
                  console.log('跳转首页成功')
                },
                fail: (err) => {
                  console.error('跳转首页失败:', err)
                }
              })
            }, 200) // 增加延迟时间
          } else {
            throw new Error(userInfoResult.message || '获取用户信息失败')
          }
        } else {
          throw new Error(authResult.message || '登录失败')
        }
      } else {
        throw new Error('获取登录code失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      let errorMessage = '登录失败，请重试'

      // 更详细的错误提示
      if (error.errMsg && error.errMsg.includes('fail')) {
        if (error.errMsg.includes('request:fail')) {
          errorMessage = '网络连接失败，请检查服务器是否启动'
        } else if (error.errMsg.includes('timeout')) {
          errorMessage = '请求超时，请检查网络后重试'
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      this.setData({
        loginError: errorMessage
      })

      // 如果是网络错误，提示用户检查服务器
      if (error.errMsg && error.errMsg.includes('request:fail')) {
        errorMessage = '无法连接到服务器，请确保 start-server.bat 已运行'
      }
    } finally {
      this.setData({
        loading: false,
        isLoggingIn: false
      })
    }
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          app.globalData.userInfo = null
          app.globalData.hasLogin = false

          this.setData({
            userInfo: null,
            hasUserInfo: false,
            loginError: ''
          })
        }
      }
    })
  },

  // 调试登录状态
  debugStatus() {
    const app = getApp()
    app.debugLoginStatus()

    let debugText = '当前状态:\n'
    debugText += `内存 hasLogin: ${app.globalData.hasLogin}\n`
    debugText += `内存 userInfo: ${JSON.stringify(app.globalData.userInfo)}\n`
    debugText += `本地存储 hasLogin: ${wx.getStorageSync('hasLogin')}\n`
    debugText += `本地存储 userInfo: ${JSON.stringify(wx.getStorageSync('userInfo'))}`

    this.setData({
      debugInfo: debugText
    })
  },

  // 清除存储
  clearStorage() {
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('hasLogin')
    const app = getApp()
    app.globalData.userInfo = null
    app.globalData.hasLogin = false

    this.setData({
      debugInfo: '存储已清除',
      userInfo: null,
      hasUserInfo: false
    })

    wx.showToast({
      title: '存储已清除',
      icon: 'success'
    })
  },

  // 页面显示时更新调试信息
  onShow() {
    this.updateDebugInfo()
  },

  // 更新调试信息
  updateDebugInfo() {
    const app = getApp()
    let debugText = '当前状态:\n'
    debugText += `内存 hasLogin: ${app.globalData.hasLogin}\n`
    debugText += `内存 userInfo: ${JSON.stringify(app.globalData.userInfo)}\n`
    debugText += `本地存储 hasLogin: ${wx.getStorageSync('hasLogin')}\n`
    debugText += `本地存储 userInfo: ${JSON.stringify(wx.getStorageSync('userInfo'))}`

    this.setData({
      debugInfo: debugText
    })
  }
})
