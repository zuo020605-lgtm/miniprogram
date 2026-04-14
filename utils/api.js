// API 统一调用接口：前端统一走 local-server 的 3000 Mock 服务。
const API_BASE_URL = 'http://localhost:3000'

class API {
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  request(endpoint, method = 'GET', data = {}) {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseUrl}${normalizedEndpoint}`,
        method,
        header: {
          'content-type': 'application/json'
        },
        data,
        success: (res) => {
          const payload = res.data || {}
          if (res.statusCode >= 200 && res.statusCode < 300 && payload.success !== false) {
            resolve(payload)
            return
          }

          reject(new Error(payload.message || payload.error || `请求失败: ${res.statusCode}`))
        },
        fail: (err) => {
          reject(new Error('网络请求失败: ' + err.errMsg))
        }
      })
    })
  }

  unwrap(promise) {
    return promise.then(res => res.data !== undefined ? res.data : res)
  }

  buildQuery(params) {
    return Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
  }

  // 用户相关 API
  login(code) {
    return this.unwrap(this.request('/api/auth/login', 'POST', { code }))
  }

  getUserInfo(openid) {
    return this.unwrap(this.request(`/api/auth/userinfo?${this.buildQuery({ openid })}`))
  }

  updateUser(id, userInfo) {
    return this.unwrap(this.request('/api/user/update', 'POST', { id, ...userInfo }))
  }

  // 订单相关 API
  createOrder(openidOrOrderData, title, description, price, address, contact) {
    const orderData = typeof openidOrOrderData === 'object'
      ? openidOrOrderData
      : {
          openid: openidOrOrderData,
          title,
          description,
          price,
          location: address,
          contact
        }

    return this.unwrap(this.request('/api/order/create', 'POST', { orderData }))
  }

  getOrders(openid, status, type, page = 1, pageSize = 10) {
    const queryString = this.buildQuery({ openid, status, type, page, pageSize })
    return this.unwrap(this.request(`/api/order/list?${queryString}`))
  }

  getAllOrders() {
    return this.unwrap(this.request('/api/order/all'))
  }

  getAvailableOrders(type) {
    return this.getAllOrders().then(data => {
      const list = data.list || []
      return list.filter(order => {
        const typeMatched = type ? order.type === type : true
        return order.status === 'PENDING' && order.paymentStatus === 'PAID' && typeMatched
      })
    })
  }

  getOrderDetail(orderId) {
    return this.unwrap(this.request(`/api/order/detail?${this.buildQuery({ id: orderId })}`))
  }

  acceptOrder(orderId, accepterOpenid) {
    return this.unwrap(this.request('/api/order/accept', 'POST', {
      id: orderId,
      accepterOpenid
    }))
  }

  finishOrder(orderId, finisherOpenid) {
    return this.unwrap(this.request('/api/order/finish', 'POST', {
      id: orderId,
      finisherOpenid
    }))
  }

  cancelOrder(orderId, openid) {
    return this.unwrap(this.request('/api/order/cancel', 'POST', {
      id: orderId,
      openid
    }))
  }

  deleteOrder(orderId) {
    return this.unwrap(this.request('/api/order/delete', 'POST', {
      id: orderId
    }))
  }

  submitReview(orderId, reviewData) {
    return this.unwrap(this.request('/api/order/review', 'POST', {
      id: orderId,
      ...reviewData
    }))
  }

  // 消息相关 API
  sendMessage(fromOpenid, toOpenid, content, orderId, messageType = 'text') {
    return this.unwrap(this.request('/api/message/create', 'POST', {
      fromOpenid,
      toOpenid,
      userId: fromOpenid,
      conversationId: orderId,
      title: `订单 ${orderId || ''}`,
      content,
      orderId,
      messageType,
      type: 'chat'
    }))
  }

  getMessages(openid, conversationId, limit = 50, offset = 0) {
    const queryString = this.buildQuery({
      userId: openid,
      conversationId,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit
    })
    return this.unwrap(this.request(`/api/message/list?${queryString}`))
  }

  getConversations(openid) {
    return this.unwrap(this.request(`/api/message/conversations?${this.buildQuery({ openid })}`))
  }

  markAsRead(openid, messageId) {
    return this.unwrap(this.request('/api/message/update-status', 'POST', {
      id: messageId,
      status: 'read',
      openid
    }))
  }

  getUnreadCount(openid) {
    return this.unwrap(this.request(`/api/message/unread-count?${this.buildQuery({ userId: openid })}`))
  }

  mockPay(orderId, openid, totalFee, paymentMethod = 'wechat') {
    return this.unwrap(this.request('/api/payment/unifiedorder', 'POST', {
      orderId,
      openid,
      out_trade_no: `mock_trade_${orderId}_${Date.now()}`,
      total_fee: totalFee,
      body: `mock_order_${orderId}_${openid}`,
      paymentMethod
    }))
  }
}

const api = new API()

export default api
export { API }
