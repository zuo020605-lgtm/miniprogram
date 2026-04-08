<template>
  <view class="security-page">
    <view class="security-content">
      <view class="security-section">
        <view class="section-header">
          <text class="section-title">账号安全</text>
        </view>
        <view class="security-item" @click="changePassword">
          <text class="security-icon">🔒</text>
          <text class="security-label">修改密码</text>
          <text class="security-arrow">＞</text>
        </view>
        <view class="security-item" @click="forgotPassword">
          <text class="security-icon">🔑</text>
          <text class="security-label">找回密码</text>
          <text class="security-arrow">＞</text>
        </view>
        <view class="security-item" @click="bindPhone">
          <text class="security-icon">📱</text>
          <text class="security-label">绑定手机号</text>
          <text class="security-arrow">＞</text>
        </view>
        <view class="security-item" @click="bindWechat">
          <text class="security-icon">💬</text>
          <text class="security-label">绑定微信</text>
          <text class="security-arrow">＞</text>
        </view>
      </view>
      
      <view class="danger-section">
        <view class="section-header">
          <text class="section-title">危险操作</text>
        </view>
        <view class="security-item danger-item" @click="deleteAccount">
          <text class="security-icon danger-icon">🗑️</text>
          <text class="security-label danger-label">注销账号</text>
          <text class="security-arrow">＞</text>
        </view>
      </view>
      
      <view class="security-tips">
        <text class="tips-text">* 请定期修改密码，确保账号安全</text>
        <text class="tips-text">* 不要将账号密码告诉他人</text>
        <text class="tips-text">* 如遇账号异常，请及时联系客服</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    changePassword() {
      // 模拟修改密码
      uni.showToast({
        title: '修改密码',
        icon: 'none'
      });
    },
    forgotPassword() {
      // 模拟找回密码
      uni.showToast({
        title: '找回密码',
        icon: 'none'
      });
    },
    bindPhone() {
      // 模拟绑定手机号
      uni.showToast({
        title: '绑定手机号',
        icon: 'none'
      });
    },
    bindWechat() {
      // 模拟绑定微信
      uni.showToast({
        title: '绑定微信',
        icon: 'none'
      });
    },
    deleteAccount() {
      // 模拟注销账号
      uni.showModal({
        title: '注销账号',
        content: '确定要注销账号吗？注销后所有数据将被删除，不可恢复。',
        success: (res) => {
          if (res.confirm) {
            uni.showModal({
              title: '再次确认',
              content: '确定要注销账号吗？此操作不可恢复。',
              success: (res) => {
                if (res.confirm) {
                  uni.showToast({
                    title: '账号已注销',
                    icon: 'success'
                  });
                  // 跳转到登录页面
                  setTimeout(() => {
                    uni.navigateTo({
                      url: '/pages/login/index'
                    });
                  }, 1000);
                }
              }
            });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.security-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 24px;
}

.security-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-section {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e8ec;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #9a9da0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.security-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e8ec;
}

.security-item:last-child {
  border-bottom: none;
}

.security-icon {
  font-size: 20px;
  margin-right: 12px;
}

.security-label {
  flex: 1;
  font-size: 14px;
  color: #2c2f32;
}

.security-arrow {
  font-size: 16px;
  color: #9a9da0;
}

.danger-section {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.danger-item {
  border-bottom: none;
}

.danger-icon {
  color: #F44336;
}

.danger-label {
  color: #F44336;
}

.security-tips {
  margin-top: 24px;
  padding: 16px;
  background-color: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
}

.tips-text {
  font-size: 12px;
  color: #ff9800;
  display: block;
  margin-bottom: 8px;
}
</style>