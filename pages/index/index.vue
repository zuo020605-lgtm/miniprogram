<template>
  <scroll-view class="home-page" scroll-y enable-flex>
    <!-- 顶部导航 -->
    <view class="header">
      <view class="campus-selector" @click="showCampusPicker = true">
        <Icon name="school" :size="32" color="var(--color-primary)"></Icon>
        <text class="campus-text">{{ currentCampus }}</text>
        <Icon name="chevron-down" :size="20" color="var(--color-text-2)"></Icon>
      </view>
      <view class="header-actions">
        <view class="notification-btn" @click="navigateToMessage">
          <Icon name="bell" :size="24" color="var(--color-text-1)"></Icon>
          <view class="notification-badge" v-if="unreadCount > 0">{{ unreadCount }}</view>
        </view>
        <view class="user-avatar" @click="navigateToProfile">
          <Icon name="user" :size="24" color="#ffffff"></Icon>
        </view>
      </view>
    </view>

    <!-- 搜索框-->
    <view class="search-section">
      <view class="search-input" :class="{ focused: searchFocused }">
        <Icon name="search" :size="24" color="#9a9da0"></Icon>
        <input 
          type="text" 
          placeholder="搜索校园任务..." 
          v-model="searchKeyword"
          @confirm="handleSearch"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          class="search-input-field"
          confirm-type="search"
        />
        <view class="search-clear" v-if="searchKeyword" @click="clearSearch">
          <Icon name="close" :size="20" color="#9a9da0"></Icon>
        </view>
      </view>
    </view>

    <!-- 功能按钮区-->
    <view class="function-grid">
      <view class="function-item function-item-large" @click="navigateToCampusClass">
        <view class="function-icon-large">
          <Icon name="class" :size="40" color="#ffffff"></Icon>
        </view>
        <view class="function-info">
          <text class="function-title">校园代课</text>
          <text class="function-subtitle">Knowledge exchange</text>
        </view>
      </view>
      <view class="function-item function-item-small" @click="navigateToPublish('campus-errand')">
        <view class="function-icon-container">
          <Icon name="run" :size="36" color="var(--color-primary)"></Icon>
        </view>
        <view class="function-info">
          <text class="function-title function-title-small">校园跑腿</text>
          <text class="function-subtitle function-subtitle-small">Quick errands</text>
        </view>
      </view>
      <view class="function-item function-item-small" @click="navigateToPublish('express')">
        <view class="function-icon-container">
          <Icon name="package" :size="36" color="#4CAF50"></Icon>
        </view>
        <view class="function-info">
          <text class="function-title function-title-small">快递代取</text>
          <text class="function-subtitle function-subtitle-small">Parcel pickup</text>
        </view>
      </view>
      <view class="function-item function-item-full" @click="navigateToPublish('exam')">
        <view class="function-info function-info-full">
          <view class="function-icon-container function-icon-container-large">
            <Icon name="exam" :size="36" color="#FF9800"></Icon>
          </view>
          <view class="function-text-full">
            <text class="function-title">考试代替</text>
            <text class="function-subtitle">Support during finals week</text>
          </view>
        </view>
        <Icon name="arrow-right" :size="24" color="var(--color-text-2)"></Icon>
      </view>
    </view>

    <!-- 热门任务 -->
    <view class="popular-tasks">
      <view class="section-header">
        <text class="section-title">热门任务</text>
        <button class="section-more-btn" @click="navigateToPopularTasks">
          <text>查看全部</text>
        </button>
      </view>
      
      <!-- 骨架屏-->
      <view v-if="loading" class="tasks-scroll">
        <view class="skeleton-task-card" v-for="i in 2" :key="'sk-' + i">
          <view class="skeleton skeleton-task-header">
            <view class="skeleton skeleton-tag"></view>
            <view class="skeleton skeleton-price"></view>
          </view>
          <view class="skeleton skeleton-title" style="width: 80%;"></view>
          <view class="skeleton skeleton-text"></view>
        </view>
      </view>
      
      <!-- 任务列表 -->
      <view v-else class="tasks-scroll">
        <view 
          v-for="order in popularOrders" 
          :key="order._id" 
          class="task-card" 
          @click="navigateToOrderDetail(order._id, order.status, order.serviceType)"
        >
          <view class="task-header">
            <view class="task-tag" :class="getTaskTagClass(order)">
              <text>{{ getTaskTagText(order) }}</text>
            </view>
            <text class="task-price">¥{{ formatPrice(order.price) }}</text>
          </view>
          <text class="task-title">{{ order.title }}</text>
          <view class="task-info">
            <view class="task-info-item">
              <Icon name="location" :size="20" color="var(--color-text-2)"></Icon>
              <text class="task-info-text">{{ getLocationText(order) }}</text>
            </view>
            <view class="task-info-item">
              <Icon name="time" :size="20" color="var(--color-text-2)"></Icon>
              <text class="task-info-text">{{ formatTime(order.startTime || order.createdAt) }}</text>
            </view>
          </view>
        </view>
        
        <!-- 空状态-->
        <view v-if="popularOrders.length === 0" class="empty-container">
          <Icon name="order" :size="64" color="#c4c7ca"></Icon>
          <text class="empty-title">暂无热门任务</text>
          <text class="empty-desc">快来发布第一个任务吧</text>
          <button class="empty-action" @click="navigateToPublish">去发布</button>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import Icon from '@/components/icon/icon.vue';

