<template>
  <view class="page-container">
    <!-- 自定义导航 -->
    <view class="navbar">
      <view class="navbar-left" @click="showtip = !showtip">
        <text class="navbar-icon">⋮</text>
      </view>
      <view class="navbar-center" @click="showpoint = !showpoint">
        <text class="navbar-week">第 {{ week }} 周</text>
        <text class="navbar-arrow">▼</text>
      </view>
      <view class="navbar-right" @click="importCourse()">
        <text class="navbar-action">📅 导入</text>
      </view>
    </view>

    <!-- 弹出菜单 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-box">
        <text class="loading-text">导入课表中...</text>
      </view>
    </view>
    
    <view v-if="showtip" class="modal-overlay" @click="showtip = false">
      <view class="modal-menu" @click.stop>
        <view class="modal-title">课表操作</view>
        <view class="modal-operations">
          <view class="modal-item" @click="importCourse(); showtip = false">
            <text class="modal-icon">📅</text>
            <text class="modal-text">导入课表</text>
          </view>
          <view class="modal-item" @click="refreshCourse(); showtip = false">
            <text class="modal-icon">🔄</text>
            <text class="modal-text">刷新课表</text>
          </view>
          <view class="modal-item" @click="clearCourse(); showtip = false">
            <text class="modal-icon">🗑️</text>
            <text class="modal-text">清空课表</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 主页面 -->
    <scroll-view scroll-y class="main-content" enable-flex>
      <!-- 周次选择 -->
      <view class="week-selector-wrapper" v-show="showpoint">
        <scroll-view 
          scroll-x
          :show-scrollbar="false"
          scroll-with-animation
          :scroll-into-view="`week${week}`"
          class="week-selector"
        >
          <view 
            :id="`week${w}`"
            class="week-item" 
            :class="{ active: w === week }"
            v-for="w in 20" 
            :key="w"
            @click="on_point(w)"
          >
            <text>第{{ w }}周</text>
          </view>
        </scroll-view>
      </view>

      <!-- 课表头部（日期） -->
      <view class="schedule-header">
        <view class="schedule-header-slot">
          <text class="slot-label">节次</text>
        </view>
        <view class="schedule-header-day" v-for="(weekDay, idx) in weeks" :key="idx">
          <text class="day-name">{{ weekDay }}</text>
          <text class="day-date">{{ dates(idx + 1) }}</text>
        </view>
      </view>

      <!-- 课表主体 -->
      <view class="schedule-container">
        <view class="schedule-slots">
          <view class="slot-item" v-for="(time, idx) in courseTime" :key="idx">
            <text class="slot-number">{{ idx + 1 }}</text>
            <text class="slot-time">{{ time }}</text>
          </view>
        </view>
        
        <view class="schedule-grid">
          <!-- 网格背景 -->
          <view class="grid-background">
            <view class="grid-cell" v-for="i in 77" :key="i"></view>
          </view>
          
          <!-- 课程块 -->
          <view 
            class="course-block"
            v-for="(course, idx) in courses"
            :key="idx"
            :style="{
              gridRow: `${(course.startTime - 1) * 2 + 1} / span ${(course.endTime - course.startTime + 1) * 2}`,
              gridColumn: course.day
            }"
            @click="showCourseInfo(course)"
          >
            <view class="course-content" :style="{ backgroundColor: getCourseColor(idx) }">
              <text class="course-name">{{ course.name }}</text>
              <text class="course-location">{{ course.location }}</text>
            </view>
          </view>
          
          <!-- 空状态 -->
          <view v-if="courses.length === 0" class="empty-state">
            <text class="empty-icon">📚</text>
            <text class="empty-text">请先导入课表</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 课程详情弹窗 -->
    <view v-if="showCourseDialog" class="dialog-overlay" @click="showCourseDialog = false">
      <view class="dialog-box" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">{{ selectedCourse.name }}</text>
          <view class="dialog-close" @click="showCourseDialog = false">
            <text>✕</text>
          </view>
        </view>
        
        <view class="dialog-content">
          <view class="info-item">
            <text class="info-label">教师</text>
            <text class="info-value">{{ selectedCourse.teacher }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">地点</text>
            <text class="info-value">{{ selectedCourse.location }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">时间</text>
            <text class="info-value">第{{ week }}周 {{ weeks[selectedCourse.day - 1] }} {{ courseTime[selectedCourse.startTime - 1] }}-{{ courseTime[selectedCourse.endTime - 1] }}</text>
          </view>
        </view>
        
        <view class="dialog-actions">
          <button class="btn-cancel" @click="showCourseDialog = false">取消</button>
          <button class="btn-confirm" @click="confirm代课">呼叫代课</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showpoint: false,
      showtip: false,
      current: 0,
      week: 1,
      courses: [],
      weeks: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      courseTime: ['8:05','9:00','10:05','11:00','中午','14:40','15:35','16:30','17:25','19:00','19:55'],
      loading: false,
      showCourseDialog: false,
      selectedCourse: {},
      updateTimer: null
    };
  },
  mounted() {
    // 直接设置周次，避免计算
    this.week = 1;
    // 延迟初始化，提高页面加载速度
    setTimeout(() => {
      this.loadCourses();
    }, 100);
  },
  beforeUnmount() {
    // 清理定时器，避免内存泄漏
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
  },
  methods: {
    getweek() {
      // 简化周次计算，使用固定值，实际项目中可从服务器获取
      this.week = 1;
    },
    on_point(e) {
      this.week = e;
    },

    dates(e) {
      // 简化日期计算，使用固定值，实际项目中可从服务器获取
      const dateMap = ['', '3/30', '3/31', '4/1', '4/2', '4/3', '4/4', '4/5'];
      return dateMap[e] || '';
    },
    loadCourses() {
      // 从本地存储加载课表数据
      let courses = uni.getStorageSync('campus_courses');
      if (courses) {
        this.courses = courses;
      }
    },
    importCourse() {
      this.loading = true;
      // 模拟导入课表
      setTimeout(() => {
        // 模拟课表数据
        let mockCourses = [
          { name: '高等数学', teacher: '张老师', location: '理教 203', day: 1, startTime: 1, endTime: 2 },
          { name: '大学英语', teacher: '李老师', location: '外院 301', day: 2, startTime: 3, endTime: 4 },
          { name: '计算机基础', teacher: '王老师', location: '计科楼 402', day: 3, startTime: 5, endTime: 6 },
          { name: '物理实验', teacher: '赵老师', location: '物理楼 101', day: 4, startTime: 7, endTime: 8 },
          { name: '近代史纲要', teacher: '刘老师', location: '文综楼 205', day: 5, startTime: 9, endTime: 10 }
        ];
        this.courses = mockCourses;
        uni.setStorageSync('campus_courses', mockCourses);
        this.loading = false;
        this.showtip = false;
        uni.showToast({ title: '课表导入成功', icon: 'success' });
      }, 1500);
    },
    refreshCourse() {
      this.loading = true;
      // 模拟刷新课表
      setTimeout(() => {
        this.loadCourses();
        this.loading = false;
        this.showtip = false;
        uni.showToast({ title: '课表刷新成功', icon: 'success' });
      }, 1000);
    },
    clearCourse() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空课表吗？',
        success: res => {
          if (res.confirm) {
            this.courses = [];
            uni.removeStorageSync('campus_courses');
            this.showtip = false;
            uni.showToast({ title: '课表已清空', icon: 'success' });
          }
        }
      });
    },
    showCourseInfo(course) {
      this.selectedCourse = course;
      this.showCourseDialog = true;
    },
    // 获取课程颜色
    getCourseColor(index) {
      // 简化颜色数组，减少内存占用
      const colors = [
        '#99CCFF',
        '#FFCC99',
        '#FFCCCC',
        '#CC6699',
        '#99CCCC',
        '#FF6666',
        '#CCCC66',
        '#66CC99'
      ];
      return colors[index % colors.length];
    },
    cancel代课() {
      this.showCourseDialog = false;
    },
    confirm代课() {
      this.showCourseDialog = false;
      // 跳转到发布成功页面
      const promise = wx.navigateTo({
        url: '/pages/success/index',
        success: function(res) {
          console.log('跳转成功', res);
        },
        fail: function(err) {
          console.log('跳转失败', err);
        }
      });
      // 处理Promise返回值，避免UnhandledPromiseRejection
      if (promise && typeof promise.catch === 'function') {
        promise.catch(err => console.log('跳转Promise错误', err));
      }
    }
  }
};
</script>

