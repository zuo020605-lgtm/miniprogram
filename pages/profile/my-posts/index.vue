<template>
  <view class="page-container">
    <!-- 标签切换 -->
    <view class="tab-nav">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'unaccepted' }"
        @click="switchTab('unaccepted')"
      >
        <text class="tab-label">待接取</text>
        <view class="tab-count" v-if="tabCounts.unaccepted > 0">{{ tabCounts.unaccepted }}</view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'processing' }"
        @click="switchTab('processing')"
      >
        <text class="tab-label">进行中</text>
        <view class="tab-count processing" v-if="tabCounts.processing > 0">{{ tabCounts.processing }}</view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'completed' }"
        @click="switchTab('completed')"
      >
        <text class="tab-label">已完成</text>
        <view class="tab-count done" v-if="tabCounts.completed > 0">{{ tabCounts.completed }}</view>
      </view>
    </view>

    <!-- 加载骨架屏 -->
    <view v-if="isLoading" class="skeleton-container">
      <view class="skeleton skeleton-card" v-for="n in 3" :key="n"></view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="displayOrders.length === 0" class="empty-container">
      <view class="empty-visual">
        <Icon name="order" :size="56" color="#d1d5db"></Icon>
      </view>
      <text class="empty-title">{{ emptyTitle }}</text>
      <text class="empty-desc">{{ emptyDesc }}</text>
      <button class="empty-action" v-if="currentTab === 'unaccepted'" @click="goPublish">
        <Icon name="add" :size="16" color="#fff"></Icon>
        <text>发布任务</text>
      </button>
    </view>

    <!-- 订单列表 -->
    <scroll-view 
      v-else 
      scroll-y 
      class="order-scroll"
      @scrolltolower="loadMore"
    >
      <view class="order-list">
        <view 
          class="order-card"
          v-for="order in displayOrders"
          :key="order._id"
          @click="openDetail(order)"
        >
          <!-- 卡片头部 -->
          <view class="card-header">
            <view class="service-badge" :class="badgeClass(order.serviceType)">
              <Icon :name="serviceIcon(order.serviceType)" :size="18" :color="badgeColor(order.serviceType)"></Icon>
            </view>
            <view class="card-title-wrap">
              <text class="card-title">{{ order.title || '未命名任务' }}</text>
              <view class="card-meta">
                <Icon name="time" :size="11" color="#9ca3af"></Icon>
                <text class="meta-text">{{ timeAgo(order.createdAt) }}</text>
              </view>
            </view>
            <view class="card-price">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ formatPrice(order.price) }}</text>
            </view>
          </view>

          <!-- 卡片内容 -->
          <view class="card-body">
            <view class="location-row">
              <Icon name="location" :size="12" color="#9ca3af"></Icon>
              <text class="location-text">{{ locationInfo(order) }}</text>
            </view>
          </view>

          <!-- 卡片操作 -->
          <view class="card-footer">
            <button class="card-btn secondary" @click.stop="openDetail(order)">
              <Icon name="order" :size="14" color="#3b82f6"></Icon>
              <text>查看详情</text>
            </button>
            <button 
              class="card-btn danger" 
              v-if="currentTab === 'unaccepted'"
              @click.stop="handleCancel(order)"
            >
              <Icon name="close" :size="14" color="#ef4444"></Icon>
              <text>取消</text>
            </button>
            <button 
              class="card-btn primary" 
              v-if="currentTab === 'completed'"
              @click.stop="handleRepost(order)"
            >
              <Icon name="refresh" :size="14" color="#fff"></Icon>
              <text>再来一单</text>
            </button>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore">
        <text class="load-text">{{ loadingMore ? '加载中...' : '上拉加载更多' }}</text>
      </view>
      
      <!-- 底部安全区 -->
      <view class="safe-area"></view>
    </scroll-view>
  </view>
</template>

<script>
import Icon from '@/components/icon/icon.vue';

