const fs = require('fs')
const path = require('path')
const { createMessage } = require('./message')
const { findUserByOpenid, isAdminOpenid, isVerifiedRunnerOpenid } = require('./user')

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

function getActor(openid, operatorRole) {
  const user = findUserByOpenid(openid)
  const isAdminUser = isAdminOpenid(openid)
  const isAdminChannel = operatorRole === 'admin' && !openid
  const isAdmin = isAdminUser || isAdminChannel
  return {
    openid,
    operatorRole: operatorRole || (user && user.role) || 'user',
    user,
    isAdmin,
    isPublisher(order) {
      return !!(order && openid && order.openid === openid)
    },
    isRunner(order) {
      return !!(order && openid && order.runnerOpenid === openid)
    },
    isVerifiedRunner: isVerifiedRunnerOpenid(openid)
  }
}

function assertAdmin(actor) {
  if (!actor.isAdmin) {
    throw new Error('仅管理员可执行该操作')
  }
}

function assertEditableByPublisherOrAdmin(order, actor) {
  if (actor.isAdmin) return
  if (!actor.isPublisher(order)) {
    throw new Error('只有发布者可以修改订单')
  }
  if (order.status !== 'WAITING_PAYMENT' && order.status !== 'PENDING') {
    throw new Error('当前订单状态不可修改')
  }
}

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

function buildReviewFromOrder(order) {
  if (!order || !order.reviewed || !order.review) {
    return null
  }

  const review = order.review
  const rating = Number(review.rating || 0)
  return {
    id: `${order.id}_review`,
    orderId: order.id,
    orderTitle: order.title || `订单 ${order.id}`,
    orderType: order.type || 'campus-errand',
    publisherOpenid: order.openid || '',
    runnerOpenid: order.runnerOpenid || '',
    reviewerOpenid: review.reviewerOpenid || order.openid || '',
    targetOpenid: review.targetOpenid || order.runnerOpenid || '',
    rating,
    tags: Array.isArray(review.tags) ? review.tags : [],
    content: review.content || '',
    createTime: review.createTime || order.updateTime || order.finishTime || order.createTime || Date.now()
  }
}

function getFilteredReviews(filters = {}) {
  return Object.values(mockOrderDB.orders)
    .map(buildReviewFromOrder)
    .filter(Boolean)
    .filter(review => {
      if (filters.orderId && String(review.orderId) !== String(filters.orderId)) return false
      if (filters.runnerOpenid && review.runnerOpenid !== filters.runnerOpenid) return false
      if (filters.publisherOpenid && review.publisherOpenid !== filters.publisherOpenid) return false
      if (filters.reviewerOpenid && review.reviewerOpenid !== filters.reviewerOpenid) return false
      if (filters.targetOpenid && review.targetOpenid !== filters.targetOpenid) return false
      return true
    })
    .sort((a, b) => b.createTime - a.createTime)
}

async function mockGetReviewList(filters = {}, page = 1, pageSize = 10) {
  const reviews = getFilteredReviews(filters)
  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    success: true,
    data: {
      list: reviews.slice(start, end),
      total: reviews.length,
      page,
      pageSize,
      totalPages: Math.ceil(reviews.length / pageSize)
    }
  }
}

async function mockGetReviewStats(filters = {}) {
  const targetOpenid = filters.runnerOpenid || filters.targetOpenid || filters.openid || ''
  const reviews = getFilteredReviews({
    ...filters,
    runnerOpenid: filters.runnerOpenid || filters.targetOpenid || filters.openid || ''
  })
  const completedOrders = Object.values(mockOrderDB.orders).filter(order => {
    if (targetOpenid && order.runnerOpenid !== targetOpenid) return false
    return order.status === 'COMPLETED' || order.status === 'REVIEWED'
  }).length

  const totalReviews = reviews.length
  const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalReviews ? Number((ratingSum / totalReviews).toFixed(1)) : 0
  const goodReviews = reviews.filter(review => review.rating >= 4).length
  const goodRate = totalReviews ? Math.round((goodReviews / totalReviews) * 100) : 0
  const tagMap = {}
  reviews.forEach(review => {
    review.tags.forEach(tag => {
      tagMap[tag] = (tagMap[tag] || 0) + 1
    })
  })
  const tagStats = Object.entries(tagMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)

  return {
    success: true,
    data: {
      targetOpenid,
      completedOrders,
      totalReviews,
      averageRating,
      averageRatingText: averageRating ? averageRating.toFixed(1) : '0.0',
      goodRate,
      tagStats,
      latestReviews: reviews.slice(0, 3)
    }
  }
}

