<template>
  <view class="empty-state-container">
    <view class="empty-icon">{{ icon }}</view>
    <text class="empty-title">{{ title }}</text>
    <text class="empty-description" v-if="description">{{ description }}</text>
    <button 
      class="empty-action" 
      v-if="actionText" 
      @click="handleAction"
    >
      {{ actionText }}
    </button>
  </view>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: '📋'
    },
    title: {
      type: String,
      default: '暂无数据'
    },
    description: {
      type: String,
      default: ''
    },
    actionText: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleAction() {
      this.$emit('action');
    }
  }
};
</script>

<style scoped>
.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96rpx 48rpx;
  text-align: center;
}

.empty-icon {
  font-size: 128rpx;
  margin-bottom: 32rpx;
  opacity: 0.8;
  line-height: 1;
}

.empty-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #9a9da0;
  margin-bottom: 16rpx;
}

.empty-description {
  font-size: 24rpx;
  color: #c4c7ca;
  margin-bottom: 48rpx;
  max-width: 500rpx;
  line-height: 1.5;
}

.empty-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 64rpx;
  background-color: #1E88E5;
  color: #ffffff;
  border: none;
  border-radius: 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.empty-action:active {
  opacity: 0.9;
  transform: translateY(2rpx);
}
</style>
