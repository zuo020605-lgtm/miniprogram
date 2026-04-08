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
        <text class="status-badge pending">待处理</text>
        <text class="status-description">请尽快确认并开始任务</text>
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
          <text class="info-label">订单编号</text>
          <text class="info-value">{{order.id}}</text>
        </view>
      </view>
      
      <view class="order-actions">
        <button class="action-btn cancel-btn" @click="cancelOrder">取消订单</button>
        <button class="action-btn start-btn" @click="startOrder">开始任务</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      order: {
        id: 1,
        title: '校园跑腿：帮取快递',
        price: '¥10.00',
        time: '2024-01-15 14:30',
        status: 'pending',
        statusText: '待处理',
        description: '帮我取一下快递，在南门快递柜，取件码是123456',
        location: '南门快递柜',
        contact: '13800138000'
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
    startOrder() {
      uni.showToast({
        title: '任务已开始',
        icon: 'success'
      });
      // 这里可以调用API将订单状态改为进行中
      // 然后导航到进行中的详情页面
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/order-detail/processing?id=${this.order.id}`
        });
      }, 1000);
    },
    cancelOrder() {
      uni.showModal({
        title: '取消订单',
        content: '确定要取消这个订单吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '订单已取消',
              icon: 'success'
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1000);
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

.status-badge.pending {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ff9800;
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

.start-btn {
  background-color: #1E88E5;
  color: #ffffff;
}
</style>