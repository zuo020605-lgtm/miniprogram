<template>
  <view class="page-container home-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="campus-selector" @click="showCampusPicker = true">
        <Icon name="school" :size="40" color="#1E88E5"></Icon>
        <view class="campus-info">
          <text class="campus-label">当前校区</text>
          <view class="campus-name">
            <text class="campus-text">{{ currentCampus }}</text>
            <Icon name="chevron-down" :size="16" color="#9a9da0"></Icon>
          </view>
        </view>
      </view>
      <view class="header-actions">
        <view class="notification-btn" @click="navigateToMessage">
          <Icon name="bell" :size="24" color="#2c2f32"></Icon>
          <view class="notification-badge" v-if="unreadCount > 0">{{ unreadCount }}</view>
        </view>
        <view class="user-avatar" @click="navigateToProfile">
          <Icon name="user" :size="24" color="#ffffff"></Icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Icon from '@/components/icon/icon.vue';
export default {
  components: { Icon }
};
</script>
