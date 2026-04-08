<template>
  <view class="page-container">
    <!-- 加载中-->
    <view v-if="loading" class="loading-box">
      <view class="ske ske-banner"></view>
      <view class="ske ske-card"></view>
      <view class="ske ske-card"></view>
    </view>

    <!-- 内容区-->
    <scroll-view v-else scroll-y class="content-scroll">
      <!-- 状态卡片-->
      <view class="status-box" :class="'st-' + order.status">
        <view class="status-top">
          <view class="status-icon">
            <Icon :name="getIcon(order.status)" :size="36" color="#fff"></Icon>
          </view>
          <view class="status-text">
            <text class="status-title">{{ getText(order.status) }}</text>
            <text class="status-desc">{{ getDesc(order.status) }}</text>
          </view>
        </view>
        <!-- 进度 -->
        <view class="progress-box" v-if="order.status !== 'cancelled'">
          <view class="progress-line">
            <view class="progress-fill" :style="{width: getPercent(order.status)}"></view>
          </view>
          <view class="progress-steps">
            <view class="step" v-for="(s, i) in steps" :key="i" :class="{on: isActive(i)}">
              <view class="step-dot"></view>
              <text class="step-name">{{s}}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 基本信息卡片 -->
      <view class="card">
        <view class="card-head">
          <Icon name="order" :size="24" color="#1E88E5"></Icon>
          <text class="card-title">基本信息</text>
        </view>
        <view class="row">
          <text class="label">任务标题</text>
          <text class="val">{{order.title || '未设置'}}</text>
        </view>
        <view class="row">
          <text class="label">任务金额</text>
          <text class="val price">¥{{formatP(order.price)}}</text>
        </view>
        <view class="row">
          <text class="label">发布时间</text>
          <text class="val">{{formatT(order.createdAt)}}</text>
        </view>
        <view class="row" v-if="order.startTime">
          <text class="label">开始时间</text>
          <text class="val hl">{{formatT(order.startTime)}}</text>
        </view>
        <view class="row">
          <text class="label">订单编号</text>
          <view class="copy-row" @click="copyNo">
            <text class="val small">{{order.orderNo || order._id}}</text>
            <Icon name="copy" :size="14" color="#9a9da0"></Icon>
          </view>
        </view>
      </view>

      <!-- 服务详情卡片 -->
      <view class="card">
        <view class="card-head">
          <Icon name="settings" :size="16" color="#4CAF50"></Icon>
          <text class="card-title">服务详情</text>
        </view>
        <template v-if="order.serviceType === 'campusErrand'">
          <view class="row"><text class="label">取货地点</text><text class="val">{{order.pickupLocation || '未设置'}}</text></view>
          <view class="row"><text class="label">送达地点</text><text class="val">{{order.deliveryLocation || '未设置'}}</text></view>
        </template>
        <template v-else-if="order.serviceType === 'packageDelivery'">
          <view class="row"><text class="label">取货地点</text><text class="val">{{order.pickupLocation || '未设置'}}</text></view>
          <view class="row"><text class="label">送达地点</text><text class="val">{{order.deliveryLocation || '未设置'}}</text></view>
          <view class="row"><text class="label">物品重量</text><text class="val">{{order.itemWeight || '未设置'}}</text></view>
        </template>
        <template v-else-if="order.serviceType === 'examTaking'">
          <view class="row"><text class="label">教学楼</text><text class="val">{{order.teachingBuilding || '未设置'}}</text></view>
          <view class="row"><text class="label">考场教室</text><text class="val">{{order.examClassroom || '未设置'}}</text></view>
          <view class="row"><text class="label">考试科目</text><text class="val">{{order.examSubject || '未设置'}}</text></view>
        </template>
        <template v-else-if="order.serviceType === 'classAttendance'">
          <view class="row"><text class="label">教学楼</text><text class="val">{{order.teachingBuilding || '未设置'}}</text></view>
          <view class="row"><text class="label">教室</text><text class="val">{{order.classroom || '未设置'}}</text></view>
          <view class="row"><text class="label">课程名称</text><text class="val">{{order.courseName || '未设置'}}</text></view>
        </template>
      </view>

      <!-- 任务描述卡片 -->
      <view class="card">
        <view class="card-head">
          <Icon name="chat" :size="16" color="#FF9800"></Icon>
          <text class="card-title">任务描述</text>
        </view>
        <view class="desc-box">
          <text class="desc-text">{{order.description || '暂无描述'}}</text>
        </view>
        <view class="contact-row">
          <Icon name="user" :size="14" color="#9a9da0"></Icon>
          <text class="contact-label">联系人：</text>
          <text class="contact-val">{{order.contact || '未设置'}}</text>
        </view>
      </view>

      <!-- 接单人信息-->
      <view class="card" v-if="order.courierNickname">
        <view class="card-head">
          <Icon name="users" :size="16" color="#9C27B0"></Icon>
          <text class="card-title">接单人信息</text>
        </view>
        <view class="courier-row">
          <view class="avatar">
            <text class="avatar-txt">{{(order.courierNickname||'用').charAt(0)}}</text>
          </view>
          <view class="courier-info">
            <text class="courier-name">{{order.courierNickname}}</text>
            <view class="courier-stats">
              <text class="stat">完单{{order.courierCompletedOrders||0}}</text>
              <text class="stat">好评{{order.courierRating||100}}%</text>
            </view>
          </view>
          <button class="chat-btn" @click="openChat">
            <Icon name="chat" :size="16" color="#1E88E5"></Icon>
            <text class="chat-txt">联系TA</text>
          </button>
        </view>
      </view>

      <!-- 底部安全区-->
      <view class="safe-bottom"></view>
    </scroll-view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <template v-if="order.status === 'unaccepted'">
        <button class="btn btn-outline" @click="doCancel">取消订单</button>
        <button class="btn btn-primary" @click="doAccept" :disabled="acting">{{acting?'处理中':'立即接单'}}</button>
      </template>
      <template v-else-if="order.status === 'pending'">
        <button class="btn btn-outline" @click="doCancel">取消订单</button>
        <button class="btn btn-primary" @click="doStart" :disabled="acting">{{acting?'处理中':'开始服务'}}</button>
      </template>
      <template v-else-if="order.status === 'processing'">
        <button class="btn btn-outline" @click="doPause">暂停任务</button>
        <button class="btn btn-primary" @click="doComplete" :disabled="acting">{{acting?'处理中':'完成任务'}}</button>
      </template>
      <template v-else-if="order.status === 'paused'">
        <button class="btn btn-outline" @click="doCancel">取消订单</button>
        <button class="btn btn-primary" @click="doResume" :disabled="acting">{{acting?'处理中':'继续任务'}}</button>
      </template>
      <template v-else-if="order.status === 'completed'">
        <button class="btn btn-outline" @click="goReview">查看评价</button>
        <button class="btn btn-primary" @click="repost">再来一单</button>
      </template>
      <template v-else-if="order.status === 'cancelled'">
        <button class="btn btn-outline btn-full" @click="repost">重新发布</button>
      </template>
    </view>

    <!-- 菜单弹窗 -->
    <view class="popup-mask" v-if="showMenu" @click="showMenu = false">
      <view class="popup-content" @click.stop>
        <view class="popup-item" @click="doShare">
          <Icon name="share" :size="20" color="#2c2f32"></Icon>
          <text>分享订单</text>
        </view>
        <view class="popup-item" @click="goReport">
          <Icon name="shield" :size="20" color="#F44336"></Icon>
          <text class="red">举报投诉</text>
        </view>
        <view class="popup-cancel" @click="showMenu = false">取消</view>
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
      order: { _id: '', title: '', price: 0, status: 'unaccepted', serviceType: 'campusErrand', description: '', createdAt: '' },
      loading: true,
      acting: false,
      showingLoading: false,
      showMenu: false,
      steps: ['发布', '接单', '服务', '完成']
    };
  },
  async onLoad(opt) {
    if (opt.id) await this.load(opt.id, opt.status, opt.serviceType);
  },
  methods: {
    async load(id, status, serviceType) {
      this.loading = true;
      try {
        const cloud = uniCloud.importObject('order');
        // 使用更短的超时时间
        const res = await this.timeoutWrap(cloud.getOrderDetail(id), 10000);
        if (res.errCode === 0 && res.data) {
          const d = Array.isArray(res.data) ? res.data[0] : res.data;
          d.price = parseFloat(d.price) || 0;
          this.order = { ...this.order, ...d };
        } else {
          this.mock(id, status, serviceType);
        }
      } catch (e) {
        console.error('加载失败:', e);
        this.mock(id, status, serviceType);
        uni.showToast({ title: e.message || '加载失败', icon: 'none', duration: 1500 });
      } finally {
        this.loading = false;
      }
    },
    
    timeoutWrap(promise, ms) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('网络超时')), ms);
        promise.then(res => { clearTimeout(timer); resolve(res); }).catch(err => { clearTimeout(timer); reject(err); });
      });
    },
    
    mock(id, status, serviceType) {
      this.order = {
        _id: id, title: '示例订单', price: 10,
        status: status || 'unaccepted',
        serviceType: serviceType || 'campusErrand',
        description: '这是一个示例订单', createdAt: new Date().toISOString(),
        orderNo: 'ORD' + Date.now()
      };
    },
    
    getIcon(s) {
      return { unaccepted: 'time', pending: 'check', processing: 'run', completed: 'check', cancelled: 'close', paused: 'pause' }[s] || 'order';
    },
    getText(s) {
      return { unaccepted: '等待接单', pending: '已接单', processing: '服务中', completed: '已完成', cancelled: '已取消', paused: '已暂停' }[s] || '未知';
    },
    getDesc(s) {
      return { unaccepted: '等待接单员接单', pending: '等待开始服务', processing: '服务进行中', completed: '服务已完成', cancelled: '订单已取消', paused: '服务已暂停' }[s] || '';
    },
    getPercent(s) {
      return { unaccepted: '25%', pending: '50%', processing: '75%', completed: '100%', cancelled: '0%', paused: '50%' }[s] || '0%';
    },
    isActive(i) {
      const map = { unaccepted: 0, pending: 1, processing: 2, completed: 3 };
      return i <= (map[this.order.status] ?? 0);
    },
    
    formatP(p) { return (parseFloat(p) || 0).toFixed(2); },
    formatT(t) {
      if (!t) return '未知';
      try {
        const d = new Date(t.replace(' ', 'T'));
        return isNaN(d.getTime()) ? '未知' : `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      } catch { return '未知'; }
    },
    
    goBack() {
      const pages = getCurrentPages();
      pages.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/order/index' });
    },
    copyNo() {
      uni.setClipboardData({ data: this.order.orderNo || this.order._id, success: () => uni.showToast({ title: '已复制', icon: 'success' }) });
    },
    
    async doAccept() { await this.update('pending', '接单'); },
    async doStart() { await this.update('processing', '开始'); },
    async doComplete() { await this.update('completed', '完成'); },
    async doPause() { await this.update('paused', '暂停'); },
    async doResume() { await this.update('processing', '继续'); },
    doCancel() {
      uni.showModal({ title: '取消订单', content: '确定取消吗', success: r => { if (r.confirm) this.update('cancelled', '取消'); } });
    },
    
    async update(status, action) {
      if (this.acting) return;
      this.acting = true;
      this.showingLoading = true;
      uni.showLoading({ title: action + '中..' });
      try {
        const cloud = uniCloud.importObject('order');
        const res = await this.timeoutWrap(cloud.updateOrderStatus(this.order._id, status), 8000);
        if (res.errCode === 0) {
          uni.showToast({ title: action + '成功', icon: 'success' });
          await this.load(this.order._id, status, this.order.serviceType);
        } else {
          uni.showToast({ title: res.errMsg || action + '失败', icon: 'none' });
        }
      } catch (e) {
        uni.showToast({ title: e.message.includes('超时') ? '操作超时' : '网络异常', icon: 'none' });
      } finally {
        if (this.showingLoading) {
          uni.hideLoading();
          this.showingLoading = false;
        }
        this.acting = false;
      }
    },
    
    openChat() {
      uni.navigateTo({ url: '/pages/chat/index?userId=' + (this.order.courierNickname || 'unknown') }).catch(() => uni.showToast({ title: '功能开发中', icon: 'none' }));
    },
    doShare() { this.showMenu = false; uni.showToast({ title: '分享功能开发中', icon: 'none' }); },
    goReport() { this.showMenu = false; uni.navigateTo({ url: '/pages/report/index' }).catch(() => uni.showToast({ title: '举报功能开发中', icon: 'none' })); },
    goReview() { uni.navigateTo({ url: '/pages/review/index?orderId=' + this.order._id }).catch(() => uni.showToast({ title: '评价功能开发中', icon: 'none' })); },
    repost() { uni.navigateTo({ url: '/pages/publish/index?type=' + (this.order.serviceType || 'campusErrand') }).catch(() => {}); }
  }
};
</script>

<style scoped>
/* 全局防止溢出 */
page { overflow-x: hidden; }
.page-container { min-height: 100vh; background: #f5f7fa; overflow-x: hidden; }

/* 骨架�?*/
.loading-box { padding: 20rpx; }
.ske { background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size: 200% 100%; animation: sk 1.5s infinite; border-radius: 16rpx; }
@keyframes sk { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.ske-banner { width: 100%; height: 200rpx; margin-bottom: 20rpx; }
.ske-card { width: 100%; height: 260rpx; margin-bottom: 20rpx; }

/* 导航�?*/
.nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; padding-top: calc(20rpx + var(--status-bar-height,0)); background: #fff; }
.nav-back, .nav-action { width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; }
.nav-title { font-size: 32rpx; font-weight: 600; color: #2c2f32; }

/* 内容区 */
.content-scroll { 
  height: calc(100vh - 80rpx); 
  padding: 16rpx; 
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 状态卡�?- 严格宽度控制 */
.status-box { border-radius: 20rpx; padding: 24rpx; margin-bottom: 16rpx; color: #fff; }
.st-unaccepted { background: linear-gradient(135deg,#78909C,#546E7A); }
.st-pending { background: linear-gradient(135deg,#FF9800,#F57C00); }
.st-processing { background: linear-gradient(135deg,#1E88E5,#1565C0); }
.st-completed { background: linear-gradient(135deg,#4CAF50,#388E3C); }
.st-cancelled { background: linear-gradient(135deg,#EF5350,#D32F2F); }
.st-paused { background: linear-gradient(135deg,#9E9E9E,#757575); }

.status-top { display: flex; align-items: center; gap: 16rpx; }
.status-icon { width: 56rpx; height: 56rpx; border-radius: 28rpx; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.status-text { flex: 1; min-width: 0; }
.status-title { font-size: 30rpx; font-weight: 700; display: block; }
.status-desc { font-size: 22rpx; opacity: 0.9; display: block; margin-top: 4rpx; }

/* 进度�?*/
.progress-box { margin-top: 20rpx; }
.progress-line { height: 4rpx; background: rgba(255,255,255,0.3); border-radius: 2rpx; overflow: hidden; }
.progress-fill { height: 100%; background: #fff; border-radius: 2rpx; }
.progress-steps { display: flex; justify-content: space-between; margin-top: 12rpx; }
.step { flex: 1; display: flex; flex-direction: column; align-items: center; }
.step-dot { width: 12rpx; height: 12rpx; border-radius: 6rpx; background: rgba(255,255,255,0.3); margin-bottom: 4rpx; }
.step.on .step-dot { background: #fff; }
.step-name { font-size: 18rpx; opacity: 0.7; }
.step.on .step-name { opacity: 1; font-weight: 600; }

/* 卡片 - 严格宽度控制 */
.card { 
  background: #fff; 
  border-radius: 20rpx; 
  padding: 24rpx; 
  margin-bottom: 16rpx;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.card-head { 
  display: flex; 
  align-items: center; 
  gap: 10rpx; 
  margin-bottom: 20rpx; 
  padding-bottom: 16rpx; 
  border-bottom: 1rpx solid #f0f2f5;
  width: 100%;
  box-sizing: border-box;
}

.card-title { font-size: 28rpx; font-weight: 600; color: #2c2f32; }

.row { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  padding: 12rpx 0;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.label { 
  font-size: 24rpx; 
  color: #9a9da0; 
  width: 120rpx; 
  flex-shrink: 0;
}

.val { 
  font-size: 24rpx; 
  color: #2c2f32; 
  flex: 1; 
  text-align: right; 
  word-break: break-all;
  word-wrap: break-word;
  padding-left: 8rpx;
  overflow: hidden;
}
.val.price { color: #ff4757; font-weight: 700; font-size: 28rpx; }
.val.hl { color: #1E88E5; font-weight: 600; }
.val.small { font-size: 20rpx; color: #9a9da0; max-width: 200rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.copy-row { display: flex; align-items: center; justify-content: flex-end; gap: 6rpx; }

.desc-box { background: #f8f9fa; border-radius: 12rpx; padding: 16rpx; margin-bottom: 12rpx; }
.desc-text { font-size: 24rpx; color: #6c757d; line-height: 1.5; word-break: break-all; }
.contact-row { display: flex; align-items: center; gap: 6rpx; }
.contact-label { font-size: 24rpx; color: #9a9da0; }
.contact-val { font-size: 24rpx; color: #2c2f32; }

/* 接单�?*/
.courier-row { display: flex; align-items: center; gap: 16rpx; }
.avatar { width: 64rpx; height: 64rpx; border-radius: 32rpx; background: linear-gradient(135deg,#9C27B0,#7B1FA2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-txt { font-size: 26rpx; color: #fff; font-weight: 600; }
.courier-info { flex: 1; min-width: 0; }
.courier-name { font-size: 26rpx; font-weight: 600; color: #2c2f32; display: block; margin-bottom: 4rpx; }
.courier-stats { display: flex; gap: 16rpx; }
.stat { font-size: 20rpx; color: #9a9da0; }
.chat-btn { display: flex; align-items: center; gap: 6rpx; padding: 12rpx 20rpx; background: #f3e5f5; border: none; border-radius: 20rpx; flex-shrink: 0; }
.chat-btn:active { background: #e1bee7; }
.chat-txt { font-size: 22rpx; color: #9C27B0; font-weight: 600; }

/* 底部安全�?*/
.safe-bottom { height: 160rpx; }

/* 操作�?*/
.action-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; gap: 16rpx; padding: 16rpx 24rpx; padding-bottom: calc(16rpx + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.05); z-index: 100; }
.btn { flex: 1; height: 80rpx; border-radius: 16rpx; font-size: 28rpx; font-weight: 600; border: none; display: flex; align-items: center; justify-content: center; }
.btn:active { opacity: 0.9; }
.btn[disabled] { opacity: 0.5; }
.btn-outline { background: #fff; color: #6c757d; border: 2rpx solid #e5e8ec; }
.btn-primary { background: linear-gradient(135deg,#1E88E5,#1565C0); color: #fff; box-shadow: 0 4rpx 16rpx rgba(30,136,229,0.3); }
.btn-full { flex: none; width: 100%; }

/* 弹窗 */
.popup-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: flex-end; }
.popup-content { width: 100%; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 20rpx; padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); animation: up 0.3s ease; }
@keyframes up { from { transform: translateY(100%); } to { transform: translateY(0); } }
.popup-item { display: flex; align-items: center; justify-content: center; gap: 10rpx; padding: 28rpx; font-size: 28rpx; color: #2c2f32; border-bottom: 1rpx solid #f0f2f5; }
.popup-item:last-of-type { border: none; }
.popup-item:active { background: #f8f9fa; }
.popup-item .red { color: #F44336; }
.popup-cancel { margin-top: 12rpx; padding: 28rpx; text-align: center; font-size: 28rpx; color: #9a9da0; background: #f8f9fa; border-radius: 20rpx; }

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .page-container { background: #121212; }
  .nav-bar, .card, .action-bar { background: #1e1e1e; }
  .nav-title, .card-title, .val, .courier-name, .contact-val { color: #fff; }
}
</style>