/**
 * API 配置
 */
const API_BASE_URL = 'http://localhost:3000/api'

// API 端点
const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    USER_INFO: '/auth/userinfo'
  },
  
  // 订单相关
  ORDER: {
    LIST: '/order/list',
    DETAIL: '/order/detail',
    CREATE: '/order/create',
    UPDATE: '/order/update',
    DELETE: '/order/delete',
    ALL: '/order/all'
  },
  
  // 用户相关
  USER: {
    LIST: '/user/list',
    DETAIL: '/user/detail',
    CREATE: '/user/create',
    UPDATE: '/user/update',
    DELETE: '/user/delete'
  },
  
  // 消息相关
  MESSAGE: {
    LIST: '/message/list',
    DETAIL: '/message/detail',
    CREATE: '/message/create',
    UPDATE_STATUS: '/message/update-status',
    UPDATE: '/message/update',
    DELETE: '/message/delete',
    DELETE_BATCH: '/message/delete-batch',
    UNREAD_COUNT: '/message/unread-count',
    MARK_ALL_READ: '/message/mark-all-read'
  }
}

// 浏览器环境导出
if (typeof window !== 'undefined') {
  window.API_CONFIG = {
    API_BASE_URL,
    API_ENDPOINTS
  }
}
