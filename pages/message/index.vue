<template>
  <view class="message-page">
    <view class="message-list">
      <view class="message-item" @click="navigateToChat">
        <view class="message-avatar">
          <text class="avatar-text">张</text>
        </view>
        <view class="message-info">
          <view class="message-header">
            <text class="message-name">张三</text>
            <text class="message-time">10:04</text>
          </view>
          <text class="message-preview">15元，可以吗？</text>
        </view>
        <view class="message-badge">1</view>
      </view>
      
      <view class="message-item">
        <view class="message-avatar">
          <text class="avatar-text">李</text>
        </view>
        <view class="message-info">
          <view class="message-header">
            <text class="message-name">李四</text>
            <text class="message-time">昨天</text>
          </view>
          <text class="message-preview">好的，我明天帮你取快递</text>
        </view>
      </view>
      
      <view class="message-item">
        <view class="message-avatar">
          <text class="avatar-text">王</text>
        </view>
        <view class="message-info">
          <view class="message-header">
            <text class="message-name">王五</text>
            <text class="message-time">3天前</text>
          </view>
          <text class="message-preview">考试已经帮你完成了</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      
    };
  },
  methods: {
    navigateToChat() {
      const promise = uni.navigateTo({
        url: '/pages/chat/index?userId=12345678&userName=张三'
      });
      // 处理Promise返回值，避免UnhandledPromiseRejection
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    }
  }
};
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.message-list {
  padding: 16px;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.message-item:active {
  background-color: #f8f9fa;
}

.message-avatar {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: #1E88E5;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.message-info {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c2f32;
}

.message-time {
  font-size: 12px;
  color: #9a9da0;
}

.message-preview {
  font-size: 14px;
  color: #9a9da0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-badge {
  background-color: #ff4757;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}
</style>