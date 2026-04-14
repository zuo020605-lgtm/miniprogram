const express = require('express')
const router = express.Router()
const { mockUnifiedOrder, mockQueryOrder } = require('../models/payment')

// Mock统一下单接口
router.post('/unifiedorder', async (req, res) => {
  try {
    const { body } = req.body
    if (!body) {
      return res.status(400).json({ success: false, message: '缺少body参数' })
    }

    const result = await mockUnifiedOrder(req.body)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Unified order error:', error)
    res.status(400).json({ success: false, message: error.message || '下单失败' })
  }
})

// Mock查询订单接口
router.get('/query', async (req, res) => {
  try {
    const { out_trade_no } = req.query
    if (!out_trade_no) {
      return res.status(400).json({ success: false, message: '缺少out_trade_no参数' })
    }

    const result = await mockQueryOrder(out_trade_no)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error('Query order error:', error)
    res.status(500).json({ success: false, message: '查询订单失败' })
  }
})

// Mock支付回调接口
router.post('/notify', (req, res) => {
  // Mock支付成功回调
  res.json({ success: true, data: { return_code: 'SUCCESS', return_msg: 'OK' } })
})

module.exports = router
