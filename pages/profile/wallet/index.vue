<template>
  <view class="wallet-page">
    <view class="wallet-content">
      <!-- 余额信息 -->
      <view class="balance-section">
        <view class="balance-header">
          <text class="balance-label">账户余额</text>
          <text class="balance-value">{{balance}}</text>
        </view>
        <view class="balance-actions">
          <button class="action-btn withdraw-btn" @click="withdraw">提现</button>
          <button class="action-btn recharge-btn" @click="recharge">充值</button>
        </view>
      </view>
      
      <!-- 周收入统计 -->
      <view class="income-section">
        <view class="section-header">
          <text class="section-title">周收入统计</text>
        </view>
        <view class="income-chart">
          <!-- 模拟图表 -->
          <view class="chart-container">
            <view class="chart-bar" v-for="(item, index) in weeklyIncome" :key="index">
              <view class="bar" :style="{ height: item.value + '%' }"></view>
              <text class="bar-label">{{item.day}}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 收支明细 -->
      <view class="transactions-section">
        <view class="section-header">
          <text class="section-title">收支明细</text>
          <text class="section-more" @click="viewAllTransactions">查看全部</text>
        </view>
        <view class="transaction-list">
          <view class="transaction-item" v-for="(item, index) in transactions" :key="index">
            <view class="transaction-info">
              <text class="transaction-title">{{item.title}}</text>
              <text class="transaction-time">{{item.time}}</text>
            </view>
            <text class="transaction-amount" :class="item.type === 'income' ? 'income' : 'expense'">{{item.amount}}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      balance: '¥1,234.56',
      weeklyIncome: [
        { day: '周一', value: 30 },
        { day: '周二', value: 45 },
        { day: '周三', value: 25 },
        { day: '周四', value: 60 },
        { day: '周五', value: 40 },
        { day: '周六', value: 55 },
        { day: '周日', value: 35 }
      ],
      transactions: [
        { title: '任务收入', time: '2024-01-15 14:30', amount: '+¥50.00', type: 'income' },
        { title: '提现', time: '2024-01-14 10:20', amount: '-¥200.00', type: 'expense' },
        { title: '任务收入', time: '2024-01-13 16:45', amount: '+¥35.00', type: 'income' },
        { title: '充值', time: '2024-01-12 09:15', amount: '+¥500.00', type: 'income' }
      ]
    };
  },
  methods: {
    withdraw() {
      // 模拟提现功能
      uni.showModal({
        title: '提现',
        content: '请输入提现金额',
        placeholderText: '请输入金额',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '提现申请已提交',
              icon: 'success'
            });
          }
        }
      });
    },
    recharge() {
      // 模拟充值功能
      uni.showModal({
        title: '充值',
        content: '请输入充值金额',
        placeholderText: '请输入金额',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '充值成功',
              icon: 'success'
            });
          }
        }
      });
    },
    viewAllTransactions() {
      // 模拟查看全部收支明细
      uni.showToast({
        title: '查看全部收支明细',
        icon: 'none'
      });
    }
  }
};
</script>

<style scoped>
.wallet-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 24px;
}

.wallet-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 余额信息 */
.balance-section {
  background-color: #1E88E5;
  border-radius: 16px;
  padding: 24px;
  color: #ffffff;
}

.balance-header {
  margin-bottom: 20px;
}

.balance-label {
  font-size: 14px;
  opacity: 0.8;
  display: block;
  margin-bottom: 8px;
}

.balance-value {
  font-size: 32px;
  font-weight: 800;
  display: block;
}

.balance-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1E88E5;
  background-color: rgba(255, 255, 255, 0.9);
}

/* 周收入统计 */
.income-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2f32;
}

.section-more {
  font-size: 12px;
  color: #1E88E5;
}

.income-chart {
  height: 120px;
}

.chart-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 20px;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 24px;
  background-color: #1E88E5;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 10px;
  color: #9a9da0;
}

/* 收支明细 */
.transactions-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e8ec;
}

.transaction-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.transaction-info {
  flex: 1;
}

.transaction-title {
  font-size: 14px;
  color: #2c2f32;
  display: block;
  margin-bottom: 4px;
}

.transaction-time {
  font-size: 12px;
  color: #9a9da0;
  display: block;
}

.transaction-amount {
  font-size: 14px;
  font-weight: 600;
}

.transaction-amount.income {
  color: #4CAF50;
}

.transaction-amount.expense {
  color: #F44336;
}
</style>