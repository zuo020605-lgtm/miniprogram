// 地图选点页面
Page({
  data: {
    longitude: 113.3249, // 默认经度（广州）
    latitude: 23.1065,   // 默认纬度（广州）
    selectedLocation: null,
    searchKeyword: '',
    searchResults: [],
    type: '', // 选点类型：pickup 或 delivery
    originalLocation: null // 原始地点信息
  },

  onLoad(options) {
    console.log('地图选点页面加载:', options)
    // 获取传入的类型参数
    if (options.type) {
      this.setData({ type: options.type })
    }
    
    // 获取传入的原始地点信息
    if (options.location) {
      try {
        const location = JSON.parse(decodeURIComponent(options.location))
        this.setData({ originalLocation: location })
        if (location.longitude && location.latitude) {
          this.setData({
            longitude: location.longitude,
            latitude: location.latitude,
            selectedLocation: location
          })
        }
      } catch (e) {
        console.error('解析原始地点信息失败:', e)
      }
    }
    
    // 获取当前位置
    this.getCurrentLocation()
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        console.log('获取当前位置成功:', res)
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      },
      fail: (err) => {
        console.error('获取当前位置失败:', err)
        // 显示错误信息，但仍然使用默认位置
        wx.showToast({
          title: '获取位置失败，使用默认位置',
          icon: 'none'
        })
      }
    })
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  // 搜索地点
  onSearch() {
    const { searchKeyword } = this.data
    if (!searchKeyword) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({ title: '搜索中...' })
    
    // 模拟搜索结果
    setTimeout(() => {
      wx.hideLoading()
      // 模拟搜索结果
      const mockResults = [
        {
          id: 1,
          name: '广州大学',
          address: '广东省广州市番禺区大学城外环西路230号',
          longitude: 113.3862,
          latitude: 23.0452
        },
        {
          id: 2,
          name: '华南理工大学',
          address: '广东省广州市天河区五山路381号',
          longitude: 113.3657,
          latitude: 23.1461
        },
        {
          id: 3,
          name: '中山大学',
          address: '广东省广州市海珠区新港西路135号',
          longitude: 113.3363,
          latitude: 23.0947
        }
      ]
      
      this.setData({ searchResults: mockResults })
    }, 1000)
  },

  // 选择搜索结果
  onSelectResult(e) {
    const { index } = e.currentTarget.dataset
    const result = this.data.searchResults[index]
    
    this.setData({
      selectedLocation: result,
      longitude: result.longitude,
      latitude: result.latitude,
      searchResults: []
    })
  },

  // 地图区域变化
  onRegionChange(e) {
    if (e.type === 'end' && e.causedBy === 'drag') {
      // 获取地图中心点位置
      const mapCtx = wx.createMapContext('map')
      mapCtx.getCenterLocation({ 
        success: (res) => {
          console.log('地图中心点位置:', res)
          // 只更新地图位置，不更新selectedLocation
          this.setData({
            longitude: res.longitude,
            latitude: res.latitude
          })
        },
        fail: (err) => {
          console.error('获取地图中心点失败:', err)
        }
      })
    }
  },

  // 点击标记
  onMarkerTap(e) {
    console.log('点击标记:', e)
  },

  // 点击地图
  onMapTap() {
    // 获取地图中心点位置
    const mapCtx = wx.createMapContext('map')
    mapCtx.getCenterLocation({ 
      success: (res) => {
        console.log('地图中心点位置:', res)
        // 尝试通过逆地理编码获取地点名称
        wx.request({
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${res.latitude},${res.longitude}&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77`,
          success: (geoRes) => {
            console.log('逆地理编码结果:', geoRes)
            let locationName = '地图选点'
            let locationAddress = '当前地图中心点'
            
            if (geoRes.data && geoRes.data.result) {
              locationName = geoRes.data.result.address_component.street || geoRes.data.result.address_component.district || '地图选点'
              locationAddress = geoRes.data.result.address || '当前地图中心点'
            }
            
            // 更新选中位置
            this.setData({
              selectedLocation: {
                name: locationName,
                address: locationAddress,
                longitude: res.longitude,
                latitude: res.latitude
              }
            })
            // 显示提示信息
            wx.showToast({
              title: '已选择当前位置',
              icon: 'success',
              duration: 1000
            })
          },
          fail: (geoErr) => {
            console.error('逆地理编码失败:', geoErr)
            // 失败时使用默认值
            this.setData({
              selectedLocation: {
                name: '地图选点',
                address: '当前地图中心点',
                longitude: res.longitude,
                latitude: res.latitude
              }
            })
            // 显示提示信息
            wx.showToast({
              title: '已选择当前位置',
              icon: 'success',
              duration: 1000
            })
          }
        })
      },
      fail: (err) => {
        console.error('获取地图中心点失败:', err)
      }
    })
  },

  // 取消
  onCancel() {
    wx.navigateBack()
  },

  // 确认选点
  onConfirm() {
    const { selectedLocation, type } = this.data
    if (!selectedLocation) {
      wx.showToast({
        title: '请先选择地点',
        icon: 'none'
      })
      return
    }
    
    // 返回选点结果
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      if (type === 'pickup') {
        prevPage.setData({
          pickupLocation: selectedLocation.address || selectedLocation.name,
          pickupLocationLatitude: selectedLocation.latitude,
          pickupLocationLongitude: selectedLocation.longitude
        })
      } else if (type === 'delivery') {
        prevPage.setData({
          deliveryLocation: selectedLocation.address || selectedLocation.name,
          deliveryLocationLatitude: selectedLocation.latitude,
          deliveryLocationLongitude: selectedLocation.longitude
        })
      } else if (type === 'exam') {
        prevPage.setData({
          examLocation: selectedLocation.address || selectedLocation.name
        })
      }
      prevPage.checkCanPublish()
    }
    
    wx.navigateBack()
  }
})