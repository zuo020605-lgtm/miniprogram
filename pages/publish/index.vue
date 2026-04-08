<template>
  <view class="publish-page">
    <scroll-view scroll-y class="publish-content">
      <!-- 任务类型选择 -->
      <view class="section-card">
        <view class="section-title">选择任务类型</view>
        <view class="task-type-grid">
          <view 
            class="type-item" 
            :class="{ active: selectedType === 'campus-errand' }" 
            @click="selectType('campus-errand')"
          >
            <view class="type-icon-wrapper">
              <Icon name="run" :size="36" color="#1E88E5"></Icon>
            </view>
            <text class="type-name">校园跑腿</text>
            <text class="type-desc">帮忙跑腿办事</text>
          </view>
          <view 
            class="type-item" 
            :class="{ active: selectedType === 'express' }" 
            @click="selectType('express')"
          >
            <view class="type-icon-wrapper">
              <Icon name="package" :size="36" color="#4CAF50"></Icon>
            </view>
            <text class="type-name">快递代取</text>
            <text class="type-desc">代取快递包裹</text>
          </view>
          <view 
            class="type-item" 
            :class="{ active: selectedType === 'exam' }" 
            @click="selectType('exam')"
          >
            <view class="type-icon-wrapper">
              <Icon name="exam" :size="36" color="#FF9800"></Icon>
            </view>
            <text class="type-name">考试代替</text>
            <text class="type-desc">替考服务</text>
          </view>
          <view 
            class="type-item more-item"
            @click="navigateToCampusClass"
          >
            <view class="type-icon-wrapper">
              <Icon name="class" :size="36" color="#9C27B0"></Icon>
            </view>
            <text class="type-name">校园代课</text>
            <text class="type-desc">查看课表代课</text>
          </view>
        </view>
      </view>

      <!-- 表单区域 -->
      <view v-if="selectedType" class="form-section">
        <!-- 校园跑腿/快递代取表单 -->
        <template v-if="selectedType === 'campus-errand' || selectedType === 'express'">
          <view class="section-card">
            <view class="section-title">时间安排</view>
            
            <!-- 日期选择 -->
            <view class="form-row">
              <text class="row-label">日期</text>
              <picker 
                mode="date" 
                :value="selectedDate" 
                @change="onDateChange"
                :start="minDate"
              >
                <view class="picker-value">
                  <text>{{ formatDateDisplay(selectedDate) }}</text>
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
            </view>
            
            <!-- 时间选择 -->
            <view class="time-range-row">
              <view class="time-item">
                <text class="time-label">开始时间</text>
                <picker mode="time" :value="startTime" @change="onStartTimeChange">
                  <view class="picker-value">
                    <text>{{ startTime || '选择时间' }}</text>
                    <text class="picker-arrow">▼</text>
                  </view>
                </picker>
              </view>
              <text class="time-separator">至</text>
              <view class="time-item">
                <text class="time-label">结束时间</text>
                <picker mode="time" :value="endTime" @change="onEndTimeChange">
                  <view class="picker-value">
                    <text>{{ endTime || '选择时间' }}</text>
                    <text class="picker-arrow">▼</text>
                  </view>
                </picker>
              </view>
            </view>
          </view>

          <view class="section-card">
            <view class="section-title">地点信息</view>
            
            <view class="form-row">
              <text class="row-label">取货地点</text>
              <input 
                type="text" 
                v-model="pickupLocation" 
                placeholder="请输入取货地点"
                class="form-input"
              />
            </view>
            
            <view class="form-row">
              <text class="row-label">送达地点</text>
              <input 
                type="text" 
                v-model="deliveryLocation" 
                placeholder="请输入送达地点"
                class="form-input"
              />
            </view>
            
            <!-- 快递重量（仅快递代取） -->
            <view v-if="selectedType === 'express'" class="form-row">
              <text class="row-label">物品重量</text>
              <view class="weight-selector">
                <view 
                  class="weight-option" 
                  v-for="weight in weightOptions" 
                  :key="weight.value"
                  :class="{ active: selectedWeight === weight.value }"
                  @click="selectedWeight = weight.value"
                >
                  <text>{{ weight.label }}</text>
                </view>
              </view>
            </view>
          </view>
        </template>

        <!-- 考试代替表单 -->
        <template v-else-if="selectedType === 'exam'">
          <view class="section-card">
            <view class="section-title">考试信息</view>
            
            <view class="form-row">
              <text class="row-label">教学楼</text>
              <input 
                type="text" 
                v-model="teachingBuilding" 
                placeholder="请输入教学楼名称"
                class="form-input"
              />
            </view>
            
            <view class="form-row">
              <text class="row-label">考场教室</text>
              <input 
                type="text" 
                v-model="examClassroom" 
                placeholder="请输入考场教室"
                class="form-input"
              />
            </view>
            
            <view class="form-row">
              <text class="row-label">考试科目</text>
              <input 
                type="text" 
                v-model="examSubject" 
                placeholder="请输入考试科目"
                class="form-input"
              />
            </view>
            
            <view class="time-range-row">
              <view class="time-item">
                <text class="time-label">考试日期</text>
                <picker mode="date" :value="examDate" @change="onExamDateChange" :start="minDate">
                  <view class="picker-value">
                    <text>{{ formatDateDisplay(examDate) }}</text>
                    <text class="picker-arrow">▼</text>
                  </view>
                </picker>
              </view>
            </view>
            
            <view class="time-range-row">
              <view class="time-item">
                <text class="time-label">开始时间</text>
                <picker mode="time" :value="examStartTime" @change="onExamStartTimeChange">
                  <view class="picker-value">
                    <text>{{ examStartTime || '选择时间' }}</text>
                    <text class="picker-arrow">▼</text>
                  </view>
                </picker>
              </view>
              <text class="time-separator">至</text>
              <view class="time-item">
                <text class="time-label">结束时间</text>
                <picker mode="time" :value="examEndTime" @change="onExamEndTimeChange">
                  <view class="picker-value">
                    <text>{{ examEndTime || '选择时间' }}</text>
                    <text class="picker-arrow">▼</text>
                  </view>
                </picker>
              </view>
            </view>
          </view>
        </template>

        <!-- 通用表单 -->
        <view class="section-card">
          <view class="section-title">任务详情</view>
          
          <view class="form-row">
            <text class="row-label">任务金额</text>
            <view class="price-input-wrapper">
              <text class="price-symbol">¥</text>
              <input 
                type="digit" 
                v-model="orderAmount" 
                placeholder="0.00"
                class="price-input"
              />
            </view>
          </view>
          
          <view class="form-row textarea-row">
            <text class="row-label">任务描述</text>
            <textarea 
              v-model="taskDescription" 
              placeholder="请详细描述任务内容，方便接单员了解需求"
              class="form-textarea"
              maxlength="500"
              :show-count="true"
            />
          </view>
          
          <view class="form-row">
            <text class="row-label">联系方式</text>
            <input 
              type="number" 
              v-model="contactPhone" 
              placeholder="请输入手机号"
              maxlength="11"
              class="form-input"
            />
          </view>
        </view>

        <!-- 发布按钮 -->
        <button 
          class="publish-btn" 
          :class="{ disabled: !isFormValid }"
          :disabled="!isFormValid || submitting"
          @click="publishTask"
        >
          <text v-if="submitting">发布中...</text>
          <text v-else>立即发布</text>
        </button>
        
        <!-- 提示信息 -->
        <view class="tips-card">
          <text class="tips-title">温馨提示</text>
          <text class="tips-item">• 请确保联系方式准确，方便接单员联系您</text>
          <text class="tips-item">• 任务发布后可在「我的发布」中查看和管理</text>
          <text class="tips-item">• 如需取消任务，请在接单员接单前操作</text>
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
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    
    return {
      selectedType: '',
      selectedDate: today,
      startTime: '',
      endTime: '',
      pickupLocation: '',
      deliveryLocation: '',
      selectedWeight: '',
      teachingBuilding: '',
      examClassroom: '',
      examSubject: '',
      examDate: today,
      examStartTime: '',
      examEndTime: '',
      orderAmount: '',
      taskDescription: '',
      contactPhone: '',
      submitting: false,
      showingLoading: false,
      minDate: today,
      weightOptions: [
        { label: '1kg内', value: '1kg内' },
        { label: '5kg内', value: '5kg内' },
        { label: '10kg内', value: '10kg内' },
        { label: '10kg以上', value: '10kg以上' }
      ]
    };
  },
  computed: {
    isFormValid() {
      if (!this.selectedType) return false;
      
      // 金额必须大于0
      const amount = parseFloat(this.orderAmount);
      if (isNaN(amount) || amount <= 0) return false;
      
      // 手机号必须正确
      if (!/^1[3-9]\d{9}$/.test(this.contactPhone)) return false;
      
      // 类型特定验证
      if (this.selectedType === 'campus-errand' || this.selectedType === 'express') {
        if (!this.selectedDate || !this.startTime || !this.endTime) return false;
        if (!this.pickupLocation || !this.deliveryLocation) return false;
        if (this.selectedType === 'express' && !this.selectedWeight) return false;
      } else if (this.selectedType === 'exam') {
        if (!this.teachingBuilding || !this.examClassroom || !this.examSubject) return false;
        if (!this.examDate || !this.examStartTime || !this.examEndTime) return false;
      }
      
      return true;
    }
  },
  onLoad(options) {
    // 从路由参数获取任务类型
    if (options && options.type) {
      if (options.type === 'campus-errand' || options.type === 'express' || options.type === 'exam') {
        this.selectedType = options.type;
      } else if (options.type !== 'campus-class') {
        this.selectedType = options.type;
      }
    }
    
    // 编辑模式
    if (options && options.id) {
      this.loadOrderForEdit(options.id);
    }
  },
  methods: {
    selectType(type) {
      this.selectedType = type;
      // 重置表单
      this.resetForm();
    },
    
    resetForm() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      this.selectedDate = today;
      this.startTime = '';
      this.endTime = '';
      this.pickupLocation = '';
      this.deliveryLocation = '';
      this.selectedWeight = '';
      this.teachingBuilding = '';
      this.examClassroom = '';
      this.examSubject = '';
      this.examDate = today;
      this.examStartTime = '';
      this.examEndTime = '';
      this.orderAmount = '';
      this.taskDescription = '';
      this.contactPhone = '';
    },
    
    navigateBack() {
      uni.navigateBack();
    },
    
    navigateToCampusClass() {
      uni.navigateTo({ url: '/pages/campus-class/index' }).catch(() => {});
    },
    
    // 日期时间处理
    onDateChange(e) {
      this.selectedDate = e.detail.value;
    },
    
    onStartTimeChange(e) {
      this.startTime = e.detail.value;
    },
    
    onEndTimeChange(e) {
      this.endTime = e.detail.value;
    },
    
    onExamDateChange(e) {
      this.examDate = e.detail.value;
    },
    
    onExamStartTimeChange(e) {
      this.examStartTime = e.detail.value;
    },
    
    onExamEndTimeChange(e) {
      this.examEndTime = e.detail.value;
    },
    
    formatDateDisplay(dateStr) {
      if (!dateStr) return '选择日期';
      const [year, month, day] = dateStr.split('-');
      return `${month}月${day}日`;
    },
    
    // 表单验证
    validateForm() {
      if (!this.selectedType) {
        uni.showToast({ title: '请选择任务类型', icon: 'none' });
        return false;
      }
      
      const amount = parseFloat(this.orderAmount);
      if (isNaN(amount) || amount <= 0) {
        uni.showToast({ title: '请输入有效的金额', icon: 'none' });
        return false;
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.contactPhone)) {
        uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
        return false;
      }
      
      if (this.taskDescription && this.taskDescription.length > 500) {
        uni.showToast({ title: '任务描述不能超过500字', icon: 'none' });
        return false;
      }
      
      return true;
    },
    
    // 发布任务
    async publishTask() {
      if (!this.validateForm() || this.submitting) return;
      
      this.submitting = true;
      this.showingLoading = true;  // ✅ 标记loading已显示
      uni.showLoading({ title: '正在发布...' });
      
      try {
        // 构建订单数据
        const orderData = {
          uid: 'user_' + Date.now(),
          title: this.getOrderTitle(),
          price: parseFloat(this.orderAmount).toFixed(2),
          description: this.taskDescription,
          contact: this.contactPhone
        };
        
        // 根据类型添加特定字段
        if (this.selectedType === 'campus-errand') {
          orderData.serviceType = 'campusErrand';
          orderData.startTime = `${this.selectedDate} ${this.startTime}:00`;
          orderData.endTime = `${this.selectedDate} ${this.endTime}:00`;
          orderData.pickupLocation = this.pickupLocation;
          orderData.deliveryLocation = this.deliveryLocation;
        } else if (this.selectedType === 'express') {
          orderData.serviceType = 'packageDelivery';
          orderData.startTime = `${this.selectedDate} ${this.startTime}:00`;
          orderData.endTime = `${this.selectedDate} ${this.endTime}:00`;
          orderData.pickupLocation = this.pickupLocation;
          orderData.deliveryLocation = this.deliveryLocation;
          orderData.itemWeight = this.selectedWeight;
        } else if (this.selectedType === 'exam') {
          orderData.serviceType = 'examTaking';
          orderData.teachingBuilding = this.teachingBuilding;
          orderData.examClassroom = this.examClassroom;
          orderData.examSubject = this.examSubject;
          orderData.examStartTime = `${this.examDate} ${this.examStartTime}:00`;
          orderData.examEndTime = `${this.examDate} ${this.examEndTime}:00`;
        }
        
        // 调用云对象
        const orderCloud = uniCloud.importObject('order');
        const result = await orderCloud.addOrder(orderData);
        
        // ✅ 安全隐藏loading
        if (this.showingLoading) {
          uni.hideLoading();
          this.showingLoading = false;
        }
        
        if (result.errCode === 0) {
          uni.showToast({ title: '发布成功', icon: 'success' });
          setTimeout(() => {
            uni.redirectTo({ url: '/pages/success/index' });
          }, 1000);
        } else {
          uni.showToast({ title: result.errMsg || '发布失败', icon: 'none' });
        }
      } catch (error) {
        // ✅ 安全隐藏loading
        if (this.showingLoading) {
          uni.hideLoading();
          this.showingLoading = false;
        }
        console.error('发布任务失败:', error);
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
      } finally {
        this.submitting = false;
        this.showingLoading = false;
      }
    },
    
    getOrderTitle() {
      const prefixMap = {
        'campus-errand': '校园跑腿',
        'express': '快递代取',
        'exam': '考试代替'
      };
      const prefix = prefixMap[this.selectedType] || '任务';
      const desc = this.taskDescription || '';
      return prefix + '：' + desc.substring(0, 15) + (desc.length > 15 ? '...' : '');
    },
    
    async loadOrderForEdit(orderId) {
      // 编辑模式：加载订单数据
      try {
        const orderCloud = uniCloud.importObject('order');
        const result = await orderCloud.getOrderDetail(orderId);
        
        if (result.errCode === 0 && result.data) {
          const order = Array.isArray(result.data) ? result.data[0] : result.data;
          // 填充表单数据
          this.orderAmount = order.price;
          this.taskDescription = order.description;
          this.contactPhone = order.contact;
          
          if (order.serviceType === 'campusErrand') {
            this.selectedType = 'campus-errand';
            this.pickupLocation = order.pickupLocation;
            this.deliveryLocation = order.deliveryLocation;
          } else if (order.serviceType === 'packageDelivery') {
            this.selectedType = 'express';
            this.pickupLocation = order.pickupLocation;
            this.deliveryLocation = order.deliveryLocation;
            this.selectedWeight = order.itemWeight;
          } else if (order.serviceType === 'examTaking') {
            this.selectedType = 'exam';
            this.teachingBuilding = order.teachingBuilding;
            this.examClassroom = order.examClassroom;
            this.examSubject = order.examSubject;
          }
        }
      } catch (error) {
        console.error('加载订单失败:', error);
      }
    }
  }
};
</script>

