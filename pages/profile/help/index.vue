<template>
  <view class="help-page">
    <view class="help-content">
      <view class="help-header">
        <text class="help-title">帮助中心</text>
        <text class="help-subtitle">常见问题解答</text>
      </view>
      
      <view class="help-section">
        <view class="section-title">使用指南</view>
        <view class="help-item" @click="showHelpDetail('如何发布任务？')">
          <text class="help-question">如何发布任务？</text>
          <text class="help-arrow">＞</text>
        </view>
        <view class="help-item" @click="showHelpDetail('如何接单？')">
          <text class="help-question">如何接单？</text>
          <text class="help-arrow">＞</text>
        </view>
        <view class="help-item" @click="showHelpDetail('如何进行支付？')">
          <text class="help-question">如何进行支付？</text>
          <text class="help-arrow">＞</text>
        </view>
      </view>
      
      <view class="help-section">
        <view class="section-title">账户问题</view>
        <view class="help-item" @click="showHelpDetail('如何修改密码？')">
          <text class="help-question">如何修改密码？</text>
          <text class="help-arrow">＞</text>
        </view>
        <view class="help-item" @click="showHelpDetail('如何绑定手机号？')">
          <text class="help-question">如何绑定手机号？</text>
          <text class="help-arrow">＞</text>
        </view>
        <view class="help-item" @click="showHelpDetail('如何进行实名认证？')">
          <text class="help-question">如何进行实名认证？</text>
          <text class="help-arrow">＞</text>
        </view>
      </view>
      
      <view class="help-section">
        <view class="section-title">其他问题</view>
        <view class="help-item" @click="showHelpDetail('如何联系客服？')">
          <text class="help-question">如何联系客服？</text>
          <text class="help-arrow">＞</text>
        </view>
        <view class="help-item" @click="showHelpDetail('平台规则是什么？')">
          <text class="help-question">平台规则是什么？</text>
          <text class="help-arrow">＞</text>
        </view>
        <view class="help-item" @click="showHelpDetail('如何投诉举报？')">
          <text class="help-question">如何投诉举报？</text>
          <text class="help-arrow">＞</text>
        </view>
      </view>
      
      <view class="contact-section">
        <text class="contact-title">联系客服</text>
        <text class="contact-info">客服电话：400-123-4567</text>
        <text class="contact-info">工作时间：9:00-18:00</text>
        <button class="contact-btn" @click="contactService">立即联系</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    showHelpDetail(question) {
      // 模拟显示帮助详情
      uni.showModal({
        title: question,
        content: '这里是详细的问题解答内容...',
        showCancel: false
      });
    },
    contactService() {
      // 模拟联系客服
      uni.showToast({
        title: '正在联系客服...',
        icon: 'none'
      });
    }
  }
};
</script>

<style scoped>
.help-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 24px;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.help-header {
  text-align: center;
  margin-bottom: 16px;
}

.help-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c2f32;
  display: block;
  margin-bottom: 8px;
}

.help-subtitle {
  font-size: 14px;
  color: #9a9da0;
  display: block;
}

.help-section {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-title {
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #9a9da0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e8ec;
}

.help-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e8ec;
}

.help-item:last-child {
  border-bottom: none;
}

.help-question {
  font-size: 14px;
  color: #2c2f32;
  flex: 1;
}

.help-arrow {
  font-size: 16px;
  color: #9a9da0;
}

.contact-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.contact-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2f32;
  display: block;
  margin-bottom: 16px;
}

.contact-info {
  font-size: 14px;
  color: #9a9da0;
  display: block;
  margin-bottom: 8px;
}

.contact-btn {
  margin-top: 20px;
  padding: 12px 32px;
  background-color: #1E88E5;
  color: #ffffff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
}
</style>