<template>
  <view class="auth-page">
    <view class="auth-content">
      <view class="auth-header">
        <text class="auth-title">实名认证</text>
        <text class="auth-subtitle">完成实名认证后可享受更多服务</text>
      </view>
      
      <view class="auth-form">
        <view class="form-item">
          <text class="form-label">真实姓名</text>
          <input type="text" placeholder="请输入真实姓名" v-model="realName" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">身份证号</text>
          <input type="text" placeholder="请输入身份证号" v-model="idCard" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input type="number" placeholder="请输入手机号" v-model="phone" class="form-input" />
        </view>
        <view class="form-item">
          <text class="form-label">验证码</text>
          <view class="verification-code">
            <input type="number" placeholder="请输入验证码" v-model="verificationCode" class="form-input code-input" />
            <button class="get-code-btn" @click="getVerificationCode">{{countdown > 0 ? `${countdown}s后重新获取` : '获取验证码'}}</button>
          </view>
        </view>
        <button class="auth-btn" @click="submitAuth">提交认证</button>
      </view>
      
      <view class="auth-tips">
        <text class="tips-text">* 我们会严格保护您的个人信息安全</text>
        <text class="tips-text">* 实名认证后不可修改，请确保信息准确</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      realName: '',
      idCard: '',
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
    submitAuth() {
      if (!this.realName) {
        uni.showToast({
          title: '请输入真实姓名',
          icon: 'none'
        });
        return;
      }
      
      if (!this.idCard || this.idCard.length !== 18) {
        uni.showToast({
          title: '请输入正确的身份证号',
          icon: 'none'
        });
        return;
      }
      
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
      
      // 模拟提交认证
      uni.showToast({
        title: '认证成功',
        icon: 'success'
      });
      
      // 跳回个人中心页面
      setTimeout(() => {
        uni.navigateBack();
      }, 1000);
    }
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 24px;
}

.auth-content {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.auth-header {
  margin-bottom: 32px;
  text-align: center;
}

.auth-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c2f32;
  display: block;
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 14px;
  color: #9a9da0;
  display: block;
}

.auth-form {
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 20px;
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
  border: 1px solid #e5e8ec;
  border-radius: 8px;
  font-size: 14px;
  color: #2c2f32;
  background-color: #ffffff;
  box-sizing: border-box;
  height: 48px;
  line-height: 24px;
}

.verification-code {
  display: flex;
  gap: 12px;
  align-items: center;
}

.code-input {
  flex: 1;
  min-width: 0;
}

.get-code-btn {
  padding: 12px 16px;
  background-color: #1E88E5;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  min-width: 100px;
  white-space: nowrap;
}

.auth-btn {
  width: 100%;
  padding: 14px;
  background-color: #1E88E5;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
}

.auth-tips {
  margin-top: 24px;
}

.tips-text {
  font-size: 12px;
  color: #9a9da0;
  display: block;
  margin-bottom: 8px;
}
</style>