export default {
  components: { Icon },
  data() {
    return {
      currentTab: 'unaccepted',
      allOrders: [],
      isLoading: true,
      loadingMore: false,
      hasMore: false,
      pageSize: 20,
      showingLoading: false
    };
  },
  
  computed: {
    // 根据当前tab筛选订单
    displayOrders() {
      return this.allOrders.filter(order => {
        if (this.currentTab === 'unaccepted') {
          return order.status === 'unaccepted';
        } else if (this.currentTab === 'processing') {
          return ['pending', 'processing', 'paused'].includes(order.status);
        } else if (this.currentTab === 'completed') {
          return ['completed', 'cancelled'].includes(order.status);
        }
        return false;
      });
    },
    
    // 各分类数量统计
    tabCounts() {
      return {
        unaccepted: this.allOrders.filter(o => o.status === 'unaccepted').length,
        processing: this.allOrders.filter(o => ['pending', 'processing', 'paused'].includes(o.status)).length,
        completed: this.allOrders.filter(o => ['completed', 'cancelled'].includes(o.status)).length
      };
    },
    
    emptyTitle() {
      const titles = {
        unaccepted: '暂无待接单任务',
        processing: '暂无进行中任务',
        completed: '暂无已完成任务'
      };
      return titles[this.currentTab] || '暂无任务';
    },
    
    emptyDesc() {
      const descs = {
        unaccepted: '发布的任务将在这里显示',
        processing: '进行中的任务将在这里显示',
        completed: '已完成的任务将在这里显示'
      };
      return descs[this.currentTab] || '';
    }
  },
  
  onLoad() {
    this.fetchMyOrders();
  },
  
  onShow() {
    this.fetchMyOrders();
  },
  
  onPullDownRefresh() {
    this.fetchMyOrders().finally(() => uni.stopPullDownRefresh());
  },
  
  methods: {
    async fetchMyOrders() {
      this.isLoading = true;
      try {
        // 获取当前用户ID（从全局状态或本地存储）
        const uid = uni.getStorageSync('userId') || 'test_user';
        
        const cloud = uniCloud.importObject('order');
        const result = await this.withTimeout(cloud.getMyOrders(uid, { limit: 100 }), 12000);
        
        if (result.errCode === 0 && result.data) {
          this.allOrders = result.data.map(o => ({
            ...o,
            price: parseFloat(o.price) || 0,
            status: o.status || 'unaccepted'
          }));
        } else {
          // 如果云数据库没有数据，保持空数组
          this.allOrders = [];
          uni.showToast({
            title: '暂无订单数据',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (err) {
        console.error('获取订单失败:', err);
        // 网络错误时保持空数组
        this.allOrders = [];
        uni.showToast({
          title: err.message?.includes('超时') ? '网络超时，请重试' : '加载失败，请检查网络',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    withTimeout(promise, ms) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('网络超时')), ms);
        promise
          .then(res => { clearTimeout(timer); resolve(res); })
          .catch(err => { clearTimeout(timer); reject(err); });
      });
    },
    
    switchTab(tab) {
      this.currentTab = tab;
    },
    
    loadMore() {
      // 分页加载逻辑（如果需要）
    },
    
    serviceIcon(type) {
      const icons = {
        campusErrand: 'run',
        packageDelivery: 'package',
        examTaking: 'file',
        classAttendance: 'book'
      };
      return icons[type] || 'order';
    },
    
    badgeClass(type) {
      const classes = {
        campusErrand: 'badge-blue',
        packageDelivery: 'badge-green',
        examTaking: 'badge-orange',
        classAttendance: 'badge-purple'
      };
      return classes[type] || 'badge-blue';
    },
    
    badgeColor(type) {
      const colors = {
        campusErrand: '#3b82f6',
        packageDelivery: '#22c55e',
        examTaking: '#f97316',
        classAttendance: '#a855f7'
      };
      return colors[type] || '#3b82f6';
    },
    
    formatPrice(price) {
      return (parseFloat(price) || 0).toFixed(2);
    },
    
    timeAgo(timestamp) {
      if (!timestamp) return '未知';
      try {
        const date = new Date(timestamp.replace ? timestamp.replace(' ', 'T') : timestamp);
        const now = Date.now();
        const diff = now - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return '刚刚';
        if (mins < 60) return `${mins}分钟前`;
        if (mins < 1440) return `${Math.floor(mins / 60)}小时前`;
        if (mins < 43200) return `${Math.floor(mins / 1440)}天前`;
        return `${Math.floor(mins / 43200)}个月前`;
      } catch {
        return '未知';
      }
    },
    
    locationInfo(order) {
      if (order.pickupLocation && order.deliveryLocation) {
        return `${order.pickupLocation} → ${order.deliveryLocation}`;
      }
      if (order.teachingBuilding) {
        return `${order.teachingBuilding} ${order.examClassroom || order.classroom || ''}`;
      }
      return '待确认地点';
    },
    
    openDetail(order) {
      uni.navigateTo({
        url: `/pages/order-detail/index?id=${order._id}&status=${order.status}&serviceType=${order.serviceType || 'campusErrand'}`
      }).catch(() => {});
    },
    
    goBack() {
      uni.navigateBack().catch(() => {
        uni.switchTab({ url: '/pages/profile/index' });
      });
    },
    
    goPublish() {
      uni.navigateTo({ url: '/pages/publish/index' }).catch(() => {});
    },
    
    handleCancel(order) {
      uni.showModal({
        title: '取消订单',
        content: '确定要取消此订单吗？',
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '取消中...' });
            this.showingLoading = true;
            try {
              const cloud = uniCloud.importObject('order');
              const result = await this.withTimeout(
                cloud.updateOrderStatus(order._id, 'cancelled'),
                10000
              );
              
              if (result.errCode === 0) {
                uni.showToast({ title: '已取消', icon: 'success' });
                await this.fetchMyOrders();
              } else {
                uni.showToast({ title: result.errMsg || '取消失败', icon: 'none' });
              }
            } catch (err) {
              uni.showToast({
                title: err.message?.includes('超时') ? '操作超时' : '网络异常',
                icon: 'none'
              });
            } finally {
              if (this.showingLoading) {
                uni.hideLoading();
                this.showingLoading = false;
              }
            }
          }
        }
      });
    },
    
    handleRepost(order) {
      uni.navigateTo({
        url: `/pages/publish/index?type=${order.serviceType || 'campusErrand'}`
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
/* 页面容器 - 防止溢出 */
page { overflow-x: hidden; }
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  padding-top: 0;
}



/* 标签导航 */
.tab-nav {
  display: flex;
  background: #fff;
  padding: 0 16rpx;
  border-bottom: 1rpx solid rgba(0,0,0,0.05);
}
.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 28rpx 0;
  position: relative;
}
.tab-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #6b7280;
  transition: color 0.2s ease;
}
.tab-item.active .tab-label {
  color: #1a1a1a;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 3rpx;
}
.tab-count {
  min-width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
}
.tab-count.processing {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}
.tab-count.done {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
}

/* 骨架屏 */
.skeleton-container {
  padding: 24rpx;
}
.skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 20rpx;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skeleton-card {
  height: 280rpx;
  margin-bottom: 24rpx;
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx;
  text-align: center;
}
.empty-visual {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}
.empty-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #374151;
  margin-bottom: 12rpx;
}
.empty-desc {
  font-size: 26rpx;
  color: #9ca3af;
  margin-bottom: 40rpx;
}
.empty-action {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: #fff;
  border: none;
  border-radius: 48rpx;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 32rpx rgba(59, 130, 246, 0.35);
  transition: transform 0.15s ease;
}
.empty-action:active {
  transform: scale(0.96);
}

