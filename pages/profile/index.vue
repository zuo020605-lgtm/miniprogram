<template>
  <view class="page-container profile-page">
    <view class="profile-content">
      <!-- 已登录状态 -->
      <view v-if="isLoggedIn">
        <!-- 账户管理 -->
        <view class="account-section">
          <view class="account-header">
            <view class="avatar-placeholder">
              <image class="avatar" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20college%20student&image_size=square" mode="aspectFill"></image>
            </view>
            <view class="account-info">
              <text class="user-name">{{userName}}</text>
              <text class="user-id">ID: {{userId}}</text>
              <text class="reg-time">注册时间: {{regTime}}</text>
              <view class="auth-status" @click="navigateToAuth">
                <text class="auth-text">{{isAuth ? '已实名认证' : '未实名认证'}}</text>
                <text class="auth-arrow">＞</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 数据统计 -->
        <view class="stats-section">
          <view class="stats-header">
            <text class="stats-title">数据统计</text>
          </view>
          <view class="stats-content">
            <view class="stats-item">
              <text class="stats-value">{{todayIncome}}</text>
              <text class="stats-label">今日收入</text>
            </view>
            <view class="stats-item">
              <text class="stats-value">{{completedOrders}}</text>
              <text class="stats-label">完单量</text>
            </view>
            <view class="stats-item">
              <text class="stats-value">{{rating}}%</text>
              <text class="stats-label">好评率</text>
            </view>
          </view>
        </view>
        
        <!-- 功能入口 -->
        <view class="menu-section">
          <view class="menu-header">
            <text class="menu-title">功能入口</text>
          </view>
          <view class="menu-grid">
            <view class="menu-item" @click="navigateToWallet">
              <Icon name="wallet" :size="24" color="#1E88E5"></Icon>
              <text class="menu-text">我的钱包</text>
            </view>
            <view class="menu-item" @click="navigateToSettings">
              <Icon name="settings" :size="24" color="#4CAF50"></Icon>
              <text class="menu-text">系统设置</text>
            </view>
            <view class="menu-item" @click="navigateToHelp">
              <Icon name="help" :size="24" color="#FF9800"></Icon>
              <text class="menu-text">帮助中心</text>
            </view>
            <view class="menu-item" @click="navigateToMyPosts">
              <Icon name="order" :size="24" color="#9C27B0"></Icon>
              <text class="menu-text">我的发布</text>
            </view>
            <view class="menu-item" @click="navigateToMyOrders">
              <Icon name="run" :size="24" color="#FF5722"></Icon>
              <text class="menu-text">我的接单</text>
            </view>
            <view class="menu-item" @click="navigateToAccountSecurity">
              <Icon name="shield" :size="24" color="#F44336"></Icon>
              <text class="menu-text">账号安全</text>
            </view>
          </view>
        </view>
        
        <!-- 身份切换 -->
        <view class="identity-section">
          <view class="identity-header">
            <text class="identity-title">身份切换</text>
          </view>
          <view class="identity-content">
            <view class="identity-item" @click="switchAccount">
              <text class="identity-icon">🔄</text>
              <text class="identity-text">切换账号</text>
              <text class="identity-arrow">＞</text>
            </view>
            <view class="identity-item" @click="logout">
              <text class="identity-icon">🚪</text>
              <text class="identity-text">退出登录</text>
              <text class="identity-arrow">＞</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 未登录状态 -->
      <view class="login-section" @click="navigateToLogin" v-else>
        <view class="login-content">
          <view class="avatar-placeholder">
            <span class="avatar-icon">👤</span>
          </view>
          <view class="login-info">
            <text class="login-text">点击登录</text>
            <text class="login-subtext">登录后享受更多服务</text>
          </view>
          <button class="login-btn">立即登录</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Icon from '@/components/icon/icon.vue';

