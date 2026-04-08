<template>
  <view class="payment-page">
    <view class="payment-content">
      <text class="payment-title">选择支付方式</text>
      
      <view class="payment-methods">
        <view class="payment-item" :class="{ active: selectedPayment === 'wechat' }" @click="selectedPayment = 'wechat'">
          <view class="payment-icon payment-icon-wechat">
            <text class="icon">💳</text>
          </view>
          <view class="payment-info">
            <text class="payment-name">微信支付</text>
            <text class="payment-desc">推荐使用微信支付</text>
          </view>
          <view class="payment-radio" :class="{ active: selectedPayment === 'wechat' }">
            <text v-if="selectedPayment === 'wechat'" class="radio-dot"></text>
          </view>
        </view>
        
        <view class="payment-item" :class="{ active: selectedPayment === 'alipay' }" @click="selectedPayment = 'alipay'">
          <view class="payment-icon payment-icon-alipay">
            <text class="icon">💳</text>
          </view>
          <view class="payment-info">
            <text class="payment-name">支付宝支付</text>
            <text class="payment-desc">使用支付宝进行支付</text>
          </view>
          <view class="payment-radio" :class="{ active: selectedPayment === 'alipay' }">
            <text v-if="selectedPayment === 'alipay'" class="radio-dot"></text>
          </view>
        </view>
        
        <view class="payment-item" :class="{ active: selectedPayment === 'balance' }" @click="selectedPayment = 'balance'">
          <view class="payment-icon payment-icon-balance">
            <text class="icon">💰</text>
          </view>
          <view class="payment-info">
            <text class="payment-name">余额支付</text>
            <text class="payment-desc">可用余额：¥128.50</text>
          </view>
          <view class="payment-radio" :class="{ active: selectedPayment === 'balance' }">
            <text v-if="selectedPayment === 'balance'" class="radio-dot"></text>
          </view>
        </view>
      </view>
      
      <view class="order-info">
        <view class="order-item">
          <text class="order-label">任务金额</text>
          <text class="order-value">¥25.00</text>
        </view>
        <view class="order-item">
          <text class="order-label">服务费用</text>
          <text class="order-value">¥2.00</text>
        </view>
        <view class="order-item total">
          <text class="order-label">总计</text>
          <text class="order-value total">¥27.00</text>
        </view>
      </view>
      
      <button class="pay-btn" @click="pay">立即支付</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedPayment: 'wechat' // 默认选择微信支付
    };
  },
  methods: {
    pay() {
      try {
        console.log('选择的支付方式:', this.selectedPayment);
        // 模拟支付成功，跳转到支付成功页面
        const promise = wx.navigateTo({
          url: '/pages/pay-success/index',
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
      } catch (error) {
        console.log('支付异常', error);
      }
    }
  }
};
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 24px;
}

.payment-content {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.payment-title {
  font-size: 20px;
  font-weight: 800;
  color: #2c2f32;
  margin-bottom: 32px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.payment-methods {
  margin-bottom: 32px;
}

.payment-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.payment-item.active {
  border-color: #1E88E5;
  background-color: rgba(30, 136, 229, 0.05);
}

.payment-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
}

.payment-icon-wechat {
  background-color: #e8f5e8;
}

.payment-icon-alipay {
  background-color: #e3f2fd;
}

.payment-icon-balance {
  background-color: #fff3e0;
}

.icon {
  font-size: 24px;
}

.payment-info {
  flex: 1;
}

.payment-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c2f32;
  margin-bottom: 4px;
  display: block;
}

.payment-desc {
  font-size: 12px;
  color: #9a9da0;
  display: block;
}

.payment-radio {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 2px solid #e5e8ec;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.payment-radio.active {
  border-color: #1E88E5;
  background-color: #1E88E5;
}

.radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #ffffff;
}

.order-info {
  border-top: 1px solid #e5e8ec;
  padding-top: 24px;
  margin-bottom: 32px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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

.order-item.total {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #e5e8ec;
}

.order-value.total {
  font-size: 18px;
  color: #1E88E5;
  font-weight: 800;
}

.pay-btn {
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

.pay-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(30, 136, 229, 0.3);
}
</style>