<style scoped>
.publish-page {
  position: relative;
  min-height: 100vh;
  background-color: #f5f7fa;
  overflow-x: hidden;
}

/* 导航栏 */
.custom-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.05);
}

.navbar-left, .navbar-right {
  width: 80rpx;
}

.back-icon {
  font-size: 40rpx;
  color: #2c2f32;
}

.navbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2c2f32;
}

/* 内容区 */
.publish-content {
  padding: 24rpx;
  padding-bottom: 200rpx;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* 卡片样式 */
.section-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2c2f32;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 8rpx;
  height: 28rpx;
  background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
  border-radius: 4rpx;
  margin-right: 16rpx;
}

/* 任务类型网格 */
.task-type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 24rpx;
  background-color: #f8f9fa;
  border-radius: 24rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}

.type-item.active {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #1E88E5;
}

.type-item.more-item.active {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #1E88E5;
}

.type-item:active {
  transform: scale(0.98);
}

.type-item.more-item {
  background-color: #f8f9fa;
}

.type-icon-wrapper {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.type-icon {
  font-size: 44rpx;
}

.type-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #2c2f32;
  margin-bottom: 8rpx;
}

.type-desc {
  font-size: 22rpx;
  color: #9a9da0;
}

.type-item.active .type-name {
  color: #1565C0;
}

