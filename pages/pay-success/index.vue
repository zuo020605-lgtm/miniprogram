<template>
  <view class="pay-success-page">
    <view class="success-content">
      <view class="success-icon">
        <text class="icon">✅</text>
      </view>
      <text class="success-title">支付成功</text>
      <text class="success-subtitle">您的任务已支付成功，等待服务完成</text>
      
      <view class="order-info">
        <view class="order-item">
          <text class="order-label">订单编号</text>
          <text class="order-value">2026032012345678</text>
        </view>
        <view class="order-item">
          <text class="order-label">支付金额</text>
          <text class="order-value">¥27.00</text>
        </view>
        <view class="order-item">
          <text class="order-label">支付方式</text>
          <text class="order-value">微信支付</text>
        </view>
        <view class="order-item">
          <text class="order-label">支付时间</text>
          <text class="order-value">2026-03-20 12:30:45</text>
        </view>
      </view>
      
      <view class="btn-group">
        <button class="order-detail-btn" @click="navigateToOrderDetail">查看订单详情</button>
        <button class="home-btn" @click="navigateToHome">返回首页</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    navigateToOrderDetail() {
      const promise = uni.navigateTo({
        url: '/pages/order-detail/index'
      });
      // 处理Promise返回值，避免UnhandledPromiseRejection
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    },
    navigateToHome() {
      const promise = uni.switchTab({
        url: '/pages/index/index'
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
.pay-success-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.success-content {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: #e8f5e8;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 24px;
}

.icon {
  font-size: 40px;
}

.success-title {
  font-size: 24px;
  font-weight: 800;
  color: #2c2f32;
  margin-bottom: 12px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.success-subtitle {
  font-size: 14px;
  color: #9a9da0;
  margin-bottom: 32px;
  line-height: 1.5;
}

.order-info {
  background-color: #f8f9fa;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: left;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-label {
  font-size: 14px;
  color: #9a9da0;
}

.order-value {
  font-size: 14px;
  color: #2c2f32;
  font-weight: 600;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-detail-btn {
  width: 100%;
  padding: 16px;
  background-color: #1E88E5;
  color: #ffffff;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
  transition: all 0.3s ease;
}

.order-detail-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(30, 136, 229, 0.3);
}

.home-btn {
  width: 100%;
  padding: 16px;
  background-color: #ffffff;
  color: #1E88E5;
  border: 2px solid #1E88E5;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.home-btn:active {
  background-color: rgba(30, 136, 229, 0.05);
}
</style>