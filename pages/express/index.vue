<template>
  <view class="express-page">
    <view class="header">
      <text class="header-title">快递代取</text>
    </view>
    <view class="search-section">
      <view class="search-input">
        <Icon name="search" :size="16" color="#9a9da0"></Icon>
        <input type="text" placeholder="搜索快递任务..." class="search-text" />
      </view>
    </view>
    <view class="filter-section">
      <view class="filter-item active"><text>全部</text></view>
      <view class="filter-item"><text>顺丰</text></view>
      <view class="filter-item"><text>京东</text></view>
      <view class="filter-item"><text>其他</text></view>
    </view>
    <view class="task-list">
      <view class="task-item" v-for="(task, index) in tasks" :key="index">
        <view class="task-header">
          <text class="task-title">{{ task.title }}</text>
          <text class="task-price">¥{{ task.price }}</text>
        </view>
        <view class="task-info">
          <view class="task-info-item">
            <Icon name="location" :size="14" color="#9a9da0"></Icon>
            <text class="task-info-text">{{ task.location }}</text>
          </view>
          <view class="task-info-item">
            <Icon name="time" :size="14" color="#9a9da0"></Icon>
            <text class="task-info-text">{{ task.time }}</text>
          </view>
          <view class="task-info-item">
            <Icon name="package" :size="14" color="#9a9da0"></Icon>
            <text class="task-info-text">{{ task.tracking }}</text>
          </view>
        </view>
        <view class="task-footer">
          <text class="task-publisher">发布者: {{ task.publisher }}</text>
          <button class="task-btn" @click="acceptTask(task)">接取任务</button>
        </view>
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
      tasks: [
        { title: '顺丰快递代取', price: 10, location: '快递点 -> 32号楼', time: '今天 18:00 前', tracking: '顺丰: SF1234567890', publisher: '小李' },
        { title: '京东快递代取', price: 12, location: '京东自提点 -> 45号楼', time: '今天 20:00 前', tracking: '京东: JD9876543210', publisher: '小张' },
        { title: '中通快递代取', price: 8, location: '菜鸟驿站 -> 28号楼', time: '明天 12:00 前', tracking: '中通: ZT4567891234', publisher: '小王' }
      ]
    };
  },
  methods: {
    acceptTask(task) {
      uni.showModal({
        title: '接取任务',
        content: `确定要接取"${task.title}"吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({ title: '接取成功', icon: 'success' });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.express-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px 0 80px;
}

.header {
  padding: 20px 24px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.header-title {
  font-size: 20px;
  font-weight: 800;
  color: #2c2f32;
}

.search-section {
  padding: 0 24px 16px;
}

.search-input {
  position: relative;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 16px 16px 16px 48px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-text {
  width: 100%;
  font-size: 14px;
  color: #2c2f32;
}

.filter-section {
  display: flex;
  padding: 0 24px 16px;
  gap: 12px;
  overflow-x: auto;
}

.filter-item {
  padding: 8px 16px;
  background-color: #ffffff;
  border-radius: 16px;
  font-size: 14px;
  color: #2c2f32;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-item.active {
  background-color: #1E88E5;
  color: #ffffff;
}

.task-list {
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-item {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2f32;
  flex: 1;
  margin-right: 12px;
}

.task-price {
  font-size: 18px;
  font-weight: 800;
  color: #1E88E5;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.task-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-info-text {
  font-size: 14px;
  color: #9a9da0;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e5e8ec;
}

.task-publisher {
  font-size: 12px;
  color: #9a9da0;
}

.task-btn {
  padding: 8px 16px;
  background-color: #1E88E5;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}
</style>