const fs = require('fs')
const path = require('path')
const { createMessage } = require('./message')

// 订单数据文件路径
const ordersPath = path.join(__dirname, '../../../mock-db/orders.json')

// Mock订单数据库
const mockOrderDB = {
  // 订单列表
  orders: {},
  // 自增订单ID
  nextId: 1,
  
  // 从文件加载订单数据
  loadOrders() {
    try {
      if (fs.existsSync(ordersPath)) {
        const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'))
        let normalized = false
        Object.values(ordersData).forEach(order => {
          if (order.status === 'PENDING' && order.paymentStatus === undefined) {
            order.status = 'WAITING_PAYMENT'
            order.paymentStatus = 'UNPAID'
            order.paid = false
            order.paidAmount = 0
            normalized = true
          }
        })
        this.orders = ordersData
        // 计算下一个订单ID
        const ids = Object.keys(ordersData).map(id => parseInt(id))
        if (ids.length > 0) {
          this.nextId = Math.max(...ids) + 1
        }
        console.log('从文件加载了', Object.keys(ordersData).length, '个订单')
        if (normalized) {
          this.saveOrders()
        }
      }
    } catch (error) {
      console.error('加载订单数据失败:', error)
      this.orders = {}
      this.nextId = 1
    }
  },
  
  // 保存订单数据到文件
  saveOrders() {
    try {
      fs.writeFileSync(ordersPath, JSON.stringify(this.orders, null, 2), 'utf8')
      console.log('订单数据已保存到文件')
    } catch (error) {
      console.error('保存订单数据失败:', error)
    }
  }
}

// 初始化加载订单数据
mockOrderDB.loadOrders()

// Mock创建订单
async function mockCreateOrder(orderData) {
  const id = mockOrderDB.nextId++
  const order = {
    id: id,
    openid: orderData.openid,
    title: orderData.title,
    description: orderData.description,
    price: orderData.price,
    status: 'WAITING_PAYMENT', // WAITING_PAYMENT, PENDING, PROCESSING, COMPLETED, CANCELLED
    createTime: Date.now(),
    updateTime: Date.now(),
    location: orderData.location || '',
    runner: null,
    contact: orderData.contact || {},
    type: orderData.type || 'campus-errand',
    weight: orderData.weight || '',
    pickupLocation: orderData.pickupLocation || '',
    pickupLocationLatitude: orderData.pickupLocationLatitude || null,
    pickupLocationLongitude: orderData.pickupLocationLongitude || null,
    deliveryLocation: orderData.deliveryLocation || '',
    deliveryLocationLatitude: orderData.deliveryLocationLatitude || null,
    deliveryLocationLongitude: orderData.deliveryLocationLongitude || null,
    examLocation: orderData.examLocation || '',
    examSubject: orderData.examSubject || '',
    examClassroom: orderData.examClassroom || '',
    teachingBuilding: orderData.teachingBuilding || '',
    classroom: orderData.classroom || '',
    courseName: orderData.courseName || '',
    courseTeacher: orderData.courseTeacher || '',
    courseTime: orderData.courseTime || '',
    needSignIn: !!orderData.needSignIn,
    classroomSize: orderData.classroomSize || '',
    date: orderData.date || '',
    time: orderData.time || '',
    runnerOpenid: '',
    paymentStatus: 'UNPAID',
    paid: false,
    paidAmount: 0,
    reviewed: false,
    review: null
  }

  mockOrderDB.orders[id] = order
  // 保存到文件
  mockOrderDB.saveOrders()

  return {
    success: true,
    data: order
  }
}

// Mock获取订单列表
async function mockGetOrders(openid, status, type, page = 1, pageSize = 10) {
  let filteredOrders = Object.values(mockOrderDB.orders)

  // 按openid过滤
  if (openid) {
    filteredOrders = filteredOrders.filter(order => order.openid === openid)
  }

  // 按状态过滤
  if (status) {
    filteredOrders = filteredOrders.filter(order => order.status === status)
  }

  // 按类型过滤
  if (type) {
    filteredOrders = filteredOrders.filter(order => order.type === type)
  }

  // 按时间倒序排序
  filteredOrders.sort((a, b) => b.createTime - a.createTime)

  // 分页
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedOrders = filteredOrders.slice(start, end)

  return {
    success: true,
    data: {
      list: paginatedOrders,
      total: filteredOrders.length,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(filteredOrders.length / pageSize)
    }
  }
}

// Mock获取订单详情
async function mockGetOrderDetail(id) {
  const order = mockOrderDB.orders[id]
  if (!order) {
    throw new Error('订单不存在')
  }

  return {
    success: true,
    data: order
  }
}