/* 订单列表 */
.order-scroll {
  flex: 1;
  height: calc(100vh - 200rpx);
}
.order-list {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 订单卡片 - 高级感设计 */
.order-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}
.order-card:active {
  transform: scale(0.985);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.service-badge {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.badge-blue { background: linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.08) 100%); }
.badge-green { background: linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.08) 100%); }
.badge-orange { background: linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.08) 100%); }
.badge-purple { background: linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.08) 100%); }

.card-title-wrap {
  flex: 1;
  min-width: 0;
}
.card-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 6rpx;
}
.meta-text {
  font-size: 22rpx;
  color: #9ca3af;
}

.card-price {
  display: flex;
  align-items: baseline;
  flex-shrink: 0;
}
.price-symbol {
  font-size: 24rpx;
  font-weight: 600;
  color: #3b82f6;
}
.price-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #3b82f6;
  letter-spacing: -1rpx;
}

.card-body {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 14rpx;
  padding: 18rpx 20rpx;
  margin-bottom: 20rpx;
}
.location-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.location-text {
  font-size: 24rpx;
  color: #6b7280;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  gap: 16rpx;
}
.card-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 76rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 600;
  border: none;
  transition: all 0.15s ease;
}
.card-btn:active {
  transform: scale(0.97);
}
.card-btn.secondary {
  background: #fff;
  color: #3b82f6;
  border: 2rpx solid #e5e7eb;
}
.card-btn.danger {
  background: #fff;
  color: #ef4444;
  border: 2rpx solid #fecaca;
}
.card-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.3);
}

.load-more {
  padding: 32rpx;
  text-align: center;
}
.load-text {
  font-size: 24rpx;
  color: #9ca3af;
}

.safe-area {
  height: 120rpx;
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .page-container {
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  }
  .app-header {
    background: #1e293b;
    border-bottom-color: rgba(255,255,255,0.1);
  }
  .header-title { color: #f1f5f9; }
  .tab-nav {
    background: #1e293b;
    border-bottom-color: rgba(255,255,255,0.1);
  }
  .tab-label { color: #9ca3af; }
  .tab-item.active .tab-label { color: #f1f5f9; }
  .order-card { background: #1e293b; }
  .card-title { color: #f1f5f9; }
  .card-body { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
  .location-text { color: #9ca3af; }
  .empty-visual { background: linear-gradient(135deg, #334155 0%, #1e293b 100%); }
}
</style>