<style scoped>
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.navbar {
  height: 96rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1rpx solid #f0f2f5;
}

.navbar-left, .navbar-center, .navbar-right {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.navbar-icon {
  font-size: 32rpx;
}

.navbar-week {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c2f32;
}

.navbar-arrow {
  font-size: 16rpx;
  margin-left: 8rpx;
  color: #9a9da0;
}

.navbar-action {
  font-size: 24rpx;
  color: #1E88E5;
  font-weight: 600;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.loading-box {
  background: rgba(0,0,0,0.8);
  color: #ffffff;
  padding: 32rpx 48rpx;
  border-radius: 16rpx;
}

.loading-text {
  font-size: 28rpx;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-end;
  z-index: 150;
}

.modal-menu {
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx 24rpx;
  width: 100%;
  box-sizing: border-box;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24rpx;
}

.modal-operations {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.modal-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 16rpx;
  border-radius: 12rpx;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-icon {
  font-size: 28rpx;
}

.modal-text {
  font-size: 26rpx;
  color: #2c2f32;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

.week-selector-wrapper {
  background: linear-gradient(to right, #ffffff 0%, #f8f9fc 50%, #ffffff 100%);
  border-bottom: 2rpx solid #e8ecf1;
  padding: 16rpx 0;
  margin-bottom: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}

.week-selector {
  display: flex;
  white-space: nowrap;
  padding: 8rpx 24rpx;
  gap: 12rpx;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.week-item {
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f7 100%);
  color: #9a9da0;
  font-size: 24rpx;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
  border: 1rpx solid #e8ecf1;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100rpx;
}

.week-item:active {
  transform: scale(0.95);
}

.week-item.active {
  background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
  color: #ffffff;
  font-weight: 700;
  border-color: #1E88E5;
  box-shadow: 0 4rpx 16rpx rgba(30,136,229,0.3);
}

.schedule-header {
  display: grid;
  grid-template-columns: 80rpx repeat(7, 1fr);
  gap: 2rpx;
  background: #ffffff;
  padding: 12rpx;
  position: sticky;
  top: 0;
  z-index: 50;
}

.schedule-header-slot, .schedule-header-day {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.schedule-header-day {
  flex-direction: column;
  gap: 4rpx;
}

.slot-label, .day-name {
  font-size: 22rpx;
  color: #2c2f32;
  font-weight: 600;
}

.day-date {
  font-size: 16rpx;
  color: #9a9da0;
}

.schedule-container {
  display: flex;
  padding: 12rpx;
  gap: 2rpx;
  background: #ffffff;
  width: 100%;
  box-sizing: border-box;
}

.schedule-slots {
  display: flex;
  flex-direction: column;
  width: 80rpx;
  flex-shrink: 0;
}

.slot-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  gap: 2rpx;
}

.slot-number {
  font-size: 20rpx;
  color: #2c2f32;
  font-weight: 600;
}

.slot-time {
  font-size: 14rpx;
  color: #9a9da0;
}

.schedule-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(22, 1fr);
  gap: 2rpx;
  min-height: 1000rpx;
  position: relative;
}

.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(11, 1fr);
  gap: 2rpx;
  pointer-events: none;
  z-index: 1;
}

.grid-cell {
  background: #fafbfc;
  border: 1rpx solid #f0f2f5;
  border-radius: 4rpx;
}

.course-block {
  display: flex;
  cursor: pointer;
  z-index: 10;
  border-radius: 8rpx;
  overflow: hidden;
}

.course-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  gap: 4rpx;
}

.course-name {
  font-size: 18rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: 1.2;
}

.course-location {
  font-size: 14rpx;
  color: rgba(255,255,255,0.8);
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #9a9da0;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.dialog-box {
  background: #ffffff;
  border-radius: 20rpx;
  width: 85%;
  max-width: 600rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f2f5;
}

.dialog-title {
  font-size: 28rpx;
  font-weight: 700;
}

.dialog-close {
  font-size: 24rpx;
  color: #9a9da0;
  cursor: pointer;
}

.dialog-content {
  padding: 24rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f5f7fa;
}

.info-label {
  font-size: 24rpx;
  color: #9a9da0;
  min-width: 100rpx;
}

.info-value {
  font-size: 24rpx;
  color: #2c2f32;
  flex: 1;
  text-align: right;
}

.dialog-actions {
  display: flex;
  gap: 12rpx;
  padding: 24rpx;
  border-top: 1rpx solid #f0f2f5;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  border: 1rpx solid #e8ecf1;
  background: #f5f7fa;
  color: #9a9da0;
}

.btn-confirm {
  background: linear-gradient(to right, #1E88E5, #1565C0);
  color: #ffffff;
  border: none;
}
</style>
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #f0f0f0;
}
.pop_list_item:last-child {
  border-bottom: none;
}
.pop_icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  width: 40rpx;
  text-align: center;
}
.pop_close {
  margin-top: 30rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  color: #1E88E5;
  font-weight: 600;
}

/* 周次选择 */
.point_item {
  display: inline-block;
  width: 130rpx;
  height: 128rpx;
  padding: 0 5rpx;
}
.point_wai {
  display: flex;
  padding: 6rpx 0;
  border-radius: 20rpx;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 25rpx;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.point_wai.active {
  background-color: #1E88E5;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(30, 136, 229, 0.3);
}
.point_wai text {
  margin-bottom: 5rpx;
}
.point {
  width: 105rpx;
  height: 75rpx;
  display: flex;
  flex-flow: wrap;
  position: relative;
}
.mipot {
  height: 13rpx;
  width: 13rpx;
  margin: 1%;
  border-radius: 100%;
  background-color: #d4d4d4;
}

/* 星期栏 */
.week {
  display: flex;
  font-size: 24rpx;
  height: 5%;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
}
.week_date {
  width: calc(94% / 7);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #f0f0f0;
}
.week > view:first-child {
  display: flex;
  flex-direction: column;
  width: 6%;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

/* 整个课表 */
.schedule {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}

/* 课表左侧 */
.left {
  width: 6%;
  height: 100%;
  background-color: #f9f9f9;
  border-right: 1px solid #f0f0f0;
}
.left > view {
  display: flex;
  flex-direction: column;
  height: 9%;
  justify-content: center;
  align-items: center;
  font-size: 20rpx;
  border-bottom: 1px solid #f0f0f0;
}

/* 课表右侧 */
.right {
  flex: 1;
  position: relative;
  font-weight: bolder;
  height: 100%;
}
/* 表格背景 */
.table-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.table-row {
  display: flex;
  height: 9%;
  border-bottom: 1rpx solid #f0f0f0;
}
.table-cell {
  flex: 1;
  border-right: 1rpx solid #f0f0f0;
  background-color: #ffffff;
}

.sch_main {
  position: absolute;
  width: 14%;
  color: white;
  font-size: 23rpx;
  padding: 2rpx 6rpx;
  word-break: break-word;
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
  z-index: 2;
}
.sch_main > view {
  width: 100%;
  height: 100%;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.empty-course {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #9a9da0;
}

/* 课程详情弹窗 */
.course-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog-content {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  width: 80%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
.dialog-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c2f32;
  margin-bottom: 24rpx;
  display: block;
  text-align: center;
}
.dialog-info {
  display: block;
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 16rpx;
  line-height: 1.4;
}
.dialog-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}
.dialog-btn {
  flex: 1;
  padding: 16rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
}
.dialog-btn.cancel {
  background-color: #f0f0f0;
  color: #666666;
  margin-right: 16rpx;
}
.dialog-btn.confirm {
  background-color: #1E88E5;
  color: #ffffff;
}
.dialog-btn:active {
  transform: translateY(2px);
  opacity: 0.8;
}
</style>