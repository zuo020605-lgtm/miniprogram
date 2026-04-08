<template>
  <view class="page">
    <view class="section">
      <view class="section-title">个人设置</view>
      <view class="item" @click="editProfile">
        <text class="label">个人信息</text>
        <text class="arrow">＞</text>
      </view>
      <view class="item" @click="changeAvatar">
        <text class="label">更换头像</text>
        <text class="arrow">＞</text>
      </view>
    </view>
    
    <view class="section">
      <view class="section-title">通知设置</view>
      <view class="item">
        <text class="label">消息通知</text>
        <switch :checked="messageNotification" @change="toggleMessage" />
      </view>
      <view class="item">
        <text class="label">系统通知</text>
        <switch :checked="systemNotification" @change="toggleSystem" />
      </view>
    </view>
    
    <view class="section">
      <view class="section-title">隐私设置</view>
      <view class="item">
        <text class="label">公开个人信息</text>
        <switch :checked="publicProfile" @change="togglePublic" />
      </view>
      <view class="item" @click="clearCache">
        <text class="label">清除缓存</text>
        <text class="value">{{cacheSize}}</text>
      </view>
    </view>
    
    <view class="section">
      <view class="section-title">关于</view>
      <view class="item" @click="aboutUs">
        <text class="label">关于我们</text>
        <text class="arrow">＞</text>
      </view>
      <view class="item" @click="checkUpdate">
        <text class="label">检查更新</text>
        <text class="value">v1.0.0</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      messageNotification: true,
      systemNotification: true,
      publicProfile: false,
      cacheSize: '12.3MB'
    };
  },
  methods: {
    editProfile() {
      // 模拟编辑个人信息
      uni.showToast({
        title: '编辑个人信息',
        icon: 'none'
      });
    },
    changeAvatar() {
      // 模拟更换头像
      uni.showToast({
        title: '更换头像',
        icon: 'none'
      });
    },
    clearCache() {
      // 模拟清除缓存
      uni.showModal({
        title: '清除缓存',
        content: '确定要清除缓存吗？',
        success: (res) => {
          if (res.confirm) {
            this.cacheSize = '0MB';
            uni.showToast({
              title: '缓存已清除',
              icon: 'success'
            });
          }
        }
      });
    },
    aboutUs() {
      // 模拟关于我们
      uni.showToast({
        title: '关于我们',
        icon: 'none'
      });
    },
    checkUpdate() {
      // 模拟检查更新
      uni.showToast({
        title: '当前已是最新版本',
        icon: 'success'
      });
    },
    toggleMessage(e) {
      this.messageNotification = e.detail.value;
    },
    toggleSystem(e) {
      this.systemNotification = e.detail.value;
    },
    togglePublic(e) {
      this.publicProfile = e.detail.value;
    }
  }
};
</script>

<style scoped>
.page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 20rpx;
}

.section {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #9a9da0;
  padding: 16rpx 20rpx;
  border-bottom: 1px solid #e5e8ec;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1px solid #e5e8ec;
}

.item:last-child {
  border-bottom: none;
}

.label {
  font-size: 14px;
  color: #2c2f32;
}

.arrow {
  font-size: 16px;
  color: #9a9da0;
}

.value {
  font-size: 14px;
  color: #9a9da0;
}
</style>