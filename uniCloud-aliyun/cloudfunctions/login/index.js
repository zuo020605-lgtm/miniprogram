/**
 * 登录云函数
 * 用于处理微信小程序登录，获取openid等信息
 */

'use strict';

const cloud = require('wx-server-sdk');

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 登录云函数入口
 * @param {Object} event - 事件对象
 * @param {string} event.code - 登录凭证
 * @returns {Promise<Object>} 登录结果
 */
exports.main = async (event, context) => {
  try {
    // 1. 验证参数
    if (!event.code) {
      return {
        success: false,
        error: '缺少登录凭证code'
      };
    }

    // 2. 调用微信登录接口获取openid
    const wxContext = await cloud.auth().code2Session({
      js_code: event.code
    });

    // 3. 处理登录结果
    if (wxContext.openid) {
      return {
        success: true,
        openid: wxContext.openid,
        unionid: wxContext.unionid || ''
      };
    } else {
      return {
        success: false,
        error: '获取openid失败'
      };
    }
  } catch (error) {
    console.error('登录云函数执行失败:', error);
    return {
      success: false,
      error: '登录失败: ' + (error.message || '未知错误')
    };
  }
};
