// 认证相关工具
import api from './api.js';

class Auth {
    constructor() {
        this.storageKey = 'campus_errand_user_info';
    }

    // 登录
    async login() {
        try {
            // 获取微信登录code
            const res = await wx.login();

            // 调用登录API
            const loginData = await api.login(res.code);

            // 保存用户信息
            wx.setStorageSync(this.storageKey, {
                openid: loginData.openid,
                userInfo: loginData.user,
                sessionKey: loginData.session_key
            });

            return {
                success: true,
                data: loginData
            };
        } catch (error) {
            console.error('登录失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 获取当前用户信息
    getCurrentUser() {
        const userInfo = wx.getStorageSync(this.storageKey);
        return userInfo ? userInfo.userInfo : null;
    }

    // 获取当前用户openid
    getCurrentOpenid() {
        const userInfo = wx.getStorageSync(this.storageKey);
        return userInfo ? userInfo.openid : null;
    }

    // 检查是否已登录
    isLoggedIn() {
        const userInfo = wx.getStorageSync(this.storageKey);
        return !!userInfo && !!userInfo.openid;
    }

    // 更新用户信息
    async updateUserInfo(userInfo) {
        try {
            const openid = this.getCurrentOpenid();
            if (!openid) {
                throw new Error('未登录');
            }

            const result = await api.updateUser(openid, userInfo);

            // 更新本地存储
            const storedInfo = wx.getStorageSync(this.storageKey);
            if (storedInfo) {
                storedInfo.userInfo = result;
                wx.setStorageSync(this.storageKey, storedInfo);
            }

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('更新用户信息失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 退出登录
    logout() {
        wx.removeStorageSync(this.storageKey);
    }
}

const auth = new Auth();

export default auth;