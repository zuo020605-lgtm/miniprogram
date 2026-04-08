<template>
  <view class="chat-page">
    <!-- 顶部导航 -->
    <view class="chat-navbar">
      <view class="navbar-left" @click="navigateBack">
        <Icon name="arrow-left" :size="24" color="#2c2f32"></Icon>
      </view>
      <view class="navbar-center">
        <text class="navbar-title">{{ chatUserName }}</text>
        <text class="navbar-status">在线</text>
      </view>
      <view class="navbar-right">
        <Icon name="more" :size="24" color="#2c2f32"></Icon>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view 
      scroll-y 
      class="message-list" 
      :scroll-top="scrollTop"
      @scrolltoupper="loadMoreMessages"
    >
      <view 
        class="message-item" 
        v-for="(msg, index) in messages" 
        :key="index"
        :class="{ 'message-self': msg.isSelf }"
      >
        <!-- 对方的消息 -->
        <view class="message-avatar" v-if="!msg.isSelf">
          <text class="avatar-text">{{ (chatUserName || 'U').charAt(0) }}</text>
        </view>
        <view class="message-content" :class="{ 'message-self': msg.isSelf }">
          <view class="message-bubble">
            <text class="message-text">{{ msg.content }}</text>
          </view>
          <text class="message-time">{{ formatTime(msg.time) }}</text>
        </view>
        <!-- 自己的消息 -->
        <view class="message-avatar" v-if="msg.isSelf">
          <text class="avatar-text">我</text>
        </view>
      </view>
    </scroll-view>

    <!-- 输入框-->
    <view class="input-bar">
      <view class="input-wrapper">
        <input 
          type="text" 
          v-model="inputText" 
          placeholder="输入消息..." 
          class="message-input"
          @confirm="sendMessage"
        />
        <view class="input-actions">
          <Icon name="image" :size="24" color="#9a9da0"></Icon>
        </view>
      </view>
      <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim()">
        <Icon name="arrow-right" :size="20" color="#ffffff"></Icon>
      </button>
    </view>
  </view>
</template>

<script>
import Icon from '@/components/icon/icon.vue';

export default {
  components: { Icon },
  data() {
    return {
      chatUserName: '用户',
      messages: [
        { content: '您好，请问任务还在进行中吗？', time: Date.now() - 3600000, isSelf: false },
        { content: '是的，正在进行中，预计还需10分钟', time: Date.now() - 3000000, isSelf: true },
        { content: '好的，麻烦您了', time: Date.now() - 2400000, isSelf: false }
      ],
      inputText: '',
      scrollTop: 999999
    };
  },
  onLoad(options) {
    if (options.userName) {
      this.chatUserName = decodeURIComponent(options.userName);
    }
  },
  methods: {
    navigateBack() {
      uni.navigateBack();
    },
    
    sendMessage() {
      if (!this.inputText.trim()) return;
      
      this.messages.push({
        content: this.inputText,
        time: Date.now(),
        isSelf: true
      });
      
      this.inputText = '';
      this.$nextTick(() => {
        this.scrollTop = 999999;
      });
    },
    
    loadMoreMessages() {},
    
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  }
};
</script>

<style scoped>
.chat-page { height: 100vh; background-color: #f5f7fa; display: flex; flex-direction: column; }

.chat-navbar { 
  display: flex; align-items: center; justify-content: space-between; 
  padding: 24rpx 32rpx; padding-top: calc(24rpx + var(--status-bar-height, 0));
  background-color: #ffffff; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.05);
}
.navbar-left, .navbar-right { width: 80rpx; display: flex; align-items: center; }
.navbar-right { justify-content: flex-end; }
.navbar-center { flex: 1; text-align: center; }
.navbar-title { font-size: 32rpx; font-weight: 600; color: #2c2f32; display: block; }
.navbar-status { font-size: 20rpx; color: #4CAF50; }

.message-list { 
  flex: 1; 
  padding: 24rpx; 
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

.message-item { 
  display: flex; 
  align-items: flex-end; 
  gap: 12rpx; 
  margin-bottom: 20rpx;
  width: 100%;
  box-sizing: border-box;
  justify-content: flex-start;
}

.message-item.message-self { 
  flex-direction: row-reverse; 
  justify-content: flex-start;
}

.message-avatar { 
  width: 48rpx; 
  height: 48rpx; 
  border-radius: 24rpx; 
  background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0;
  margin: 0;
  padding: 0;
}

.avatar-text { 
  font-size: 16rpx; 
  color: #ffffff; 
  font-weight: 700; 
  line-height: 1;
}

.message-content { 
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: calc(100% - 72rpx);
  word-wrap: break-word;
  word-break: break-word;
  overflow: hidden;
}

.message-item.message-self .message-content { 
  align-items: flex-end;
}

.message-bubble { 
  background-color: #f0f2f5; 
  padding: 16rpx 24rpx; 
  border-radius: 20rpx;
  word-wrap: break-word;
  word-break: break-word;
}

.message-item.message-self .message-bubble { 
  background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%); 
}

.message-text { 
  font-size: 26rpx; 
  color: #2c2f32; 
  line-height: 1.4;
}

.message-item.message-self .message-text { 
  color: #ffffff; 
}

.message-time { 
  font-size: 18rpx; 
  color: #9a9da0; 
  margin-top: 8rpx; 
  display: block;
}

.input-bar { 
  display: flex; align-items: center; gap: 16rpx; 
  padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background-color: #ffffff; box-shadow: 0 -2rpx 16rpx rgba(0,0,0,0.05);
}
.input-wrapper { flex: 1; display: flex; align-items: center; background-color: #f5f7fa; border-radius: 32rpx; padding: 0 24rpx; }
.message-input { flex: 1; height: 72rpx; font-size: 28rpx; background: transparent; }
.input-actions { padding: 16rpx; }
.send-btn { 
  width: 72rpx; height: 72rpx; border-radius: 36rpx; 
  background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%); 
  display: flex; align-items: center; justify-content: center; 
  border: none; box-shadow: 0 4rpx 16rpx rgba(30,136,229,0.3);
}
.send-btn[disabled] { opacity: 0.5; }
</style>