export default {
  components: { Icon },
  data() {
    return {
      isLoggedIn: false, // 模拟登录状态，实际项目中可从本地存储或API获取
      userName: '张三', // 模拟用户名
      userId: '100001', // 模拟用户ID
      regTime: '2024-01-01', // 模拟注册时间
      isAuth: false, // 模拟实名认证状态
      todayIncome: '¥128.00', // 模拟今日收入
      completedOrders: '23', // 模拟完单量
      rating: '98' // 模拟好评率
    };
  },
  onLoad() {
    // 检查登录状态，从本地存储获取
    this.checkLoginStatus();
  },
  onShow() {
    // 每次页面显示时检查登录状态
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      const isLoggedIn = uni.getStorageSync('isLoggedIn');
      const userName = uni.getStorageSync('userName');
      if (isLoggedIn) {
        this.isLoggedIn = true;
        this.userName = userName || '张三';
      } else {
        this.isLoggedIn = false;
      }
    },
    navigateToLogin() {
      const promise = uni.navigateTo({
        url: '/pages/login/index'
      });
      // 处理Promise返回值，避免UnhandledPromiseRejection
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除登录状态
            uni.removeStorageSync('isLoggedIn');
            uni.removeStorageSync('userName');
            this.isLoggedIn = false;
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            });
          }
        }
      });
    },
    // 导航方法
    navigateToAuth() {
      const promise = uni.navigateTo({
        url: './auth/index'
      });
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    },
    navigateToWallet() {
      const promise = uni.navigateTo({
        url: './wallet/index'
      });
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    },
    navigateToSettings() {
      const promise = uni.navigateTo({
        url: './settings/index'
      });
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    },
    navigateToHelp() {
      const promise = uni.navigateTo({
        url: './help/index'
      });
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    },
    navigateToMyPosts() {
      const promise = uni.navigateTo({
        url: './my-posts/index'
      });
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    },
    navigateToMyOrders() {
      const promise = uni.navigateTo({
        url: './my-orders/index'
      });
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    },
    navigateToAccountSecurity() {
      const promise = uni.navigateTo({
        url: './security/index'
      });
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    },
    switchAccount() {
      // 清除当前登录状态
      uni.removeStorageSync('isLoggedIn');
      uni.removeStorageSync('userName');
      this.isLoggedIn = false;
      // 跳转到登录页面
      this.navigateToLogin();
    }
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-top: 20px;
  padding-bottom: 80px;
}

.profile-content {
  padding: 20px 24px;
}

/* 账户管理 */
.account-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.account-header {
  display: flex;
  align-items: center;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: #e5e8ec;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  overflow: hidden;
}

.avatar-icon {
  font-size: 32px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c2f32;
}

.user-id {
  font-size: 14px;
  color: #9a9da0;
}

.reg-time {
  font-size: 14px;
  color: #9a9da0;
}

.auth-status {
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.auth-text {
  font-size: 14px;
  color: #1E88E5;
  margin-right: 4px;
}

.auth-arrow {
  font-size: 14px;
  color: #1E88E5;
}

/* 数据统计 */
.stats-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.stats-header {
  margin-bottom: 16px;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2f32;
}

.stats-content {
  display: flex;
  justify-content: space-between;
}

.stats-item {
  flex: 1;
  text-align: center;
  padding: 12px;
}

.stats-value {
  font-size: 20px;
  font-weight: 800;
  color: #1E88E5;
  display: block;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 12px;
  color: #9a9da0;
}

/* 功能入口 */
.menu-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.menu-header {
  margin-bottom: 16px;
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2f32;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.menu-item:active {
  background-color: #e5e8ec;
}

.menu-icon {
  font-size: 24px;
}

.menu-text {
  font-size: 12px;
  color: #2c2f32;
  text-align: center;
}

/* 身份切换 */
.identity-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.identity-header {
  margin-bottom: 16px;
}

.identity-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2f32;
}

.identity-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.identity-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.identity-item:active {
  background-color: #e5e8ec;
}

.identity-icon {
  font-size: 20px;
  margin-right: 12px;
}

.identity-text {
  flex: 1;
  font-size: 14px;
  color: #2c2f32;
}

.identity-arrow {
  font-size: 16px;
  color: #9a9da0;
}

/* 未登录状态 */
.login-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 40px 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.login-info {
  text-align: center;
}

.login-text {
  font-size: 18px;
  font-weight: 600;
  color: #2c2f32;
  display: block;
  margin-bottom: 4px;
}

.login-subtext {
  font-size: 14px;
  color: #9a9da0;
  display: block;
}

.login-btn {
  padding: 12px 32px;
  background-color: #1E88E5;
  color: #ffffff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.login-btn:active {
  transform: translateY(2px);
  opacity: 0.9;
}
</style>