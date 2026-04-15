const express = require('express')
const router = express.Router()
const {
  createUser,
  getUserList,
  getUserDetail,
  updateUser,
  deleteUser,
  mockLogin,
  mockUserInfo,
  applyRunner,
  approveRunner,
  revokeRunner
} = require('../models/user')

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) {
      return res.status(400).json({ success: false, message: '缺少 code 参数' })
    }

    const result = await mockLogin(code)
    res.json(result)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: '登录失败：' + error.message })
  }
})

// 获取用户信息
router.get('/userinfo', async (req, res) => {
  try {
    const { openid } = req.query
    if (!openid) {
      return res.status(400).json({ success: false, message: '缺少 openid 参数' })
    }

    const result = await mockUserInfo(openid)
    res.json(result)
  } catch (error) {
    console.error('Get userinfo error:', error)
    res.status(500).json({ success: false, message: '获取用户信息失败' })
  }
})

// 获取用户列表（后台管理）
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, role, status, keyword } = req.query
    
    const filters = {}
    if (role) filters.role = role
    if (status) filters.status = status
    if (keyword) filters.keyword = keyword

    const result = await getUserList(parseInt(page), parseInt(pageSize), filters)
    res.json(result)
  } catch (error) {
    console.error('Get user list error:', error)
    res.status(500).json({ success: false, message: '获取用户列表失败' })
  }
})

// 获取用户详情（后台管理）
router.get('/detail', async (req, res) => {
  try {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少用户 ID 参数' })
    }

    const result = await getUserDetail(parseInt(id))
    res.json(result)
  } catch (error) {
    console.error('Get user detail error:', error)
    res.status(500).json({ success: false, message: '获取用户详情失败' })
  }
})

// 创建用户（后台管理）
router.post('/create', async (req, res) => {
  try {
    const userData = req.body
    if (!userData.openid) {
      return res.status(400).json({ success: false, message: '缺少 openid 参数' })
    }

    const result = await createUser(userData)
    res.json(result)
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ success: false, message: '创建用户失败' })
  }
})

// 更新用户信息（后台管理）
router.post('/update', async (req, res) => {
  try {
    const { id, ...userData } = req.body
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少用户 ID 参数' })
    }

    const result = await updateUser(parseInt(id), userData)
    res.json(result)
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ success: false, message: '更新用户失败' })
  }
})

// 用户提交接单员认证申请
router.post('/apply-runner', async (req, res) => {
  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少用户 ID 参数' })
    }

    const result = await applyRunner(id)
    res.json(result)
  } catch (error) {
    console.error('Apply runner error:', error)
    res.status(500).json({ success: false, message: '提交接单员认证失败：' + error.message })
  }
})

// 管理员通过接单员认证
router.post('/approve-runner', async (req, res) => {
  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少用户 ID 参数' })
    }

    const result = await approveRunner(id)
    res.json(result)
  } catch (error) {
    console.error('Approve runner error:', error)
    res.status(500).json({ success: false, message: '通过接单员认证失败：' + error.message })
  }
})

// 管理员撤销接单员资格
router.post('/revoke-runner', async (req, res) => {
  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少用户 ID 参数' })
    }

    const result = await revokeRunner(id)
    res.json(result)
  } catch (error) {
    console.error('Revoke runner error:', error)
    res.status(500).json({ success: false, message: '撤销接单员资格失败：' + error.message })
  }
})

// 删除用户（后台管理）
router.post('/delete', async (req, res) => {
  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少用户 ID 参数' })
    }

    const result = await deleteUser(parseInt(id))
    res.json(result)
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ success: false, message: '删除用户失败' })
  }
})

module.exports = router