async function mockAcceptOrder(id, accepterOpenid, operatorRole) {
  const order = mockOrderDB.orders[id]
  if (!order) {
    throw new Error('订单不存在')
  }
  const actor = getActor(accepterOpenid, operatorRole)

  if (order.status !== 'PENDING') {
    throw new Error('当前订单不可接单')
  }

  if (actor.isPublisher(order)) {
    throw new Error('不能接取自己发布的订单')
  }

  if (!actor.isVerifiedRunner) {
    throw new Error('只有已认证接单员可以接单')
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

async function mockFinishOrder(id, finisherOpenid, operatorRole) {
  const order = mockOrderDB.orders[id]
  if (!order) {
    throw new Error('订单不存在')
  }
  const actor = getActor(finisherOpenid, operatorRole)

  if (order.status !== 'PROCESSING') {
    throw new Error('当前订单不可完成')
  }

  if (!actor.isAdmin && !actor.isRunner(order) && !actor.isPublisher(order)) {
    throw new Error('只有发布者、接单者或管理员可以确认完成')
  }

  order.status = 'COMPLETED'
  order.finishTime = Date.now()
  order.finishedBy = actor.openid || ''
  order.finishedByRole = actor.isAdmin ? 'admin' : (actor.isRunner(order) ? 'runner' : 'publisher')
  order.updateTime = Date.now()
  mockOrderDB.saveOrders()

  return {
    success: true,
    data: order
  }
}

async function mockCancelOrder(id, openid, operatorRole) {
  const order = mockOrderDB.orders[id]
  if (!order) {
    throw new Error('订单不存在')
  }
  const actor = getActor(openid, operatorRole)

  if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
    throw new Error('当前订单不可取消')
  }

  if (!actor.isAdmin && !actor.isPublisher(order)) {
    throw new Error('只有发布者或管理员可以取消订单')
  }

  order.status = 'CANCELLED'
  order.cancelTime = Date.now()
  order.cancelledBy = actor.openid || ''
  order.cancelledByRole = actor.isAdmin ? 'admin' : 'publisher'
  order.updateTime = Date.now()
  mockOrderDB.saveOrders()

  return {
    success: true,
    data: order
  }
}

async function mockUpdateOrder(id, orderData, actorData = {}) {
  const order = mockOrderDB.orders[id]
  if (!order) {
    throw new Error('订单不存在')
  }
  const actor = getActor(actorData.openid || orderData.operatorOpenid || orderData.openid, actorData.operatorRole || orderData.operatorRole)
  assertEditableByPublisherOrAdmin(order, actor)

  delete orderData.operatorOpenid
  delete orderData.operatorRole
  delete orderData.openid

  Object.assign(order, orderData, {
    id: order.id,
    openid: order.openid,
    updateTime: Date.now()
  })
  mockOrderDB.saveOrders()

  return {
    success: true,
    data: order
  }
}

async function mockDeleteOrder(id, actorData = {}) {
  if (!mockOrderDB.orders[id]) {
    throw new Error('订单不存在')
  }
  const actor = getActor(actorData.openid || actorData.operatorOpenid, actorData.operatorRole)
  assertAdmin(actor)

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
  const actor = getActor(reviewData.openid, reviewData.operatorRole)
  if (!actor.isPublisher(order)) {
    throw new Error('只有发布者可以评价订单')
  }
  if (order.status !== 'COMPLETED') {
    throw new Error('订单完成后才可以评价')
  }
  if (order.reviewed) {
    throw new Error('订单已评价')
  }

  order.reviewed = true
  order.review = {
    rating: reviewData.rating,
    tags: reviewData.tags || [],
    content: reviewData.content || '',
    reviewerOpenid: reviewData.openid || '',
    targetOpenid: order.runnerOpenid || '',
    orderId: order.id,
    orderTitle: order.title || '',
    createTime: Date.now()
  }
  order.updateTime = Date.now()
  mockOrderDB.saveOrders()

  if (order.runnerOpenid) {
    try {
      await createMessage({
        userId: order.openid,
        conversationId: String(id),
        fromOpenid: order.openid,
        toOpenid: order.runnerOpenid,
        title: `订单 ${id} 收到评价`,
        content: `你收到 ${reviewData.rating} 星评价：${reviewData.content || (reviewData.tags || []).join('、') || '暂无文字评价'}`,
        messageType: 'system',
        type: 'review'
      })
    } catch (error) {
      console.warn('创建评价通知失败:', error.message)
    }
  }

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

  const actor = getActor(paymentData.openid, paymentData.operatorRole)
  const isAdminPayer = !!(actor.user && actor.isAdmin)
  if (!isAdminPayer && !actor.isPublisher(order)) {
    throw new Error('只有发布者或管理员可以支付订单')
  }

  if (order.status !== 'WAITING_PAYMENT') {
    throw new Error('当前订单不可支付')
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
  mockGetReviewList,
  mockGetReviewStats,
  mockMarkOrderPaid
}
