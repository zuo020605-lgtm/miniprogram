<template>
  <view class="page-container order-page">
    <!-- 订单状态选项卡 -->
    <view class="order-tabs">
      <scroll-view scroll-x class="tabs-scroll" :enable-flex="false">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === tab.key }" 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="switchTab(tab.key)"
        >
          <text class="tab-text">{{ tab.label }}</text>
          <view class="tab-badge" v-if="tab.count > 0">{{ tab.count }}</view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 订单列表 -->
    <scroll-view 
      scroll-y 
      class="order-list-scroll"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 骨架屏 -->
      <view v-if="loading && orders.length === 0" class="order-list">
        <view class="skeleton-order-item" v-for="i in 5" :key="'sk-' + i">
          <view class="skeleton skeleton-order-header">
            <view class="skeleton skeleton-status"></view>
            <view class="skeleton skeleton-time"></view>
          </view>
          <view class="skeleton-order-body">
            <view class="skeleton skeleton-type"></view>
            <view class="skeleton skeleton-amount"></view>
          </view>
          <view class="skeleton-order-footer">
            <view class="skeleton skeleton-id"></view>
          </view>
        </view>
      </view>
      
      <!-- 订单列表内容 -->
      <view v-else class="order-list">
        <view 
          class="order-item" 
          v-for="order in filteredOrders" 
          :key="order._id" 
          @click="navigateToOrderDetail(order)"
        >
          <!-- 订单头部 -->
          <view class="order-header">
            <view class="order-status-wrapper">
              <view class="order-status-dot" :class="'status-' + order.status"></view>
              <text class="order-status" :class="'status-' + order.status">{{ getStatusText(order.status) }}</text>
            </view>
            <text class="order-time">{{ formatTime(order.createdAt) }}</text>
          </view>
          
          <!-- 订单主体 -->
          <view class="order-body">
            <view class="order-info">
              <view class="order-type-wrapper">
                <Icon :name="getServiceIcon(order.serviceType)" :size="40" color="#1E88E5"></Icon>
                <text class="order-type">{{ getServiceTypeName(order.serviceType) }}</text>
              </view>
              <text class="order-amount">¥{{ formatPrice(order.price) }}</text>
            </view>
            
            <view class="order-details">
              <view class="detail-row" v-if="order.pickupLocation">
                <Icon name="location" :size="32" color="#9a9da0"></Icon>
                <text class="detail-label">取货：</text>
                <text class="detail-value">{{ order.pickupLocation }}</text>
              </view>
              <view class="detail-row" v-if="order.deliveryLocation">
                <Icon name="location" :size="32" color="#9a9da0"></Icon>
                <text class="detail-label">送达：</text>
                <text class="detail-value">{{ order.deliveryLocation }}</text>
              </view>
              <view class="detail-row" v-if="order.teachingBuilding">
                <Icon name="school" :size="32" color="#9a9da0"></Icon>
                <text class="detail-label">地点：</text>
                <text class="detail-value">{{ order.teachingBuilding }} {{ order.examClassroom || '' }}</text>
              </view>
            </view>
            
            <!-- 接单人信息 -->
            <view class="order-courier" v-if="order.courierNickname">
              <view class="courier-avatar">
                <text class="avatar-text">{{ order.courierNickname.charAt(0) }}</text>
              </view>
              <text class="courier-name">{{ order.courierNickname }}</text>
              <text class="courier-badge">接单员</text>
            </view>
          </view>
          
          <!-- 订单底部 -->
          <view class="order-footer">
            <text class="order-id">订单编号：{{ order.orderNo || order._id }}</text>
            <view class="order-actions" @click.stop>
              <button 
                class="action-btn" 
                v-if="order.status === 'unaccepted'" 
                @click="cancelOrder(order)"
              >取消</button>
              <button 
                class="action-btn primary" 
                v-if="order.status === 'unaccepted'" 
                @click="editOrder(order)"
              >修改</button>
            </view>
          </view>
        </view>
        
        <!-- 加载更多 -->
        <view class="load-more" v-if="orders.length > 0 && hasMore && !loading">
          <view class="loading-spinner"></view>
          <text class="load-more-text">加载中...</text>
        </view>
        
        <!-- 没有更多 -->
        <view class="no-more" v-if="orders.length > 0 && !hasMore && !loading">
          <text class="no-more-text">没有更多订单了</text>
        </view>
        
        <!-- 空状态 -->
        <view class="empty-state" v-if="!loading && filteredOrders.length === 0">
          <Icon :name="getEmptyIcon()" :size="64" color="#c4c7ca"></Icon>
          <text class="empty-title">{{ getEmptyTitle() }}</text>
          <text class="empty-desc" v-if="activeTab === 'all'">快去发布第一个任务吧</text>
          <button 
            class="empty-action" 
            v-if="activeTab === 'all'" 
            @click="navigateToPublish"
          >去发布</button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import Icon from '@/components/icon/icon.vue';

