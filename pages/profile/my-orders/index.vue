<template>
  <view class="my-orders-page">
    <view class="my-orders-content">
      <view class="tabs">
        <view class="tab" :class="{ active: activeTab === 'pending' }" @click="activeTab = 'pending'">
          <text class="tab-text">待处理</text>
        </view>
        <view class="tab" :class="{ active: activeTab === 'processing' }" @click="activeTab = 'processing'">
          <text class="tab-text">进行中</text>
        </view>
        <view class="tab" :class="{ active: activeTab === 'completed' }" @click="activeTab = 'completed'">
          <text class="tab-text">已完成</text>
        </view>
      </view>
      
      <view class="orders-list">
        <view class="order-item" v-for="order in filteredOrders" :key="order._id">
          <view class="order-header">
            <text class="order-title">{{order.title}}</text>
            <text class="order-status" :class="order.status">{{getStatusText(order.status)}}</text>
          </view>
          <view class="order-info">
            <text class="order-price">¥{{typeof order.price === 'number' ? order.price.toFixed(2) : (parseFloat(order.price) || 0).toFixed(2)}}</text>
            <text class="order-time">{{formatTime(order.createdAt)}}</text>
          </view>
          <view class="order-actions">
            <button class="action-btn" @click="viewDetail(order._id, order.status, order.serviceType)">查看详情</button>
            <button class="action-btn" @click="startOrder(order._id)" v-if="order.status === 'pending'">开始任务</button>
            <button class="action-btn" @click="completeOrder(order._id)" v-if="order.status === 'processing'">完成任务</button>
          </view>
        </view>
        
        <!-- 加载状态 -->
        <view class="loading" v-if="loading">
          <text class="loading-text">加载中...</text>
        </view>
        
        <view class="empty-state" v-if="!loading && filteredOrders.length === 0">
          <text class="empty-icon">🎯</text>
          <text class="empty-text">暂无接取的任务</text>
          <button class="empty-btn" @click="navigateToHome">去接单</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'pending',
      orders: [],
      loading: true
    };
  },
  computed: {
    filteredOrders() {
      return this.orders.filter(order => order.status === this.activeTab);
    }
  },
  onLoad() {
    this.getOrders();
  },
  methods: {
    async getOrders() {
      this.loading = true;
      try {
        const orderCloud = uniCloud.importObject('order');
        const result = await orderCloud.getOrderList({ limit: 20 });
        if (result.errCode === 0) {
          // 只显示有接取人的订单（即当前用户接取的订单）
          this.orders = result.data.filter(order => order.assignee);
        } else {
          console.error('获取订单失败:', result.errMsg);
        }
      } catch (error) {
        console.error('获取订单出错:', error);
      } finally {
        this.loading = false;
      }
    },
    viewDetail(id, status, serviceType) {
      // 导航到订单详情页面
      uni.navigateTo({
        url: `/pages/order-detail/index?id=${id}&status=${status}&serviceType=${serviceType}`
      });
    },
    startOrder(id) {
      // 模拟开始任务
      uni.showToast({
        title: '任务已开始',
        icon: 'success'
      });
    },
    completeOrder(id) {
      // 模拟完成任务
      uni.showToast({
        title: '任务已完成',
        icon: 'success'
      });
    },
    navigateToHome() {
      const promise = uni.switchTab({
        url: '/pages/index/index'
      });
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    },
    getStatusText(status) {
      const statusMap = {
        unaccepted: '待接取',
        pending: '待处理',
        processing: '进行中',
        completed: '已完成',
        cancelled: '已取消',
        paused: '已暂停'
      };
      return statusMap[status] || '未知状态';
    },
    formatTime(timeStr) {
      if (!timeStr) return '未知时间';
      // 转换时间格式为iOS兼容格式
      const safeTimeStr = timeStr.replace(' ', 'T').replace(/\.(\d+)$/, '');
      const date = new Date(safeTimeStr);
      return date.toLocaleString();
    }
  }
};
</script>

<style scoped>
.my-orders-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 80px;
}

.my-orders-content {
  display: flex;
  flex-direction: column;
}

/* 标签页 */
.tabs {
  display: flex;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e8ec;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab {
  flex: 1;
  padding: 16px;
  text-align: center;
  position: relative;
}

.tab.active {
  color: #1E88E5;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #1E88E5;
  border-radius: 1.5px;
}

.tab-text {
  font-size: 14px;
  font-weight: 600;
}

/* 接单列表 */
.orders-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.order-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c2f32;
  flex: 1;
  margin-right: 12px;
}

.order-status {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  text-transform: uppercase;
}

.order-status.pending {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ff9800;
}

.order-status.processing {
  background-color: rgba(30, 136, 229, 0.1);
  color: #1E88E5;
}

.order-status.completed {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-price {
  font-size: 16px;
  font-weight: 800;
  color: #1E88E5;
}

.order-time {
  font-size: 12px;
  color: #9a9da0;
}

.order-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #1E88E5;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #1E88E5;
  background-color: #ffffff;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: #9a9da0;
  margin-bottom: 24px;
}

.empty-btn {
  padding: 12px 32px;
  background-color: #1E88E5;
  color: #ffffff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
}
</style>