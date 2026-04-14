const express = require('express')
const router = express.Router()
const { mockLogin, mockUserInfo } = require('../models/user')

// Mock登录接口
router.post('/login', async (req, res) => {
  console.log('收到登录请求:', req.body)
  try {
    const { code } = req.body
    if (!code) {
      console.log('登录失败: 缺少code参数')
      return res.status(400).json({ success: false, message: '缺少code参数' })
    }

    console.log('开始处理登录...')
    const result = await mockLogin(code)
    console.log('登录成功:', result)
    res.json(result)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: '登录失败: ' + error.message })
  }
})

// 获取用户信息
router.get('/userinfo', async (req, res) => {
  try {
    const { openid } = req.query
    if (!openid) {
      return res.status(400).json({ success: false, message: '缺少openid参数' })
    }

    const result = await mockUserInfo(openid)
    res.json(result)
  } catch (error) {
    console.error('Get userinfo error:', error)
    res.status(500).json({ success: false, message: '获取用户信息失败' })
  }
})

module.exports = router