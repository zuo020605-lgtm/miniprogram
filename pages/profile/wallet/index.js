// 我的钱包
Page({
  data: {
    balance: '128.50',
    weeklyIncome: [
      { day: '周一', value: 30 },
      { day: '周二', value: 50 },
      { day: '周三', value: 20 },
      { day: '周四', value: 80 },
      { day: '周五', value: 60 },
      { day: '周六', value: 90 },
      { day: '周日', value: 40 }
    ],
    transactions: [
      { title: '任务收入-取快递', time: '2026-04-08 10:30', amount: '+5.00' },
      { title: '任务收入-买奶茶', time: '2026-04-08 09:15', amount: '+15.00' },
      { title: '提现到微信', time: '2026-04-07 18:00', amount: '-50.00' },
      { title: '任务收入-打印资料', time: '2026-04-07 14:20', amount: '+8.00' }
    ]
  },

  onLoad(options) {
    console.log('页面加载:', options)
  },

  onShow() {
    console.log('页面显示')
  },

  onHide() {
    console.log('页面隐藏')
  },

  onUnload() {
    console.log('页面卸载')
  },

  // 提现
  withdraw() {
    wx.showModal({
      title: '提现',
      content: '确定要提现到微信钱包吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '提现申请已提交', icon: 'success' })
        }
      }
    })
  },

  // 充值
  recharge() {
    wx.showModal({
      title: '充值',
      content: '确定要充值吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '充值功能开发中', icon: 'none' })
        }
      }
    })
  },

  // 查看全部交易
  viewAllTransactions() {
    wx.showToast({ title: '查看全部交易', icon: 'none' })
  }
})