export default {
  components: { Icon },
  data() {
    return {
      activeTab: 'all',
      tabs: [
        { key: 'all', label: '全部', count: 0 },
        { key: 'pending', label: '待支付', count: 0 },
        { key: 'unaccepted', label: '待接取', count: 0 },
        { key: 'service', label: '待服务', count: 0 },
        { key: 'completed', label: '已完成', count: 0 }
      ],
      orders: [],
      loading: true,
      isRefreshing: false,
      hasMore: true,
      page: 1,
      pageSize: 20
    };
  },
  created() {
    this.$cloud = uniCloud.importObject('order');
  },
  computed: {
    filteredOrders() {
      if (this.activeTab === 'all') {
        return this.orders;
      }
      
      const statusMap = {
        pending: ['pending'],
        unaccepted: ['unaccepted'],
        service: ['pending', 'processing', 'paused'],
        completed: ['completed', 'cancelled']
      };
      
      const targetStatuses = statusMap[this.activeTab] || [];
      return this.orders.filter(order => targetStatuses.includes(order.status));
    }
  },
  onLoad() {
    this.getOrders();
  },
  onShow() {
    // 避免与 onLoad 重复请求
  },
  methods: {
    async getOrders() {
      this.loading = true;
      try {
        const result = await this.$cloud.getOrderList({ 
          limit: this.pageSize,
          skip: (this.page - 1) * this.pageSize
        });
        
        if (result.errCode === 0) {
          const newOrders = result.data.map(order => ({
            ...order,
            price: this.parsePrice(order.price),
            orderNo: order.orderNo || '',
            userNickname: order.userNickname || '',
            courierNickname: order.courierNickname || '',
            orderStatus: order.orderStatus || 'waitingAccept',
            status: order.status || 'unaccepted'
          }));
          
          if (this.page === 1) {
            this.orders = newOrders;
          } else {
            this.orders = [...this.orders, ...newOrders];
          }
          
          this.hasMore = newOrders.length >= this.pageSize;
          this.updateTabCounts();
        } else {
          uni.showToast({ title: result.errMsg || '获取订单失败', icon: 'none' });
        }
      } catch (error) {
        console.error('获取订单出错:', error);
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
      } finally {
        this.loading = false;
        this.isRefreshing = false;
      }
    },
    
    async loadMore() {
      if (this.loading || !this.hasMore) return;
      
      this.page++;
      await this.getOrders();
    },
    
    async onRefresh() {
      this.isRefreshing = true;
      this.page = 1;
      await this.getOrders();
    },
    
    switchTab(key) {
      this.activeTab = key;
    },
    
    updateTabCounts() {
      // 更新各状态订单数量
      this.tabs = this.tabs.map(tab => {
        let count = 0;
        if (tab.key === 'all') {
          count = this.orders.length;
        } else if (tab.key === 'pending') {
          count = this.orders.filter(o => o.status === 'pending').length;
        } else if (tab.key === 'unaccepted') {
          count = this.orders.filter(o => o.status === 'unaccepted').length;
        } else if (tab.key === 'service') {
          count = this.orders.filter(o => ['pending', 'processing', 'paused'].includes(o.status)).length;
        } else if (tab.key === 'completed') {
          count = this.orders.filter(o => ['completed', 'cancelled'].includes(o.status)).length;
        }
        return { ...tab, count };
      });
    },
    
    navigateToOrderDetail(order) {
      uni.navigateTo({
        url: `/pages/order-detail/index?id=${order._id}&status=${order.status}&serviceType=${order.serviceType}`
      }).catch(err => {
        uni.showToast({ title: '页面跳转失败', icon: 'none' });
      });
    },
    
    navigateToPublish() {
      uni.navigateTo({ url: '/pages/publish/index' }).catch(err => {
        uni.showToast({ title: '页面跳转失败', icon: 'none' });
      });
    },
    
    cancelOrder(order) {
      uni.showModal({
        title: '取消订单',
        content: '确定要取消这个订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await this.$cloud.updateOrderStatus(order._id, 'cancelled');
              
              if (result.errCode === 0) {
                uni.showToast({ title: '订单已取消', icon: 'success' });
                this.getOrders();
              } else {
                uni.showToast({ title: result.errMsg || '取消失败', icon: 'none' });
              }
            } catch (error) {
              uni.showToast({ title: '网络异常', icon: 'none' });
            }
          }
        }
      });
    },
    
    editOrder(order) {
      uni.navigateTo({
        url: `/pages/publish/index?id=${order._id}&type=${order.serviceType}`
      }).catch(err => {
        uni.showToast({ title: '页面跳转失败', icon: 'none' });
      });
    },
    
    // 格式化方法
    parsePrice(price) {
      return typeof price === 'number' ? price : parseFloat(price) || 0;
    },
    
    formatPrice(price) {
      return price.toFixed(2);
    },
    
    formatTime(timeStr) {
      if (!timeStr) return '未知时间';
      const safeTimeStr = timeStr.replace(' ', 'T').replace(/\.(\d+)$/, '');
      const date = new Date(safeTimeStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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
    
    getServiceTypeName(serviceType) {
      const typeMap = {
        campusErrand: '校园跑腿',
        packageDelivery: '快递代取',
        examTaking: '考试代替',
        classAttendance: '校园代课'
      };
      return typeMap[serviceType] || '未知服务';
    },
    
    getServiceIcon(serviceType) {
      const iconMap = {
        campusErrand: 'run',
        packageDelivery: 'package',
        examTaking: 'exam',
        classAttendance: 'class'
      };
      return iconMap[serviceType] || 'order';
    },
    
    getEmptyIcon() {
      const iconMap = {
        all: 'order',
        pending: 'wallet',
        unaccepted: 'time',
        service: 'run',
        completed: 'check'
      };
      return iconMap[this.activeTab] || 'order';
    },
    
    getEmptyTitle() {
      const titleMap = {
        all: '暂无订单',
        pending: '暂无待支付订单',
        unaccepted: '暂无待接取订单',
        service: '暂无待服务订单',
        completed: '暂无已完成订单'
      };
      return titleMap[this.activeTab] || '暂无数据';
    }
  }
};
</script>

