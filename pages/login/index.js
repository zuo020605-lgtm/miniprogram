// 登录
Page({
  data: {
    phone: '',
    code: '',
    countdown: 0,
    timer: null,
    sendingCode: false
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
    this.clearTimer()
  },

  onUnload() {
    console.log('页面卸载')
    this.clearTimer()
  },

  clearTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
      this.setData({ timer: null })
    }
  },

  getVerificationCode() {
    const { phone, countdown, sendingCode } = this.data
    if (countdown > 0 || sendingCode) return
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    this.setData({ sendingCode: true })
    wx.cloud.callFunction({
      name: 'login',
      data: {
        action: 'sendCode',
        phone: phone
      },
      success: (res) => {
        console.log('发送验证码成功:', res)
        wx.showToast({
          title: '验证码已发送',
          icon: 'success'
        })
        this.setData({ countdown: 60 })
        this.data.timer = setInterval(() => {
          this.setData({
            countdown: this.data.countdown - 1
          })
          if (this.data.countdown <= 0) {
            this.clearTimer()
          }
        }, 1000)
      },
      fail: (err) => {
        console.error('发送验证码失败:', err)
        wx.showToast({
          title: '发送验证码失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ sendingCode: false })
      }
    })
  },

  loginByPhone() {
    const { phone, code } = this.data
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    if (!code || code.length !== 6) {
      wx.showToast({
        title: '请输入正确的验证码',
        icon: 'none'
      })
      return
    }
    wx.cloud.callFunction({
      name: 'login',
      data: {
        action: 'loginByPhone',
        phone: phone,
        code: code
      },
      success: (res) => {
        console.log('手机号登录成功:', res)
        if (res.result && res.result.token) {
          wx.setStorageSync('token', res.result.token)
          wx.setStorageSync('userInfo', res.result.userInfo)
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
          wx.switchTab({
            url: '/pages/index/index'
          })
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('手机号登录失败:', err)
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    })
  },

  loginByWechat() {
    wx.login({
      success: (loginRes) => {
        wx.getUserProfile({
          desc: '用于登录',
          success: (userProfile) => {
            wx.cloud.callFunction({
              name: 'login',
              data: {
                action: 'loginByWechat',
                code: loginRes.code,
                userInfo: userProfile.userInfo
              },
              success: (res) => {
                console.log('微信登录成功:', res)
                if (res.result && res.result.token) {
                  wx.setStorageSync('token', res.result.token)
                  wx.setStorageSync('userInfo', res.result.userInfo)
                  wx.showToast({
                    title: '登录成功',
                    icon: 'success'
                  })
                  wx.switchTab({
                    url: '/pages/index/index'
                  })
                } else {
                  wx.showToast({
                    title: '登录失败',
                    icon: 'none'
                  })
                }
              },
              fail: (err) => {
                console.error('微信登录失败:', err)
                wx.showToast({
                  title: '登录失败',
                  icon: 'none'
                })
              }
            })
          },
          fail: (err) => {
            console.error('获取用户信息失败:', err)
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            })
          }
        })
      },
      fail: (err) => {
        console.error('微信登录失败:', err)
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    })
  }
})
