/**
 * API 服务类
 */
// 浏览器环境使用全局变量
const API_ENDPOINTS = window.API_CONFIG ? window.API_CONFIG.API_ENDPOINTS : {}
const { get, post } = window.HTTP || {}

// 订单服务
const orderAPI = {
  // 获取订单列表
  getList(params) {
    return get(API_ENDPOINTS.ORDER.LIST, params)
  },
  
  // 获取订单详情
  getDetail(id) {
    return get(API_ENDPOINTS.ORDER.DETAIL, { id })
  },
  
  // 创建订单
  create(data) {
    return post(API_ENDPOINTS.ORDER.CREATE, data)
  },
  
  // 更新订单
  update(data) {
    return post(API_ENDPOINTS.ORDER.UPDATE, data)
  },
  
  // 删除订单
  delete(id) {
    return post(API_ENDPOINTS.ORDER.DELETE, { id })
  },
  
  // 获取所有订单
  getAll() {
    return get(API_ENDPOINTS.ORDER.ALL)
  }
}

// 用户服务
const userAPI = {
  // 获取用户列表
  getList(params) {
    return get(API_ENDPOINTS.USER.LIST, params)
  },
  
  // 获取用户详情
  getDetail(id) {
    return get(API_ENDPOINTS.USER.DETAIL, { id })
  },
  
  // 创建用户
  create(data) {
    return post(API_ENDPOINTS.USER.CREATE, data)
  },
  
  // 更新用户
  update(data) {
    return post(API_ENDPOINTS.USER.UPDATE, data)
  },
  
  // 删除用户
  delete(id) {
    return post(API_ENDPOINTS.USER.DELETE, { id })
  }
}

// 消息服务
const messageAPI = {
  // 获取消息列表
  getList(params) {
    return get(API_ENDPOINTS.MESSAGE.LIST, params)
  },
  
  // 获取消息详情
  getDetail(id) {
    return get(API_ENDPOINTS.MESSAGE.DETAIL, { id })
  },
  
  // 创建消息
  create(data) {
    return post(API_ENDPOINTS.MESSAGE.CREATE, data)
  },
  
  // 更新消息状态
  updateStatus(id, status) {
    return post(API_ENDPOINTS.MESSAGE.UPDATE_STATUS, { id, status })
  },
  
  // 更新消息
  update(data) {
    return post(API_ENDPOINTS.MESSAGE.UPDATE, data)
  },
  
  // 删除消息
  delete(id) {
    return post(API_ENDPOINTS.MESSAGE.DELETE, { id })
  },
  
  // 批量删除消息
  deleteBatch(ids) {
    return post(API_ENDPOINTS.MESSAGE.DELETE_BATCH, { ids })
  },
  
  // 获取未读消息数量
  getUnreadCount(userId) {
    return get(API_ENDPOINTS.MESSAGE.UNREAD_COUNT, { userId })
  },
  
  // 标记所有消息为已读
  markAllRead(userId) {
    return post(API_ENDPOINTS.MESSAGE.MARK_ALL_READ, { userId })
  }
}

// 浏览器环境导出
if (typeof window !== 'undefined') {
  window.Services = {
    orderAPI,
    userAPI,
    messageAPI
  }
}