<style scoped>
/* 骨架屏样式 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8rpx;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-order-item {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.skeleton-order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f2f5;
}

.skeleton-status {
  width: 100rpx;
  height: 32rpx;
  border-radius: 8rpx;
}

.skeleton-time {
  width: 160rpx;
  height: 24rpx;
}

.skeleton-order-body {
  margin-bottom: 24rpx;
}

.skeleton-type {
  width: 160rpx;
  height: 32rpx;
  margin-bottom: 16rpx;
}

.skeleton-amount {
  width: 100rpx;
  height: 32rpx;
  margin-left: auto;
}

.skeleton-order-footer {
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f2f5;
}

.skeleton-id {
  width: 300rpx;
  height: 24rpx;
}

/* 主页面样式 */
.order-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.page-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* 选项卡样式 */
.order-tabs {
  background-color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  overflow-x: auto;
  overflow-y: hidden;
}

.tabs-scroll {
  white-space: nowrap;
  padding: 0 24rpx;
  display: flex;
  flex-direction: row;
  min-width: 100%;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  padding: 28rpx 32rpx;
  position: relative;
  transition: all 0.3s ease;
}

.tab-text {
  font-size: 28rpx;
  color: #9a9da0;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-item.active .tab-text {
  color: #1E88E5;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 32rpx;
  height: 6rpx;
  background-color: #1E88E5;
  border-radius: 3rpx;
}

