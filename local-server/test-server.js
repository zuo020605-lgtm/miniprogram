const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3001

app.use(express.json())

// 简单的测试路由
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test successful' })
})

// 读取订单列表
app.get('/order/list', (req, res) => {
  try {
    const { openid, status, page = 1, pageSize = 10 } = req.query
    console.log('请求参数:', { openid, status, page, pageSize })

    const ordersPath = path.join(__dirname, '..', 'mock-db', 'orders.json')
    console.log('尝试读取文件:', ordersPath)

    let allOrders = []

    if (fs.existsSync(ordersPath)) {
      const fileContent = fs.readFileSync(ordersPath, 'utf8')
      const ordersData = JSON.parse(fileContent)
      allOrders = Object.values(ordersData)

      console.log('从文件读取了', allOrders.length, '个订单')

      // 过滤订单
      let filteredOrders = allOrders
      if (openid) {
        filteredOrders = filteredOrders.filter(order => order.openid === openid)
        console.log(`过滤 openid=${openid} 后剩下`, filteredOrders.length, '个订单')
      }

      // 按状态过滤
      if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status)
      }

      // 按时间倒序排序
      filteredOrders.sort((a, b) => new Date(b.createdAt || b.createTime) - new Date(a.createdAt || a.createTime))

      // 分页
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const paginatedOrders = filteredOrders.slice(start, end)

      res.json({
        success: true,
        data: {
          list: paginatedOrders,
          total: filteredOrders.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(filteredOrders.length / pageSize)
        }
      })
    } else {
      res.json({
        success: false,
        message: '文件不存在'
      })
    }
  } catch (error) {
    console.error('错误:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// 读取订单详情
app.get('/order/detail', (req, res) => {
  try {
    const { id } = req.query
    console.log('请求订单详情:', id)

    const ordersPath = path.join(__dirname, '..', 'mock-db', 'orders.json')

    if (fs.existsSync(ordersPath)) {
      const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'))
      const order = ordersData[id]

      if (order) {
        res.json({
          success: true,
          data: order
        })
      } else {
        res.json({
          success: false,
          message: '订单不存在'
        })
      }
    } else {
      res.json({
        success: false,
        message: '文件不存在'
      })
    }
  } catch (error) {
    console.error('错误:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// 创建订单
app.post('/order/create', (req, res) => {
  try {
    const { orderData } = req.body
    console.log('创建订单:', orderData)

    if (!orderData) {
      return res.status(400).json({ success: false, message: '缺少订单数据' })
    }

    // 生成新的订单ID
    const orderId = 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)

    const newOrder = {
      id: orderId,
      openid: orderData.openid,
      title: orderData.title,
      description: orderData.description,
      price: orderData.price,
      location: orderData.location || orderData.address || '',
      contact: orderData.contact || {},
      status: 'PENDING',
      type: 'running',
      createTime: Date.now(),
      updateTime: Date.now(),
      runner: null,
      deliveryInfo: {}
    }

    // 读取现有订单
    const ordersPath = path.join(__dirname, '..', 'mock-db', 'orders.json')
    let orders = {}

    if (fs.existsSync(ordersPath)) {
      const fileContent = fs.readFileSync(ordersPath, 'utf8')
      orders = JSON.parse(fileContent)
    }

    // 添加新订单
    orders[orderId] = newOrder

    // 保存回文件
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2))

    res.json({
      success: true,
      data: newOrder
    })
  } catch (error) {
    console.error('创建订单错误:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`)
})