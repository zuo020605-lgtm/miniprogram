<template>
  <view class="report-page">
    <!-- 导航栏-->
    <view class="report-navbar">
      <view class="navbar-left" @click="navigateBack">
        <Icon name="arrow-left" :size="24" color="#2c2f32"></Icon>
      </view>
      <text class="navbar-title">举报投诉</text>
      <view class="navbar-right"></view>
    </view>

    <!-- 举报类型 -->
    <view class="type-card">
      <text class="card-title">举报类型</text>
      <view class="type-list">
        <view 
          class="type-item" 
          v-for="(type, index) in reportTypes" 
          :key="index"
          :class="{ active: selectedType === index }"
          @click="selectedType = index"
        >
          <Icon :name="type.icon" :size="24" :color="selectedType === index ? '#F44336' : '#9a9da0'"></Icon>
          <text>{{ type.name }}</text>
        </view>
      </view>
    </view>

    <!-- 详细描述 -->
    <view class="desc-card">
      <text class="card-title">详细描述</text>
      <textarea 
        v-model="description" 
        placeholder="请详细描述您遇到的问题.."
        class="desc-textarea"
        maxlength="500"
      />
      <view class="char-count">{{ description.length }}/500</view>
    </view>

    <!-- 上传图片 -->
    <view class="image-card">
      <text class="card-title">上传凭证（选填）</text>
      <view class="image-list">
        <view class="image-item" v-for="(img, index) in images" :key="index">
          <image :src="img" mode="aspectFill" class="preview-image" />
          <view class="remove-btn" @click="removeImage(index)">
            <Icon name="close" :size="16" color="#ffffff"></Icon>
          </view>
        </view>
        <view class="add-image" v-if="images.length < 3" @click="chooseImage">
          <Icon name="camera" :size="32" color="#9a9da0"></Icon>
          <text class="add-text">添加图片</text>
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="contact-card">
      <text class="card-title">联系方式（选填）</text>
      <input 
        v-model="contact" 
        placeholder="请输入手机号或微信号"
        class="contact-input"
        type="text"
      />
    </view>

    <!-- 提示 -->
    <view class="tip-card">
      <Icon name="shield" :size="18" color="#FF9800"></Icon>
      <text class="tip-text">我们将对您的举报信息严格保密，并在1-3个工作日内处理</text>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-bar">
      <button class="submit-btn" @click="submitReport" :disabled="!canSubmit">
        <text v-if="!submitting">提交举报</text>
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
      reportTypes: [
        { name: '虚假信息', icon: 'close' },
        { name: '服务态度差', icon: 'chat' },
        { name: '违规操作', icon: 'shield' },
        { name: '其他问题', icon: 'more' }
      ],
      selectedType: 0,
      description: '',
      images: [],
      contact: '',
      submitting: false
    };
  },
  computed: {
    canSubmit() {
      return this.description.trim().length >= 10 && !this.submitting;
    }
  },
  methods: {
    navigateBack() {
      uni.navigateBack();
    },
    
    chooseImage() {
      uni.chooseImage({
        count: 3 - this.images.length,
        success: (res) => {
          this.images = [...this.images, ...res.tempFilePaths];
        }
      });
    },
    
    removeImage(index) {
      this.images.splice(index, 1);
    },
    
    async submitReport() {
      if (!this.canSubmit) return;
      
      this.submitting = true;
      try {
        await new Promise(r => setTimeout(r, 1000));
        uni.showToast({ title: '举报成功', icon: 'success' });
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
.report-page { min-height: 100vh; background-color: #f5f7fa; }

.report-navbar { 
  display: flex; align-items: center; justify-content: space-between; 
  padding: 24rpx 32rpx; padding-top: calc(24rpx + var(--status-bar-height, 0));
  background-color: #ffffff; box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.05);
}
.navbar-left, .navbar-right { width: 80rpx; }
.navbar-title { font-size: 32rpx; font-weight: 600; color: #2c2f32; }

.type-card, .desc-card, .image-card, .contact-card, .tip-card { 
  margin: 24rpx; background-color: #ffffff; border-radius: 24rpx; padding: 32rpx; 
}
.card-title { font-size: 28rpx; font-weight: 600; color: #2c2f32; display: block; margin-bottom: 24rpx; }

.type-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.type-item { 
  display: flex; align-items: center; gap: 12rpx; 
  padding: 20rpx 32rpx; border-radius: 32rpx; 
  background-color: #f5f7fa; font-size: 26rpx; color: #6c757d; 
  border: 2rpx solid transparent; transition: all 0.3s ease;
}
.type-item.active { 
  background-color: #ffebee; color: #F44336; 
  border-color: #F44336; 
}

.desc-textarea { 
  width: 100%; height: 240rpx; font-size: 28rpx; color: #2c2f32; 
  background-color: #f5f7fa; border-radius: 16rpx; padding: 24rpx; 
  box-sizing: border-box;
}
.char-count { text-align: right; font-size: 22rpx; color: #9a9da0; margin-top: 12rpx; }

.image-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.image-item { position: relative; width: 160rpx; height: 160rpx; border-radius: 16rpx; overflow: hidden; }
.preview-image { width: 100%; height: 100%; }
.remove-btn { 
  position: absolute; top: 8rpx; right: 8rpx; 
  width: 36rpx; height: 36rpx; border-radius: 18rpx; 
  background-color: rgba(0,0,0,0.5); 
  display: flex; align-items: center; justify-content: center; 
}
.add-image { 
  width: 160rpx; height: 160rpx; border-radius: 16rpx; 
  background-color: #f5f7fa; border: 2rpx dashed #e5e8ec; 
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8rpx;
}
.add-text { font-size: 22rpx; color: #9a9da0; }

.contact-input { 
  width: 100%; height: 80rpx; font-size: 28rpx; color: #2c2f32; 
  background-color: #f5f7fa; border-radius: 16rpx; padding: 0 24rpx; 
  box-sizing: border-box;
}

.tip-card { display: flex; align-items: flex-start; gap: 12rpx; }
.tip-text { font-size: 24rpx; color: #9a9da0; line-height: 1.5; flex: 1; }

.submit-bar { padding: 24rpx; padding-bottom: calc(24rpx + env(safe-area-inset-bottom)); background-color: #ffffff; }
.submit-btn { 
  width: 100%; height: 88rpx; border-radius: 44rpx; 
  background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%); 
  font-size: 32rpx; font-weight: 600; color: #ffffff; 
  border: none; box-shadow: 0 8rpx 24rpx rgba(244,67,54,0.3);
}
.submit-btn[disabled] { opacity: 0.5; }
</style>