/**
 * HTTP 请求工具类
 */
// 浏览器环境使用全局变量
const API_BASE_URL = window.API_CONFIG ? window.API_CONFIG.API_BASE_URL : 'http://localhost:3000/api'

/**
 * 封装 HTTP 请求
 * @param {string} url - 请求 URL
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @returns {Promise}
 */
async function request(url, method = 'GET', data = null) {
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  }

  if (method === 'GET' && data) {
    const queryString = new URLSearchParams(data).toString()
    url += (url.includes('?') ? '&' : '?') + queryString
  } else if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, options)
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '请求失败')
    }
    
    return result
  } catch (error) {
    console.error('Request error:', error)
    throw error
  }
}

// GET 请求
function get(url, data) {
  return request(url, 'GET', data)
}

// POST 请求
function post(url, data) {
  return request(url, 'POST', data)
}

// PUT 请求
function put(url, data) {
  return request(url, 'PUT', data)
}

// DELETE 请求
function del(url, data) {
  return request(url, 'DELETE', data)
}

// 浏览器环境导出
if (typeof window !== 'undefined') {
  window.HTTP = {
    request,
    get,
    post,
    put,
    delete: del
  }
}