const STATUS_MAP = {
  unaccepted: { text: '等待接单', cls: 'tag-normal' },
  pending: { text: '已接单', cls: 'tag-new' },
  processing: { text: '服务中', cls: 'tag-warning' },
  completed: { text: '已完成', cls: 'tag-success' },
  cancelled: { text: '已取消', cls: 'tag-muted' },
  paused: { text: '已暂停', cls: 'tag-muted' }
};

export default {
  components: { Icon },
  data() {
    return {
      currentCampus: '北京大学-校本部',
      searchKeyword: '',
      searchFocused: false,
      unreadCount: 0,
      loading: true,
      popularOrders: [],
      showCampusPicker: false
    };
  },
  onLoad() {
    this.loadPopularTasks();
  },
  onPullDownRefresh() {
    this.loadPopularTasks().then(() => {
      uni.stopPullDownRefresh();
    });
  },
  methods: {
    async loadPopularTasks() {
      this.loading = true;
      try {
        const cloud = uniCloud.importObject('order');
        const result = await cloud.getOrderList({ limit: 10 });
        if (result.errCode === 0 && result.data) {
          this.popularOrders = result.data.map(o => ({
            ...o,
            price: parseFloat(o.price) || 0
          }));
        } else {
          console.error('加载任务失败:', result.errMsg);
          this.popularOrders = [];
          uni.showToast({
            title: result.errMsg || '加载任务失败',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (err) {
        console.error('加载任务异常:', err);
        this.popularOrders = [];
        uni.showToast({
          title: '网络连接失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.loading = false;
      }
    },
    
    handleSearch() {
      if (this.searchKeyword.trim()) {
        uni.navigateTo({
          url: `/pages/popular-tasks/index?keyword=${encodeURIComponent(this.searchKeyword)}`
        });
      }
    },
    
    clearSearch() {
      this.searchKeyword = '';
    },
    
    navigateToCampusClass() {
      this._safeNavigate('/pages/campus-class/index', 'navigateTo');
    },
    
    navigateToPublish(type) {
      this._safeNavigate(`/pages/publish/index?type=${type || ''}`, 'navigateTo');
    },
    
    navigateToPopularTasks() {
      this._safeNavigate('/pages/popular-tasks/index', 'navigateTo');
    },
    
    navigateToOrderDetail(id, status, serviceType) {
      this._safeNavigate(
        `/pages/order-detail/index?id=${id}&status=${status}&serviceType=${serviceType || 'campusErrand'}`,
        'navigateTo'
      );
    },
    
    navigateToMessage() {
      this._safeNavigate('/pages/message/index', 'switchTab');
    },
    
    navigateToProfile() {
      this._safeNavigate('/pages/profile/index', 'switchTab');
    },
    
    _safeNavigate(url, type = 'navigateTo') {
      const navigatePromise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('导航超时'));
        }, 5000);
        
        const config = {
          url,
          success: () => {
            clearTimeout(timeoutId);
            resolve();
          },
          fail: (err) => {
            clearTimeout(timeoutId);
            reject(err);
          }
        };
        
        if (type === 'navigateTo') {
          uni.navigateTo(config);
        } else if (type === 'switchTab') {
          uni.switchTab(config);
        }
      });
      
      navigatePromise.catch(err => {
        console.error('导航失败:', err);
        uni.showToast({
          title: '页面加载失败，请重试',
          icon: 'none',
          duration: 2000
        });
      });
    },
    
    formatPrice(price) {
      return price.toFixed(2);
    },
    
    formatTime(timeStr) {
      if (!timeStr) return '未知时间';
      try {
        const date = new Date(timeStr.replace(' ', 'T'));
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) {
          return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      } catch {
        return '未知时间';
      }
    },
    
    getLocationText(order) {
      if (order.pickupLocation && order.deliveryLocation) {
        return order.pickupLocation + ' -> ' + order.deliveryLocation;
      }
      return order.location || '地点待定';
    },
    
    getTaskTagClass(order) {
      return (STATUS_MAP[order.status] || {}).cls || 'tag-muted';
    },

    getTaskTagText(order) {
      return (STATUS_MAP[order.status] || {}).text || '未知';
    },
    

  }
};
</script>

<style scoped>
/* ============ 页面容器 ============ */
.home-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(to bottom, #ffffff 0%, #f8f9fc 50%, #f0f2f7 100%);
  display: block;
  flex: 1;
  overflow-y: auto;
}

/* ============ 顶部导航 ============ */
.header {
  position: sticky;
  top: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 24rpx;
  padding-top: calc(var(--status-bar-height, 44rpx) + 8rpx);
  min-height: 88rpx;
  background: #fff;
  box-sizing: border-box;
  border-bottom: 1rpx solid var(--color-divider);
  flex-wrap: nowrap;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.campus-selector {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.campus-text {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--color-text-1);
  max-width: 180rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.notification-btn {
  position: relative;
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.notification-btn:active {
  background: #f0f0f0;
}

.notification-badge {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  min-width: 24rpx;
  height: 24rpx;
  border-radius: 12rpx;
  background: #ef4444;
  color: #fff;
  font-size: 14rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
}

.user-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.user-avatar:active {
  opacity: 0.8;
}

/* ============ 搜索框 ============ */
.search-section {
  background-color: var(--color-surface);
  padding: 12rpx 24rpx 20rpx;
}

.search-input {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid var(--color-divider);
  transition: var(--transition-fast);
}

.search-input.focused {
  border-color: var(--color-primary);
  box-shadow: 0 4rpx 16rpx rgba(21, 101, 192, 0.15);
}

.search-input-field {
  flex: 1;
  font-size: 24rpx;
  color: var(--color-text-1);
  height: 44rpx;
  line-height: 44rpx;
}

.search-input-field::placeholder {
  color: #9a9da0;
}

.search-clear {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ============ 功能网格 ============ */
.function-grid {
  padding: 20rpx 24rpx;
  background-color: transparent;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 12rpx;
}

.function-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  transition: var(--transition-fast);
  border: 1rpx solid var(--color-divider);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.function-item:active {
  transform: scale(0.96);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* 左侧大按钮 - 校园代课 */
.function-item-large {
  grid-row: 1 / 3;
  grid-column: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1155AA 100%);
  border: none;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(21, 101, 192, 0.2);
  padding: 24rpx;
}

.function-item-large .function-title {
  color: #fff;
}

.function-item-large .function-subtitle {
  color: rgba(255, 255, 255, 0.9);
}

.function-icon-large {
  width: 60rpx;
  height: 60rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

/* 右侧两个小按钮 */
.function-item-small {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%);
  border-radius: 20rpx;
  padding: 20rpx;
  border: 2rpx solid #e8ecf1;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: var(--transition-fast);
}

.function-item-small:active {
  transform: scale(0.96);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.function-icon-container {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.function-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  flex: 1;
}

.function-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.function-title-small {
  font-size: 26rpx;
  color: var(--color-text-1);
  font-weight: 700;
}

.function-subtitle {
  font-size: 16rpx;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.2;
}

.function-subtitle-small {
  font-size: 14rpx;
  color: var(--color-text-2);
}

/* 底部全宽按钮 - 考试代替 */
.function-item-full {
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 2rpx solid #ffcc80;
  box-shadow: 0 4rpx 16rpx rgba(255, 152, 0, 0.15);
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  transition: var(--transition-fast);
}

.function-item-full:active {
  transform: scale(0.96);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.function-item-full .function-title {
  color: var(--color-text-1);
}

.function-item-full .function-subtitle {
  color: var(--color-text-2);
}

.function-info-full {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.function-text-full {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.function-icon-container-large {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFE8D6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ============ 热门任务 ============ */
.popular-tasks {
  padding: 24rpx;
  background-color: transparent;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  width: 100%;
}

.section-title {
  flex: 1;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--color-text-1);
}

.section-more-btn {
  display: inline-block;
  padding: 8rpx 16rpx;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: 600;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  transition: var(--transition-fast);
  box-shadow: 0 2rpx 8rpx rgba(21, 101, 192, 0.1);
}

.section-more-btn:active {
  opacity: 0.8;
}

.tasks-scroll {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* ============ 任务卡片 ============ */
.task-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid var(--color-divider);
  transition: var(--transition-fast);
}

.task-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.task-tag {
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  font-size: 16rpx;
  font-weight: 600;
  white-space: nowrap;
}

.tag-urgent {
  background: #fef2f2;
  color: #ef4444;
}

.tag-new {
  background: #eff6ff;
  color: var(--color-primary);
}

.tag-normal {
  background: #f0fdf4;
  color: #22c55e;
}

.tag-warning {
  background: #fff7ed;
  color: #f97316;
}

.tag-success {
  background: #dcfce7;
  color: #16a34a;
}

.tag-muted {
  background: #f5f5f5;
  color: var(--color-text-2);
}

.task-price {
  font-size: 32rpx;
  font-weight: 800;
  color: var(--color-primary);
}

.task-title {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-top: 12rpx;
}

.task-info-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.task-info-text {
  font-size: 20rpx;
  color: var(--color-text-2);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============ 空状态 ============ */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 48rpx;
  text-align: center;
}

.empty-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--color-text-1);
  margin: 24rpx 0 12rpx;
}

.empty-desc {
  font-size: 20rpx;
  color: var(--color-text-2);
  margin-bottom: 32rpx;
}

.empty-action {
  padding: 16rpx 40rpx;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1155AA 100%);
  color: #fff;
  border: none;
  border-radius: 32rpx;
  font-size: 22rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(21, 101, 192, 0.2);
  transition: var(--transition-fast);
}

.empty-action:active {
  opacity: 0.9;
}

/* ============ 骨架屏 ============ */
.skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12rpx;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-task-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  border: 1rpx solid var(--color-divider);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.skeleton-task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.skeleton-tag {
  width: 80rpx;
  height: 32rpx;
}

.skeleton-price {
  width: 100rpx;
  height: 32rpx;
}

.skeleton-title {
  height: 28rpx;
  margin-bottom: 12rpx;
  width: 80%;
}

.skeleton-text {
  height: 20rpx;
  width: 60%;
}
</style>