async function mockAcceptOrder(id, accepterOpenid) {
  const order = mockOrderDB.orders[id]
  if (!order) {
    throw new Error('订单不存在')
  }

  if (order.status !== 'PENDING') {
    throw new Error('当前订单不可接单')
  }

  if (order.openid === accepterOpenid) {
    throw new Error('不能接取自己发布的订单')
  }

  order.status = 'PROCESSING'
  order.runnerOpenid = accepterOpenid
  order.runner = {
    openid: accepterOpenid,
    nickName: `跑腿员${String(accepterOpenid).slice(-4)}`
  }
  order.acceptTime = Date.now()
  order.updateTime = Date.now()
  mockOrderDB.saveOrders()

  try {
    await createMessage({
      userId: accepterOpenid,
      conversationId: String(id),
      fromOpenid: accepterOpenid,
      toOpenid: order.openid,
      title: `订单 ${id}`,
      content: `订单「${order.title || id}」已被接单，可以开始沟通。`,
      messageType: 'system',
      type: 'chat'
    })
  } catch (error) {
    console.warn('创建接单会话失败:', error.message)
  }

  return {
    success: true,
    data: order
  }
}

async function mockFinishOrder(id, finisherOpenid) {
  const order = mockOrderDB.orders[id]
  if (!order) {
    throw new Error('订单不存在')
  }

  if (order.status !== 'PROCESSING') {
    throw new Error('当前订单不可完成')
  }

  if (order.runnerOpenid && order.runnerOpenid !== finisherOpenid && order.openid !== finisherOpenid) {
    throw new Error('只有订单相关用户可以确认完成')
  }

  order.status = 'COMPLETED'
  order.finishTime = Date.now()
  order.updateTime = Date.now()
  mockOrderDB.saveOrders()

  return {
    success: true,
    data: order
  }
}

async function mockCancelOrder(id, openid) {
  const order = mockOrderDB.orders[id]
  if (!order) {
    throw new Error('订单不存在')
  }

  if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
    throw new Error('当前订单不可取消')
  }

  if (order.openid !== openid) {
    throw new Error('只有发布者可以取消订单')
  }

  order.status = 'CANCELLED'
  order.cancelTime = Date.now()
  order.updateTime = Date.now()
  mockOrderDB.saveOrders()

  return {
    success: true,
    data: order
  }
}

async function mockUpdateOrder(id, orderData) {
  const order = mockOrderDB.orders[id]
  if (!order) {
    throw new Error('订单不存在')
  }

  Object.assign(order, orderData, {
    id: order.id,
    updateTime: Date.now()
  })
  mockOrderDB.saveOrders()

  return {
    success: true,
    data: order
  }
}

async function mockDeleteOrder(id) {
  if (!mockOrderDB.orders[id]) {
    throw new Error('订单不存在')
  }

  delete mockOrderDB.orders[id]
  mockOrderDB.saveOrders()

  return {
    success: true,
    message: '删除成功'
  }
}

async function mockReviewOrder(id, reviewData) {
  const order = mockOrderDB.orders[id]
  if (!order) {
    throw new Error('订单不存在')
  }

  order.reviewed = true
  order.review = {
    rating: reviewData.rating,
    tags: reviewData.tags || [],
    content: reviewData.content || '',
    reviewerOpenid: reviewData.openid || '',
    createTime: Date.now()
  }
  order.updateTime = Date.now()
  mockOrderDB.saveOrders()

  return {
    success: true,
    data: order
  }
}

async function mockMarkOrderPaid(id, paymentData = {}) {
  const order = mockOrderDB.orders[id]
  if (!order) {
    throw new Error('订单不存在')
  }

  const paidFee = Number(paymentData.total_fee || 0)
  if (!Number.isFinite(paidFee) || paidFee <= 0) {
    throw new Error('支付金额异常')
  }

  order.paymentStatus = 'PAID'
  order.paid = true
  order.paidAmount = paidFee
  if (order.status === 'WAITING_PAYMENT') {
    order.status = 'PENDING'
  }
  order.paymentMethod = paymentData.paymentMethod || 'wechat'
  order.outTradeNo = paymentData.out_trade_no || ''
  order.paidTime = Date.now()
  order.updateTime = Date.now()
  mockOrderDB.saveOrders()

  return {
    success: true,
    data: order
  }
}

module.exports = {
  mockCreateOrder,
  mockGetOrders,
  mockGetOrderDetail,
  mockAcceptOrder,
  mockFinishOrder,
  mockCancelOrder,
  mockUpdateOrder,
  mockDeleteOrder,
  mockReviewOrder,
  mockMarkOrderPaid
}
