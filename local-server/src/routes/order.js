const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const {
  mockCreateOrder,
  mockGetOrders,
  mockGetOrderDetail,
  mockAcceptOrder,
  mockFinishOrder,
  mockCancelOrder,
  mockUpdateOrder,
  mockDeleteOrder,
  mockReviewOrder
} = require('../models/order')

// 创建订单
router.post('/create', async (req, res) => {
  try {
    const { orderData } = req.body
    if (!orderData) {
      return res.status(400).json({ success: false, message: '缺少订单数据' })
    }

    const result = await mockCreateOrder(orderData)
    res.json(result)
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ success: false, message: '创建订单失败' })
  }
})

// 获取订单列表
router.get('/list', async (req, res) => {
  try {
    const { openid, status, type, page = 1, pageSize = 10 } = req.query
    if (!openid) {
      return res.status(400).json({ success: false, message: '缺少openid参数' })
    }

    console.log('请求参数:', { openid, status, type, page, pageSize })

    const result = await mockGetOrders(openid, status, type, parseInt(page), parseInt(pageSize))
    
    res.json(result)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ success: false, message: '获取订单列表失败' })
  }
})

// 获取订单详情
router.get('/detail', async (req, res) => {
  try {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少订单ID参数' })
    }

    const result = await mockGetOrderDetail(id)
    res.json(result)
  } catch (error) {
    console.error('Get order detail error:', error)
    res.status(500).json({ success: false, message: '获取订单详情失败' })
  }
})

// 接单
router.post('/accept', async (req, res) => {
  try {
    const { id, orderId, accepterOpenid } = req.body
    if ((!id && !orderId) || !accepterOpenid) {
      return res.status(400).json({ success: false, message: '缺少接单参数' })
    }

    const result = await mockAcceptOrder(id || orderId, accepterOpenid)
    res.json(result)
  } catch (error) {
    console.error('Accept order error:', error)
    res.status(400).json({ success: false, message: error.message || '接单失败' })
  }
})

// 完成订单
router.post('/finish', async (req, res) => {
  try {
    const { id, orderId, finisherOpenid } = req.body
    if ((!id && !orderId) || !finisherOpenid) {
      return res.status(400).json({ success: false, message: '缺少完成订单参数' })
    }

    const result = await mockFinishOrder(id || orderId, finisherOpenid)
    res.json(result)
  } catch (error) {
    console.error('Finish order error:', error)
    res.status(400).json({ success: false, message: error.message || '完成订单失败' })
  }
})

// 取消订单
router.post('/cancel', async (req, res) => {
  try {
    const { id, orderId, openid } = req.body
    if ((!id && !orderId) || !openid) {
      return res.status(400).json({ success: false, message: '缺少取消订单参数' })
    }

    const result = await mockCancelOrder(id || orderId, openid)
    res.json(result)
  } catch (error) {
    console.error('Cancel order error:', error)
    res.status(400).json({ success: false, message: error.message || '取消订单失败' })
  }
})

// 更新订单（后台管理）
router.post('/update', async (req, res) => {
  try {
    const { id, ...orderData } = req.body
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少订单 ID 参数' })
    }

    const result = await mockUpdateOrder(id, orderData)
    res.json(result)
  } catch (error) {
    console.error('Update order error:', error)
    res.status(400).json({ success: false, message: error.message || '更新订单失败' })
  }
})

// 删除订单（后台管理）
router.post('/delete', async (req, res) => {
  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少订单 ID 参数' })
    }

    const result = await mockDeleteOrder(id)
    res.json(result)
  } catch (error) {
    console.error('Delete order error:', error)
    res.status(400).json({ success: false, message: error.message || '删除订单失败' })
  }
})

// 提交评价
router.post('/review', async (req, res) => {
  try {
    const { id, orderId, ...reviewData } = req.body
    if (!id && !orderId) {
      return res.status(400).json({ success: false, message: '缺少订单 ID 参数' })
    }

    const result = await mockReviewOrder(id || orderId, reviewData)
    res.json(result)
  } catch (error) {
    console.error('Review order error:', error)
    res.status(400).json({ success: false, message: error.message || '提交评价失败' })
  }
})

// 调试用：读取所有订单
router.get('/debug', (req, res) => {
  try {
    const ordersPath = path.join(__dirname, '../../../mock-db/orders.json')
    console.log('尝试读取文件:', ordersPath)

    if (fs.existsSync(ordersPath)) {
      const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'))
      res.json({
        success: true,
        message: '读取成功',
        total: Object.keys(ordersData).length,
        orders: ordersData
      })
    } else {
      res.json({
        success: false,
        message: '文件不存在'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// 返回所有订单（用于后台管理系统）
router.get('/all', (req, res) => {
  try {
    const ordersPath = path.join(__dirname, '../../../mock-db/orders.json')
    let allOrders = []

    if (fs.existsSync(ordersPath)) {
      const fileContent = fs.readFileSync(ordersPath, 'utf8')
      const ordersData = JSON.parse(fileContent)
      allOrders = Object.values(ordersData)
    }

    res.json({
      success: true,
      data: {
        list: allOrders,
        total: allOrders.length,
        message: '所有订单'
      }
    })
  } catch (error) {
    console.error('错误:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router
