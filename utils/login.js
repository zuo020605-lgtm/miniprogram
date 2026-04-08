/**
 * 用户登录系统工具文件
 * 实现自动注册用户功能，包括用户登录、获取openid、检查用户是否存在、自动注册等功能
 */

/**
 * 登录系统类
 */
class LoginSystem {
  /**
   * 构造函数
   */
  constructor() {
    // 延迟初始化数据库实例，避免在导入时访问uniCloud
  }

  /**
   * 获取数据库实例
   * @private
   */
  _getDb() {
    if (!this.db) {
      this.db = uniCloud.database();
      this.usersCollection = this.db.collection('users');
    }
    return this.db;
  }

  /**
   * 获取用户集合
   * @private
   */
  _getUsersCollection() {
    if (!this.usersCollection) {
      this._getDb();
    }
    return this.usersCollection;
  }

  /**
   * 用户登录
   * @param {Object} loginParams - 登录参数
   * @param {string} loginParams.code - 登录凭证
   * @param {string} [loginParams.nickName] - 用户昵称
   * @param {string} [loginParams.avatarUrl] - 用户头像
   * @returns {Promise<Object>} 登录结果
   */
  async login(loginParams) {
    try {
      // 1. 验证登录参数
      this._validateLoginParams(loginParams);

      // 2. 获取openid
      const openid = await this._getOpenid(loginParams.code);

      // 3. 检查用户是否存在
      const user = await this._checkUserExists(openid);

      // 4. 如果用户不存在，创建新用户
      let loginResult;
      if (!user) {
        loginResult = await this._createUser(openid, loginParams);
      } else {
        // 如果用户存在，更新用户信息
        loginResult = await this._updateUser(user, loginParams);
      }

      // 5. 返回登录结果
      return {
        success: true,
        data: loginResult
      };
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 验证登录参数
   * @param {Object} loginParams - 登录参数
   * @private
   */
  _validateLoginParams(loginParams) {
    if (!loginParams || !loginParams.code) {
      throw new Error('缺少登录凭证code');
    }
  }

  /**
   * 获取openid
   * @param {string} code - 登录凭证
   * @returns {Promise<string>} openid
   * @private
   */
  async _getOpenid(code) {
    try {
      // 调用uniCloud云函数获取openid
      const result = await uniCloud.callFunction({
        name: 'login',
        data: {
          code: code
        }
      });

      if (result.result && result.result.openid) {
        return result.result.openid;
      } else {
        throw new Error('获取openid失败');
      }
    } catch (error) {
      console.error('获取openid失败:', error);
      throw new Error('获取openid失败: ' + (error.message || '未知错误'));
    }
  }

  /**
   * 检查用户是否存在
   * @param {string} openid - 用户唯一标识
   * @returns {Promise<Object|null>} 用户信息或null
   * @private
   */
  async _checkUserExists(openid) {
    try {
      const result = await this._getUsersCollection().where({
        openid: openid
      }).get();

      return result.data && result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error('检查用户是否存在失败:', error);
      throw new Error('检查用户是否存在失败: ' + (error.message || '未知错误'));
    }
  }

  /**
   * 创建新用户
   * @param {string} openid - 用户唯一标识
   * @param {Object} userInfo - 用户信息
   * @returns {Promise<Object>} 创建的用户信息
   * @private
   */
  async _createUser(openid, userInfo) {
    try {
      const now = new Date().toISOString();
      const userData = {
        openid: openid,
        nickName: userInfo.nickName || '未设置昵称',
        avatarUrl: userInfo.avatarUrl || '',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        loginCount: 1
      };

      const result = await this._getUsersCollection().add(userData);

      return {
        _id: result.id,
        ...userData
      };
    } catch (error) {
      console.error('创建用户失败:', error);
      throw new Error('创建用户失败: ' + (error.message || '未知错误'));
    }
  }

  /**
   * 更新用户信息
   * @param {Object} user - 现有用户信息
   * @param {Object} userInfo - 新的用户信息
   * @returns {Promise<Object>} 更新后的用户信息
   * @private
   */
  async _updateUser(user, userInfo) {
    try {
      const now = new Date().toISOString();
      const updateData = {
        updatedAt: now,
        lastLoginAt: now,
        loginCount: (user.loginCount || 0) + 1
      };

      // 更新用户昵称和头像（如果提供）
      if (userInfo.nickName) {
        updateData.nickName = userInfo.nickName;
      }
      if (userInfo.avatarUrl) {
        updateData.avatarUrl = userInfo.avatarUrl;
      }

      await this._getUsersCollection().doc(user._id).update(updateData);

      return {
        ...user,
        ...updateData
      };
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw new Error('更新用户信息失败: ' + (error.message || '未知错误'));
    }
  }

  /**
   * 根据openid获取用户信息
   * @param {string} openid - 用户唯一标识
   * @returns {Promise<Object|null>} 用户信息或null
   */
  async getUserByOpenid(openid) {
    try {
      return await this._checkUserExists(openid);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw new Error('获取用户信息失败: ' + (error.message || '未知错误'));
    }
  }

  /**
   * 根据用户ID获取用户信息
   * @param {string} userId - 用户ID
   * @returns {Promise<Object|null>} 用户信息或null
   */
  async getUserById(userId) {
    try {
      const result = await this._getUsersCollection().doc(userId).get();
      return result.data || null;
    } catch (error) {
      console.error('根据ID获取用户信息失败:', error);
      throw new Error('根据ID获取用户信息失败: ' + (error.message || '未知错误'));
    }
  }
}

// 导出登录系统实例
const loginSystem = new LoginSystem();

// 导出工具函数
const login = (loginParams) => loginSystem.login(loginParams);
const getUserByOpenid = (openid) => loginSystem.getUserByOpenid(openid);
const getUserById = (userId) => loginSystem.getUserById(userId);

// 支持CommonJS模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loginSystem,
    login,
    getUserByOpenid,
    getUserById
  };
}

// 支持浏览器环境导出
if (typeof window !== 'undefined') {
  window.loginSystem = loginSystem;
  window.login = login;
  window.getUserByOpenid = getUserByOpenid;
  window.getUserById = getUserById;
}

// 支持Web Worker环境导出
if (typeof self !== 'undefined') {
  self.loginSystem = loginSystem;
  self.login = login;
  self.getUserByOpenid = getUserByOpenid;
  self.getUserById = getUserById;
}