/* 表单样式 */
.form-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f2f5;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.form-row:last-child {
  border-bottom: none;
}

.row-label {
  font-size: 26rpx;
  color: #6c757d;
  width: 160rpx;
  flex-shrink: 0;
  box-sizing: border-box;
}

.form-input {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #2c2f32;
  text-align: right;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 时间范围 */
.time-range-row {
  display: flex;
  align-items: flex-start;
  padding: 20rpx 0;
  flex-wrap: wrap;
}

.time-item {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
}

.time-label {
  font-size: 22rpx;
  color: #9a9da0;
  display: block;
  margin-bottom: 12rpx;
  width: 100%;
}

.time-separator {
  font-size: 24rpx;
  color: #9a9da0;
  margin: 0 16rpx;
  margin-top: 36rpx;
  flex-shrink: 0;
}

/* 选择器样式 */
.picker-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
  font-size: 26rpx;
  color: #2c2f32;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker-arrow {
  font-size: 18rpx;
  color: #9a9da0;
}

/* 重量选择器 */
.weight-selector {
  display: flex;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
  justify-content: flex-end;
  overflow: hidden;
  flex-wrap: wrap;
}

.weight-option {
  padding: 12rpx 16rpx;
  background-color: #f8f9fa;
  border-radius: 20rpx;
  font-size: 20rpx;
  color: #6c757d;
  border: 1rpx solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.weight-option.active {
  background-color: #e3f2fd;
  color: #1565C0;
  border-color: #1E88E5;
}

/* 价格输入 */
.price-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.price-symbol {
  font-size: 26rpx;
  color: #ff4757;
  font-weight: 600;
  margin-right: 8rpx;
  flex-shrink: 0;
}

.price-input {
  font-size: 32rpx;
  color: #ff4757;
  font-weight: 700;
  text-align: right;
  width: 160rpx;
  max-width: 160rpx;
  min-width: 0;
  box-sizing: border-box;
}

/* 文本域 */
.textarea-row {
  flex-direction: column;
  align-items: flex-start;
}

.textarea-row .row-label {
  margin-bottom: 16rpx;
}

.form-textarea {
  width: 100%;
  max-width: 100%;
  min-height: 160rpx;
  font-size: 26rpx;
  color: #2c2f32;
  background-color: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  box-sizing: border-box;
  line-height: 1.6;
}

/* 表单区域 */
.form-section {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* 发布按钮 */
.publish-btn {
  width: 75%;
  max-width: 75%;
  padding: 32rpx;
  background: linear-gradient(135deg, #1E88E5 0%, #1565C0 100%);
  color: #ffffff;
  border: none;
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: 600;
  margin-top: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(30, 136, 229, 0.3);
  transition: all 0.3s ease;
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
}

.publish-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.publish-btn.disabled {
  background: #c4c7ca;
  box-shadow: none;
}

/* 提示卡片 */
.tips-card {
  background-color: rgba(255, 152, 0, 0.1);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 24rpx;
  margin-bottom: 48rpx;
}

.tips-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #ff9800;
  margin-bottom: 12rpx;
  display: block;
}

.tips-item {
  font-size: 22rpx;
  color: #ff9800;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.5;
}

.tips-item:last-child {
  margin-bottom: 0;
}
</style>
