/**
 * API 数据缓存服务
 * 提供数据缓存、请求去重、超时控制等功能
 */
const ApiCache = {
  // 缓存存储
  cache: new Map(),
  // 正在进行的请求
  pendingRequests: new Map(),
  // 默认缓存时间（5 分钟）
  defaultCacheDuration: 300000,
  // 请求超时时间（10 秒）
  requestTimeout: 10000,

  /**
   * 从缓存获取数据
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  },

  /**
   * 设置缓存
   */
  set(key, data, duration = this.defaultCacheDuration) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + duration,
      timestamp: Date.now()
    });
  },

  /**
   * 清除缓存
   */
  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  },

  /**
   * 带缓存的 API 请求
   * @param {string} url - 请求 URL
   * @param {object} options - fetch options
   * @param {boolean} useCache - 是否使用缓存
   * @param {number} cacheDuration - 缓存时间（毫秒）
   */
  async fetch(url, options = {}, useCache = true, cacheDuration = this.defaultCacheDuration) {
    const cacheKey = `fetch:${url}:${JSON.stringify(options)}`;

    // 检查是否有正在进行的相同请求
    if (this.pendingRequests.has(cacheKey)) {
      console.log('请求去重，等待已有请求完成:', url);
      return this.pendingRequests.get(cacheKey);
    }

    // 检查缓存
    if (useCache) {
      const cached = this.get(cacheKey);
      if (cached) {
        console.log('使用缓存数据:', url);
        return Promise.resolve(cached);
      }
    }

    // 创建带超时的请求
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    const requestPromise = fetch(url, {
      ...options,
      signal: controller.signal
    })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // 保存到缓存
        if (useCache && data && data.success !== false) {
          this.set(cacheKey, data, cacheDuration);
        }
        return data;
      })
      .catch(error => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('请求超时，请检查网络连接');
        }
        throw error;
      })
      .finally(() => {
        this.pendingRequests.delete(cacheKey);
      });

    // 记录正在进行的请求
    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  },

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      cacheKeys: Array.from(this.cache.keys())
    };
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.ApiCache = ApiCache;
}
