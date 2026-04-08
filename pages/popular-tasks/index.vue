<template>
  <view class="popular-tasks-page">
    <view class="tasks-list">
      <!-- 订单列表 -->
      <view class="task-card" v-for="order in unacceptedOrders" :key="order._id" @click="navigateToOrderDetail(order._id, order.status, order.serviceType)">
        <view class="task-header">
          <view class="task-tag" :class="getTagClass(order)">
            <text>{{ getTagText(order) }}</text>
          </view>
          <text class="task-price">¥{{ order.price }}</text>
        </view>
        <text class="task-title">{{ order.title }}</text>
        <view class="task-info">
          <view class="task-info-item">
            <Icon name="location" :size="20" color="#9a9da0"></Icon>
            <text class="task-info-text" v-if="order.pickupLocation && order.deliveryLocation">{{ order.pickupLocation }} -> {{ order.deliveryLocation }}</text>
            <text class="task-info-text" v-else-if="order.teachingBuilding && order.examClassroom">{{ order.teachingBuilding }} {{ order.examClassroom }}</text>
            <text class="task-info-text" v-else>{{ order.location || '未知位置' }}</text>
          </view>
          <view class="task-info-item">
            <Icon name="time" :size="20" color="#9a9da0"></Icon>
            <text class="task-info-text">{{ formatTime(order.startTime) }}</text>
          </view>
        </view>
        <view class="task-footer">
          <text class="task-time">{{ formatTimeAgo(order.createdAt) }}</text>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading" v-if="loading">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view class="no-tasks" v-if="!loading && unacceptedOrders.length === 0">
        <text class="no-tasks-text">暂无未接取的任务</text>
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
      orders: [],
      loading: true
    };
  },
  computed: {
    unacceptedOrders() {
      // 展示所有未被接取的订单任务，按时间紧急程度从高到低排序
      return this.orders
        .filter(order => order.status === 'unaccepted')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  onLoad() {
    this.getOrders();
  },
  methods: {

    navigateToOrderDetail(id, status, serviceType) {
      const url = `/pages/order-detail/index?id=${id}&status=${status}&serviceType=${serviceType}`;
      uni.navigateTo({ url });
    },
    async getOrders() {
      this.loading = true;
      try {
        const orderCloud = uniCloud.importObject('order');
        const result = await orderCloud.getOrderList({ limit: 50 });
        if (result.errCode === 0) {
          // 确保订单数据格式正确
          this.orders = result.data.map(order => ({
            ...order,
            price: typeof order.price === 'number' ? order.price : parseFloat(order.price) || 0,
            orderNo: order.orderNo || '',
            userNickname: order.userNickname || '',
            courierNickname: order.courierNickname || '',
            orderStatus: order.orderStatus || 'waitingAccept',
            status: order.status || 'unaccepted'
          }));
          console.log('获取订单成功:', this.orders);
        } else {
          console.error('获取订单失败:', result.errMsg);
          uni.showToast({
            title: '获取订单失败: ' + result.errMsg,
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取订单出错:', error);
        uni.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    formatTime(timeStr) {
      if (!timeStr) return '未知时间';
      // 转换时间格式为iOS兼容格式
      const safeTimeStr = timeStr.replace(' ', 'T').replace(/\.(\d+)$/, '');
      const date = new Date(safeTimeStr);
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    getTagClass(order) {
      var m = { unaccepted: 'task-tag-normal', pending: 'task-tag-new', processing: 'task-tag-warning', completed: 'task-tag-success', cancelled: 'task-tag-muted', paused: 'task-tag-muted' };
      return m[order.status] || 'task-tag-muted';
    },
    getTagText(order) {
      var m = { unaccepted: '等待接单', pending: '已接单', processing: '服务中', completed: '已完成', cancelled: '已取消', paused: '已暂停' };
      return m[order.status] || '未知';
    },
    formatTimeAgo(timeStr) {
      if (!timeStr) return '未知时间';
      const now = new Date();
      // 转换时间格式为iOS兼容格式
      const safeTimeStr = timeStr.replace(' ', 'T').replace(/\.(\d+)$/, '');
      const date = new Date(safeTimeStr);
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
      return `${Math.floor(minutes / 1440)}天前`;
    }
  }
};
</script>

<style scoped>
.popular-tasks-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 页面顶部内边距，确保内容不被状态栏遮挡 */
.tasks-list {
  padding: 16px;
  padding-top: calc(16px + 20rpx + var(--status-bar-height, 44rpx));
}

.task-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.task-card:active {
  background-color: #f8f9fa;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.task-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-tag-urgent {
  background-color: rgba(251, 81, 81, 0.1);
  color: #b31b25;
}

.task-tag-new {
  background-color: rgba(30, 136, 229, 0.1);
  color: #1565C0;
}

.task-tag-normal {
  background-color: rgba(76, 175, 80, 0.1);
  color: #388E3C;
}

.task-tag-warning {
  background-color: rgba(255, 152, 0, 0.1);
  color: #E65100;
}

.task-tag-success {
  background-color: rgba(76, 175, 80, 0.1);
  color: #388E3C;
}

.task-tag-muted {
  background-color: rgba(158, 158, 158, 0.1);
  color: #757575;
}

.task-price {
  font-size: 18px;
  font-weight: 800;
  color: #1E88E5;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2f32;
  line-height: 1.4;
  margin-bottom: 16px;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.task-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-info-icon {
  font-size: 12px;
  color: #9a9da0;
}

.task-info-text {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
}

.task-footer {
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
}

.task-time {
  font-size: 12px;
  color: #9a9da0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.loading-text {
  font-size: 14px;
  color: #9a9da0;
}

.no-tasks {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}

.no-tasks-text {
  font-size: 16px;
  color: #9a9da0;
}
</style>
