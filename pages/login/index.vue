<template>
  <view class="login-page">
    <view class="login-content">
      <view class="login-header">
        <text class="login-title">登录</text>
        <text class="login-subtitle">欢迎使用校园跑腿服务</text>
      </view>
      
      <view class="login-form">
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input type="number" placeholder="请输入手机号" v-model="phone" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">验证码</text>
          <view class="verification-code">
            <input type="number" placeholder="请输入验证码" v-model="verificationCode" class="form-input code-input" />
            <button class="get-code-btn" @click="getVerificationCode">获取验证码</button>
          </view>
        </view>
        <button class="login-btn" @click="loginByPhone">手机号登录</button>
      </view>
      
      <view class="divider">
        <text class="divider-text">其他登录方式</text>
      </view>
      
      <view class="other-login">
        <button class="wechat-login-btn" @click="loginByWechat">
          <text class="wechat-icon">💬</text>
          <text class="wechat-text">微信登录</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      phone: '',
      verificationCode: '',
      countdown: 0
    };
  },
  methods: {
    getVerificationCode() {
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        });
        return;
      }
      
      // 模拟发送验证码
      uni.showToast({
        title: '验证码已发送',
        icon: 'success'
      });
      
      // 开始倒计时
      this.countdown = 60;
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    },
    loginByPhone() {
      if (!this.phone || this.phone.length !== 11) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        });
        return;
      }
      
      if (!this.verificationCode || this.verificationCode.length !== 6) {
        uni.showToast({
          title: '请输入正确的验证码',
          icon: 'none'
        });
        return;
      }
      
      // 模拟登录成功
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      // 保存登录状态
      uni.setStorageSync('isLoggedIn', true);
      uni.setStorageSync('userName', '张三');
      
      // 跳转到已登录的我的页面
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/profile/index'
        });
      }, 1000);
    },
    loginByWechat() {
      // 模拟微信登录
      uni.showToast({
        title: '微信登录成功',
        icon: 'success'
      });
      
      // 保存登录状态
      uni.setStorageSync('isLoggedIn', true);
      uni.setStorageSync('userName', '张三');
      
      // 跳转到已登录的我的页面
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/profile/index'
        });
      }, 1000);
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.login-content {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.login-title {
  font-size: 28px;
  font-weight: 800;
  color: #2c2f32;
  margin-bottom: 8px;
  display: block;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.login-subtitle {
  font-size: 14px;
  color: #9a9da0;
  display: block;
}

.login-form {
  margin-bottom: 32px;
  width: 100%;
}

.form-item {
  margin-bottom: 24px;
  width: 100%;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2c2f32;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e5e8ec;
  border-radius: 12px;
  font-size: 16px;
  color: #2c2f32;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #1E88E5;
  background-color: #ffffff;
}

.verification-code {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.code-input {
  flex: 1;
  min-width: 0;
}

.get-code-btn {
  padding: 16px 16px;
  background-color: #1E88E5;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  min-width: 100px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

/* 确保输入框有足够的高度显示文字 */
.form-input {
  min-height: 50px;
  line-height: 24px;
}

.get-code-btn:active {
  transform: translateY(2px);
}

.login-btn {
  width: 100%;
  padding: 16px;
  background-color: #1E88E5;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
  transition: all 0.3s ease;
  margin-top: 8px;
}

.login-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(30, 136, 229, 0.3);
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  width: 100%;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e5e8ec;
}

.divider-text {
  padding: 0 16px;
  font-size: 14px;
  color: #9a9da0;
}

.other-login {
  display: flex;
  justify-content: center;
  width: 100%;
}

.wechat-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 40px;
  background-color: #ffffff;
  color: #07C160;
  border: 2px solid #07C160;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
}

.wechat-login-btn:active {
  background-color: rgba(7, 193, 96, 0.05);
}

.wechat-icon {
  font-size: 20px;
}
</style>