const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 读取交易记录
router.get('/transactions', (req, res) => {
  try {
    const transactionsPath = path.join(__dirname, '../../../mock-db/transactions.json');
    let transactions = [];
    
    if (fs.existsSync(transactionsPath)) {
      const data = fs.readFileSync(transactionsPath, 'utf8');
      const transactionsData = JSON.parse(data);
      // 如果是对象格式，转换为数组
      transactions = Array.isArray(transactionsData) ? transactionsData : Object.values(transactionsData);
    }
    
    res.json({
      success: true,
      data: {
        list: transactions,
        total: transactions.length
      }
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取交易记录失败：' + error.message
    });
  }
});

// 读取提现申请
router.get('/withdrawals', (req, res) => {
  try {
    const withdrawalsPath = path.join(__dirname, '../../../mock-db/withdrawals.json');
    let withdrawals = [];
    
    if (fs.existsSync(withdrawalsPath)) {
      const data = fs.readFileSync(withdrawalsPath, 'utf8');
      const withdrawalsData = JSON.parse(data);
      // 如果是对象格式，转换为数组
      withdrawals = Array.isArray(withdrawalsData) ? withdrawalsData : Object.values(withdrawalsData);
    }
    
    res.json({
      success: true,
      data: {
        list: withdrawals,
        total: withdrawals.length
      }
    });
  } catch (error) {
    console.error('获取提现申请失败:', error);
    res.status(500).json({
      success: false,
      message: '获取提现申请失败：' + error.message
    });
  }
});

// 充值
router.post('/recharge', (req, res) => {
  try {
    const { userId, amount, remark } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: '用户 ID 和金额不能为空'
      });
    }
    
    // 创建充值记录
    const newTransaction = {
      id: 'TXN' + Date.now(),
      userId: userId,
      type: 'recharge',
      amount: amount * 100, // 转换为分
      status: 'success',
      createdAt: Date.now(),
      remark: remark || ''
    };
    
    // 读取现有交易记录
    const transactionsPath = path.join(__dirname, '../../../mock-db/transactions.json');
    let transactions = [];
    if (fs.existsSync(transactionsPath)) {
      const data = fs.readFileSync(transactionsPath, 'utf8');
      transactions = JSON.parse(data);
    }
    
    // 添加新交易记录
    transactions.unshift(newTransaction);
    fs.writeFileSync(transactionsPath, JSON.stringify(transactions, null, 2));
    
    res.json({
      success: true,
      message: '充值成功',
      data: newTransaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '充值失败：' + error.message
    });
  }
});

// 审核提现
router.post('/withdrawals/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    
    const withdrawalsPath = path.join(__dirname, '../../../mock-db/withdrawals.json');
    let withdrawals = [];
    
    if (fs.existsSync(withdrawalsPath)) {
      const data = fs.readFileSync(withdrawalsPath, 'utf8');
      withdrawals = JSON.parse(data);
    }
    
    const withdrawal = withdrawals.find(w => w.id === id);
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: '提现申请不存在'
      });
    }
    
    withdrawal.status = action === 'approve' ? 'approved' : 'rejected';
    fs.writeFileSync(withdrawalsPath, JSON.stringify(withdrawals, null, 2));
    
    res.json({
      success: true,
      message: action === 'approve' ? '已通过提现申请' : '已拒绝提现申请'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '审核失败：' + error.message
    });
  }
});

module.exports = router;
