<template>
  <view class="review-page">
    <!-- 导航栏-->
    <view class="review-navbar">
      <view class="navbar-left" @click="navigateBack">
        <Icon name="arrow-left" :size="24" color="#2c2f32"></Icon>
      </view>
      <text class="navbar-title">评价订单</text>
      <view class="navbar-right"></view>
    </view>

    <!-- 订单信息 -->
    <view class="order-info-card">
      <view class="order-header">
        <view class="order-icon">
          <Icon :name="getServiceIcon(order.serviceType)" :size="28" color="#ffffff"></Icon>
        </view>
        <view class="order-text">
          <text class="order-title">{{ order.title || '校园跑腿任务' }}</text>
          <text class="order-price">¥{{ formatPrice(order.price) }}</text>
        </view>
      </view>
    </view>

    <!-- 评分 -->
    <view class="rating-card">
      <text class="card-title">服务评分</text>
      <view class="rating-stars">
        <view 
          class="star-item" 
          v-for="i in 5" 
          :key="i" 
          @click="setRating(i)"
        >
          <Icon name="star" :size="48" :color="i <= rating ? '#FFC107' : '#e5e8ec'"></Icon>
        </view>
      </view>
      <text class="rating-text">{{ getRatingText(rating) }}</text>
    </view>

    <!-- 评价标签 -->
    <view class="tags-card">
      <text class="card-title">选择标签</text>
      <view class="tags-list">
        <view 
          class="tag-item" 
          v-for="(tag, index) in tags" 
          :key="index"
          :class="{ active: selectedTags.includes(index) }"
          @click="toggleTag(index)"
        >
          <text>{{ tag }}</text>
        </view>
      </view>
    </view>

    <!-- 评价内容 -->
    <view class="content-card">
      <text class="card-title">评价内容</text>
      <textarea 
        v-model="reviewContent" 
        placeholder="分享您的服务体验，帮助其他用户.."
        class="review-textarea"
        maxlength="500"
      />
      <view class="char-count">{{ reviewContent.length }}/500</view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-bar">
      <button class="submit-btn" @click="submitReview" :disabled="!canSubmit">
        <text v-if="!submitting">提交评价</text>
        <text v-else>提交中..</text>
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
      orderId: '',
      order: {
        title: '',
        price: 0,
        serviceType: 'campusErrand'
      },
      rating: 5,
      tags: ['速度快', '服务好', '态度好', '很专业', '很耐心', '有礼貌'],
      selectedTags: [0, 1],
      reviewContent: '',
      submitting: false
    };
  },
  computed: {
    canSubmit() {
      return this.rating > 0 && !this.submitting;
    }
  },
  onLoad(options) {
    if (options.orderId) {
      this.orderId = options.orderId;
    }
  },
  methods: {
    navigateBack() {
      uni.navigateBack();
    },
    
    getServiceIcon(type) {
      const icons = {
        campusErrand: 'run',
        packageDelivery: 'package',
        examTaking: 'exam',
        classAttendance: 'class'
      };
      return icons[type] || 'order';
    },
    
    formatPrice(price) {
      return parseFloat(price || 0).toFixed(2);
    },
    
    setRating(r) {
      this.rating = r;
    },
    
    getRatingText(r) {
      const texts = ['', '非常差', '比较差', '一般般', '比较好', '非常好'];
      return texts[r] || '';
    },
    
    toggleTag(index) {
      const pos = this.selectedTags.indexOf(index);
      if (pos === -1) {
        this.selectedTags.push(index);
      } else {
        this.selectedTags.splice(pos, 1);
      }
    },
    
    async submitReview() {
      if (!this.canSubmit) return;
      
      this.submitting = true;
      try {
        // 模拟提交
        await new Promise(r => setTimeout(r, 1000));
        uni.showToast({ title: '评价成功', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (error) {
        uni.showToast({ title: '提交失败', icon: 'none' });
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
.review-page { min-height: 100vh; background-color: #f5f7fa; }

.review-navbar { 
  display: flex; align-items: center; justify-content: space-between; 
  padding: 24rpx 32rpx; padding-top: calc(24rpx + var(--status-bar-height, 0));
  background-color: #ffffff; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.05);
}
.navbar-left, .navbar-right { width: 80rpx; }
.navbar-title { font-size: 32rpx; font-weight: 600; color: #2c2f32; }

.order-info-card { margin: 24rpx; background-color: #ffffff; border-radius: 24rpx; padding: 32rpx; }
.order-header { display: flex; align-items: center; gap: 20rpx; }
.order-icon { width: 72rpx; height: 72rpx; border-radius: 18rpx; background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.order-text { flex: 1; }
.order-title { font-size: 28rpx; font-weight: 600; color: #2c2f32; display: block; margin-bottom: 8rpx; }
.order-price { font-size: 32rpx; font-weight: 700; color: #ff4757; }

.rating-card, .tags-card, .content-card { 
  margin: 0 24rpx 24rpx; background-color: #ffffff; border-radius: 24rpx; padding: 32rpx; 
}
.card-title { font-size: 28rpx; font-weight: 600; color: #2c2f32; display: block; margin-bottom: 24rpx; }

.rating-stars { display: flex; justify-content: center; gap: 16rpx; margin-bottom: 16rpx; }
.star-item { padding: 8rpx; }
.rating-text { text-align: center; font-size: 24rpx; color: #FFC107; font-weight: 600; }

.tags-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.tag-item { 
  padding: 16rpx 32rpx; border-radius: 32rpx; 
  background-color: #f5f7fa; font-size: 26rpx; color: #6c757d; 
  border: 2rpx solid transparent; transition: all 0.3s ease;
}
.tag-item.active { 
  background-color: #e3f2fd; color: #1E88E5; 
  border-color: #1E88E5; 
}

.review-textarea { 
  width: 100%; height: 200rpx; font-size: 28rpx; color: #2c2f32; 
  background-color: #f5f7fa; border-radius: 16rpx; padding: 24rpx; 
  box-sizing: border-box;
}
.char-count { text-align: right; font-size: 22rpx; color: #9a9da0; margin-top: 12rpx; }

.submit-bar { padding: 24rpx; padding-bottom: calc(24rpx + env(safe-area-inset-bottom)); background-color: #ffffff; }
.submit-btn { 
  width: 100%; height: 88rpx; border-radius: 44rpx; 
  background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%); 
  font-size: 32rpx; font-weight: 600; color: #ffffff; 
  border: none; box-shadow: 0 8rpx 24rpx rgba(30,136,229,0.3);
}
.submit-btn[disabled] { opacity: 0.5; }
</style>