.tab-badge {
  margin-left: 8rpx;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  background-color: #ff4757;
  color: #ffffff;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
  font-weight: 600;
}

/* 订单列表 */
.order-list-scroll {
  flex: 1;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.order-list {
  padding: 24rpx;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
}

.order-item {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.order-item:active {
  transform: scale(0.98);
  background-color: #f8f9fa;
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f2f5;
}

.order-status-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.order-status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
}

.order-status-dot.status-unaccepted { background-color: #9a9da0; }
.order-status-dot.status-pending { background-color: #ff9800; }
.order-status-dot.status-processing { background-color: #1E88E5; }
.order-status-dot.status-completed { background-color: #4CAF50; }
.order-status-dot.status-cancelled { background-color: #F44336; }
.order-status-dot.status-paused { background-color: #9E9D9F; }

.order-status {
  font-size: 26rpx;
  font-weight: 600;
}

.order-status.status-unaccepted { color: #6B7280; }
.order-status.status-pending { color: #ff9800; }
.order-status.status-processing { color: #1E88E5; }
.order-status.status-completed { color: #4CAF50; }
.order-status.status-cancelled { color: #F44336; }
.order-status.status-paused { color: #9E9D9F; }

.order-time {
  font-size: 24rpx;
  color: #9a9da0;
}

/* 订单主体 */
.order-body {
  margin-bottom: 24rpx;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.order-type-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.order-type {
  font-size: 30rpx;
  font-weight: 600;
  color: #2c2f32;
}

.order-amount {
  font-size: 32rpx;
  font-weight: 800;
  color: #1565C0;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.detail-label {
  font-size: 24rpx;
  color: #9a9da0;
  flex-shrink: 0;
}

.detail-value {
  font-size: 24rpx;
  color: #6c757d;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 接单人信息 */
.order-courier {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 16rpx;
}

.courier-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background-color: #1E88E5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.courier-avatar .avatar-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 600;
}

.courier-name {
  font-size: 26rpx;
  color: #2c2f32;
  font-weight: 500;
}

.courier-badge {
  font-size: 20rpx;
  color: #1E88E5;
  background-color: rgba(30, 136, 229, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  margin-left: auto;
}

/* 订单底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f2f5;
}

.order-id {
  font-size: 22rpx;
  color: #9a9da0;
}

.order-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 32rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: 1rpx solid #e5e8ec;
  background-color: #ffffff;
  color: #6c757d;
  transition: all 0.3s ease;
}

.action-btn.primary {
  border-color: #1E88E5;
  color: #1E88E5;
}

.action-btn:active {
  transform: scale(0.95);
  opacity: 0.8;
}

/* 加载更多 */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  gap: 16rpx;
}

.loading-spinner {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid #e5e8ec;
  border-top-color: #1E88E5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.load-more-text {
  font-size: 24rpx;
  color: #9a9da0;
}

/* 没有更多 */
.no-more {
  text-align: center;
  padding: 32rpx;
}

.no-more-text {
  font-size: 24rpx;
  color: #c4c7ca;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
  text-align: center;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #9a9da0;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #c4c7ca;
  margin-bottom: 48rpx;
}

.empty-action {
  padding: 20rpx 64rpx;
  background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
  color: #ffffff;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.empty-action:active {
  transform: scale(0.95);
  opacity: 0.9;
}
</style>
