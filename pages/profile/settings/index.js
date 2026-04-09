// 系统设置
Page({
  data: {
    cacheSize: '0KB'
  },

  onLoad(options) {
    console.log('页面加载:', options)
    this.getCacheSize()
  },

  onShow() {
    console.log('页面显示')
    this.getCacheSize()
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  getCacheSize() {
    wx.getStorageInfo({
      success: (res) => {
        let size = res.totalSize
        let cacheSize = ''
        if (size < 1024) {
          cacheSize = size + 'B'
        } else if (size < 1024 * 1024) {
          cacheSize = (size / 1024).toFixed(2) + 'KB'
        } else {
          cacheSize = (size / (1024 * 1024)).toFixed(2) + 'MB'
        }
        this.setData({ cacheSize: cacheSize })
      },
      fail: (err) => {
        console.error('获取缓存大小失败:', err)
      }
    })
  },

  editProfile() {
    wx.navigateTo({
      url: '/pages/profile/auth/index'
    })
  },

  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        wx.cloud.uploadFile({
          cloudPath: 'avatars/' + Date.now() + '.jpg',
          filePath: tempFilePaths[0],
          success: (uploadRes) => {
            console.log('上传头像成功:', uploadRes)
            wx.cloud.callFunction({
              name: 'updateAvatar',
              data: {
                avatarUrl: uploadRes.fileID
              },
              success: (updateRes) => {
                console.log('更新头像成功:', updateRes)
                wx.showToast({
                  title: '更换头像成功',
                  icon: 'success'
                })
                // 更新本地存储的用户信息
                const userInfo = wx.getStorageSync('userInfo')
                if (userInfo) {
                  userInfo.avatarUrl = uploadRes.fileID
                  wx.setStorageSync('userInfo', userInfo)
                }
              },
              fail: (err) => {
                console.error('更新头像失败:', err)
                wx.showToast({
                  title: '更换头像失败',
                  icon: 'none'
                })
              }
            })
          },
          fail: (err) => {
            console.error('上传头像失败:', err)
            wx.showToast({
              title: '更换头像失败',
              icon: 'none'
            })
          }
        })
      },
      fail: (err) => {
        console.error('选择图片失败:', err)
      }
    })
  },

  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          this.setData({ cacheSize: '0KB' })
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        }
      }
    })
  },

  checkUpdate() {
    wx.getUpdateManager().onCheckForUpdate(function(res) {
      if (res.hasUpdate) {
        wx.showModal({
          title: '更新提示',
          content: '发现新版本，是否立即更新？',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.getUpdateManager().onUpdateReady(function() {
                wx.showModal({
                  title: '更新完成',
                  content: '新版本已下载完成，请重启应用',
                  success: (readyRes) => {
                    if (readyRes.confirm) {
                      wx.getUpdateManager().applyUpdate()
                    }
                  }
                })
              })
              wx.getUpdateManager().onUpdateFailed(function() {
                wx.showToast({
                  title: '更新失败',
                  icon: 'none'
                })
              })
            }
          }
        })
      } else {
        wx.showToast({
          title: '当前已是最新版本',
          icon: 'success'
        })
      }
    })
    wx.getUpdateManager().checkForUpdate()
  }
})
