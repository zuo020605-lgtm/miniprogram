<template>
  <view class="success-page">
    <view class="success-content">
      <view class="success-icon">
        <text class="icon">✅</text>
      </view>
      <text class="success-title">发布成功</text>
      <text class="success-subtitle">您的任务已成功发布，正在等待接单</text>
      
      <view class="countdown-section">
        <text class="countdown-label">等待时间</text>
        <text class="countdown-time">{{ countdown }}</text>
      </view>
      
      <view class="tips-section">
        <text class="tips-text">⏰ 倒计时结束前有人接单，将跳转到支付页面</text>
        <text class="tips-text">💡 任务发布后可在"我的发布"中查看</text>
      </view>
      
      <!-- 模拟有人接单，显示支付按钮 -->
      <view v-if="showPayButton" class="pay-button-section">
        <text class="pay-button-label">有人接单了！</text>
        <button class="pay-button" @click="navigateToPayment">去支付</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      countdown: '05:00',
      seconds: 300, // 5分钟倒计时
      showPayButton: false
    };
  },
  mounted() {
    this.startCountdown();
    // 模拟有人接单的情况，3秒后显示支付按钮
    setTimeout(() => {
      this.showPayButton = true;
    }, 3000);
  },
  methods: {
    startCountdown() {
      const timer = setInterval(() => {
        this.seconds--;
        if (this.seconds <= 0) {
          clearInterval(timer);
          this.countdown = '00:00';
          // 倒计时结束，跳转到首页或其他页面
          wx.switchTab({
            url: '/pages/index/index',
            success: function(res) {
              console.log('跳转成功', res);
            },
            fail: function(err) {
              console.log('跳转失败', err);
            }
          });
        } else {
          const minutes = Math.floor(this.seconds / 60);
          const secs = this.seconds % 60;
          this.countdown = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
      }, 1000);
    },
    navigateToPayment() {
      const promise = wx.navigateTo({
        url: '/pages/payment/index',
        success: function(res) {
          console.log('跳转成功', res);
        },
        fail: function(err) {
          console.log('跳转失败', err);
        }
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
.success-page {
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

.countdown-section {
  margin-bottom: 32px;
}

.countdown-label {
  display: block;
  font-size: 14px;
  color: #9a9da0;
  margin-bottom: 8px;
}

.countdown-time {
  font-size: 48px;
  font-weight: 800;
  color: #1E88E5;
  font-family: 'Plus Jakarta Sans', sans-serif;
  letter-spacing: 2px;
}

.tips-section {
  border-top: 1px solid #e5e8ec;
  padding-top: 24px;
  text-align: left;
}

.tips-text {
  display: block;
  font-size: 12px;
  color: #9a9da0;
  margin-bottom: 8px;
  line-height: 1.4;
}

.pay-button-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e8ec;
  text-align: center;
}

.pay-button-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2c2f32;
  margin-bottom: 16px;
}

.pay-button {
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

.pay-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(30, 136, 229, 0.3);
}
</style>