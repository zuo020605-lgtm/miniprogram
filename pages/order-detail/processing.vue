<template>
  <view class="order-detail-page">
    <view class="order-header">
      <view class="back-btn" @click="navigateBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">订单详情</text>
      <view class="placeholder"></view>
    </view>
    
    <view class="order-content">
      <view class="order-status-section">
        <text class="status-badge processing">进行中</text>
        <text class="status-description">任务正在进行中，请及时完成</text>
      </view>
      
      <view class="order-info-section">
        <view class="info-item">
          <text class="info-label">订单标题</text>
          <text class="info-value">{{order.title}}</text>
        </view>
        <view class="info-item">
          <text class="info-label">订单金额</text>
          <text class="info-value price">{{order.price}}</text>
        </view>
        <view class="info-item">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{order.time}}</text>
        </view>
        <view class="info-item">
          <text class="info-label">开始时间</text>
          <text class="info-value">{{order.startTime}}</text>
        </view>
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{order.id}}</text>
        </view>
      </view>
      
      <view class="order-details-section">
        <text class="section-title">任务详情</text>
        <text class="detail-text">{{order.description}}</text>
        <view class="location-info">
          <text class="location-label">地点：</text>
          <text class="location-value">{{order.location}}</text>
        </view>
        <view class="contact-info">
          <text class="contact-label">联系人：</text>
          <text class="contact-value">{{order.contact}}</text>
        </view>
      </view>
      
      <view class="order-actions">
        <button class="action-btn cancel-btn" @click="pauseOrder">暂停任务</button>
        <button class="action-btn complete-btn" @click="completeOrder">完成任务</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      order: {
        id: 2,
        title: '快递代取：顺丰快递',
        price: '¥8.00',
        time: '2024-01-14 10:20',
        startTime: '2024-01-14 10:30',
        status: 'processing',
        statusText: '进行中',
        description: '帮我取一下顺丰快递，在北门快递点，取件码是654321',
        location: '北门快递点',
        contact: '13900139000'
      }
    };
  },
  onLoad(options) {
    // 从路由参数中获取订单ID
    const orderId = options.id;
    // 这里可以根据orderId从后端获取订单详情
    // 暂时使用模拟数据
  },
  methods: {
    navigateBack() {
      uni.navigateBack();
    },
    completeOrder() {
      uni.showToast({
        title: '任务已完成',
        icon: 'success'
      });
      // 这里可以调用API将订单状态改为已完成
      // 然后导航到已完成的详情页面
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/order-detail/completed?id=${this.order.id}`
        });
      }, 1000);
    },
    pauseOrder() {
      uni.showModal({
        title: '暂停任务',
        content: '确定要暂停这个任务吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '任务已暂停',
              icon: 'success'
            });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e8ec;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 20px;
  color: #2c2f32;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2f32;
}

.placeholder {
  width: 40px;
}

.order-content {
  padding: 16px;
}

.order-status-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.status-badge.processing {
  background-color: rgba(30, 136, 229, 0.1);
  color: #1E88E5;
}

.status-description {
  font-size: 14px;
  color: #9a9da0;
}

.order-info-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #9a9da0;
}

.info-value {
  font-size: 14px;
  color: #2c2f32;
  font-weight: 500;
}

.info-value.price {
  color: #1E88E5;
  font-weight: 700;
  font-size: 16px;
}

.order-details-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2f32;
  margin-bottom: 16px;
}

.detail-text {
  font-size: 14px;
  color: #2c2f32;
  line-height: 1.5;
  margin-bottom: 16px;
}

.location-info,
.contact-info {
  display: flex;
  margin-bottom: 8px;
}

.location-label,
.contact-label {
  font-size: 14px;
  color: #9a9da0;
  margin-right: 8px;
}

.location-value,
.contact-value {
  font-size: 14px;
  color: #2c2f32;
  flex: 1;
}

.order-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.action-btn {
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
}

.cancel-btn {
  background-color: #ffffff;
  color: #9a9da0;
  border: 1px solid #e5e8ec;
}

.complete-btn {
  background-color: #1E88E5;
  color: #ffffff;
}
</style>