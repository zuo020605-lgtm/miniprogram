/**
 * 数据工具类 - 提供数据缓存、对比计算等功能
 */
const DataUtils = {
  // 数据缓存
  cache: {
    historicalData: null,
    lastFetchTime: 0,
    cacheDuration: 300000 // 5 分钟缓存
  },

  /**
   * 从 localStorage 加载历史数据
   */
  loadHistoricalData() {
    try {
      const stored = localStorage.getItem('dashboard_historical_data');
      if (stored) {
        const data = JSON.parse(stored);
        // 检查数据是否在 24 小时内
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - data.timestamp < oneDay) {
          return data.data;
        }
      }
    } catch (error) {
      console.error('加载历史数据失败:', error);
    }
    return null;
  },

  /**
   * 保存历史数据到 localStorage
   */
  saveHistoricalData(data) {
    try {
      const stored = {
        timestamp: Date.now(),
        data: data
      };
      localStorage.setItem('dashboard_historical_data', JSON.stringify(stored));
    } catch (error) {
      console.error('保存历史数据失败:', error);
    }
  },

  /**
   * 计算对比百分比
   * @param {number} currentValue - 当前值
   * @param {number} historicalValue - 历史值（昨日值）
   * @returns {string} 格式化的百分比字符串，如 "+12.34%" 或 "-5.67%" 或 "N/A"
   */
  calculateChangePercentage(currentValue, historicalValue) {
    // 处理边界情况
    if (historicalValue === 0 || historicalValue === null || historicalValue === undefined) {
      if (currentValue === 0 || currentValue === null || currentValue === undefined) {
        return '0.00%'; // 都为零，显示无变化
      }
      return '+∞'; // 昨日为零，今日有值，显示无穷增长
    }

    if (currentValue === 0 || currentValue === null || currentValue === undefined) {
      return '-100.00%'; // 今日为零，显示下降 100%
    }

    const change = ((currentValue - historicalValue) / historicalValue) * 100;
    const formatted = change.toFixed(2);
    
    // 添加正负号
    if (change > 0) {
      return '+' + formatted + '%';
    } else if (change < 0) {
      return formatted + '%';
    } else {
      return '0.00%';
    }
  },

  /**
   * 获取对比变化的 CSS 类名
   * @param {string} percentageStr - 百分比字符串
   * @returns {string} CSS 类名
   */
  getChangeClass(percentageStr) {
    if (percentageStr === 'N/A' || percentageStr === '0.00%') {
      return 'change-neutral';
    }
    
    if (percentageStr.startsWith('+')) {
      return 'change-positive';
    } else if (percentageStr.startsWith('-')) {
      return 'change-negative';
    } else if (percentageStr === '+∞') {
      return 'change-positive';
    }
    
    return 'change-neutral';
  },

  /**
   * 生成模拟的历史数据（用于演示）
   * 在实际应用中，这应该从后端 API 获取
   */
  generateHistoricalData(currentData) {
    const historicalData = {
      totalOrders: Math.floor(currentData.totalOrders * 0.85), // 假设昨日订单是今日的 85%
      todayRevenue: currentData.todayRevenue * 0.9, // 假设昨日收入是今日的 90%
      activeUsers: Math.floor(currentData.activeUsers * 0.88),
      pendingMessages: Math.floor(currentData.pendingMessages * 1.2),
      totalBalance: currentData.totalBalance * 0.95,
      todayRecharge: currentData.todayRecharge * 0.88,
      todayWithdraw: currentData.todayWithdraw * 1.1,
      pendingWithdraw: Math.floor(currentData.pendingWithdraw * 1.15)
    };
    
    // 保存历史数据
    this.saveHistoricalData(historicalData);
    return historicalData;
  },

  /**
   * 获取历史数据（优先从缓存获取，没有则生成模拟数据）
   */
  getHistoricalData(currentData) {
    let historicalData = this.loadHistoricalData();
    
    if (!historicalData && currentData) {
      // 如果没有历史数据，生成模拟数据
      historicalData = this.generateHistoricalData(currentData);
    }
    
    return historicalData;
  },

  /**
   * 格式化金额
   */
  formatAmount(amount) {
    return '¥' + (amount / 100).toFixed(2);
  },

  /**
   * 格式化日期
   */
  formatDate(timestamp) {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  },

  /**
   * 格式化相对时间
   */
  formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    
    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
      return Math.floor(diff / hour) + '小时前';
    } else if (diff < 7 * day) {
      return Math.floor(diff / day) + '天前';
    } else {
      return this.formatDate(timestamp);
    }
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.DataUtils = DataUtils;
}
