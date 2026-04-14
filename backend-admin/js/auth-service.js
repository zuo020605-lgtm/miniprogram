/**
 * 登录认证服务
 * 处理用户登录、登出、权限验证等功能
 */

const AuthService = {
  // 存储键名
  TOKEN_KEY: 'admin_token',
  USER_INFO_KEY: 'admin_user_info',
  REMEMBER_KEY: 'remembered_username',
  
  // 默认管理员账号（实际应从后端获取）
  DEFAULT_ADMIN: {
    username: 'admin',
    password: '123456',
    role: 'admin',
    name: '系统管理员'
  },

  storage: {
    get(key) {
      try {
        return localStorage.getItem(key) || sessionStorage.getItem(key);
      } catch (error) {
        return sessionStorage.getItem(key);
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('localStorage 写入失败，改用 sessionStorage:', error);
      }
      sessionStorage.setItem(key, value);
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('localStorage 清理失败:', error);
      }
      sessionStorage.removeItem(key);
    }
  },

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {boolean} rememberMe - 是否记住我
   * @returns {Promise<Object>} 登录结果
   */
  async login(username, password, rememberMe = false) {
    try {
      // 模拟 API 调用（实际应调用后端 API）
      const result = await this.loginApi(username, password);
      
      if (result.success) {
        // 保存登录状态
        this.saveToken(result.data.token);
        this.saveUserInfo(result.data.user);
        
        // 记住用户名
        if (rememberMe) {
          this.storage.set(this.REMEMBER_KEY, username);
        } else {
          this.storage.remove(this.REMEMBER_KEY);
        }
        
        // 记录登录时间
        this.storage.set('loginTime', Date.now().toString());
      }
      
      return result;
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        message: error.message || '登录失败，请检查网络连接'
      };
    }
  },

  /**
   * 模拟登录 API（实际应替换为真实 API 调用）
   */
  async loginApi(username, password) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 验证账号密码（实际应调用后端 API）
    if (username === this.DEFAULT_ADMIN.username && 
        password === this.DEFAULT_ADMIN.password) {
      return {
        success: true,
        message: '登录成功',
        data: {
          token: 'mock_token_' + Date.now(),
          user: {
            id: 'admin_001',
            username: username,
            name: this.DEFAULT_ADMIN.name,
            role: this.DEFAULT_ADMIN.role,
            avatar: null
          }
        }
      };
    } else {
      return {
        success: false,
        message: '用户名或密码错误'
      };
    }
  },

  /**
   * 用户登出
   */
  logout() {
    // 清除本地存储
    this.storage.remove(this.TOKEN_KEY);
    this.storage.remove(this.USER_INFO_KEY);
    this.storage.remove('loginTime');
    
    // 重定向到登录页
    window.location.replace('login.html');
  },

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    const token = this.getToken();
    if (!token) return false;

    if (!this.getCurrentUser()) {
      this.saveUserInfo({
        id: 'admin_001',
        username: this.DEFAULT_ADMIN.username,
        name: this.DEFAULT_ADMIN.name,
        role: this.DEFAULT_ADMIN.role,
        avatar: null
      });
    }

    return true;
  },

  /**
   * 获取当前用户信息
   * @returns {Object|null} 用户信息
   */
  getCurrentUser() {
    const userInfo = this.storage.get(this.USER_INFO_KEY);
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * 保存 Token
   */
  saveToken(token) {
    this.storage.set(this.TOKEN_KEY, token);
  },

  /**
   * 获取 Token
   */
  getToken() {
    return this.storage.get(this.TOKEN_KEY);
  },

  /**
   * 保存用户信息
   */
  saveUserInfo(user) {
    this.storage.set(this.USER_INFO_KEY, JSON.stringify(user));
  },

  /**
   * 验证权限
   * @param {string} requiredRole - 所需角色
   * @returns {boolean} 是否有权限
   */
  hasPermission(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // 管理员拥有所有权限
    if (user.role === 'admin') return true;
    
    // 其他角色权限验证
    return user.role === requiredRole;
  },

  /**
   * 检查登录状态，未登录则跳转
   */
  checkLoginStatus() {
    if (!this.isLoggedIn()) {
      // 保存当前 URL，登录后跳转回来
      const currentPath = window.location.pathname;
      this.storage.set('redirectAfterLogin', currentPath);
      
      return false;
    }
    return true;
  },

  /**
   * 获取登录后重定向 URL
   */
  getRedirectUrl() {
    const redirectUrl = this.storage.get('redirectAfterLogin');
    this.storage.remove('redirectAfterLogin');
    if (redirectUrl && !redirectUrl.endsWith('/login.html') && !redirectUrl.startsWith('/')) {
      return redirectUrl;
    }
    return 'index.html';
  },

  /**
   * 获取登录时长（毫秒）
   */
  getLoginDuration() {
    const loginTime = this.storage.get('loginTime');
    if (loginTime) {
      return Date.now() - parseInt(loginTime);
    }
    return 0;
  },

  /**
   * 格式化登录时长
   */
  formatLoginDuration() {
    const duration = this.getLoginDuration();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
};

// 页面加载时自动检查登录状态
if (typeof window !== 'undefined') {
  window.AuthService = AuthService;
}

// 导出（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthService;
}
