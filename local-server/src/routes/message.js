const express = require('express')
const router = express.Router()
const {
  createMessage,
  getMessageList,
  getMessageDetail,
  updateMessageStatus,
  updateMessage,
  deleteMessage,
  deleteMessages,
  getUnreadCount,
  markAllAsRead,
  getConversationList
} = require('../models/message')

// 获取消息列表
router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, userId, type, status, priority, keyword, conversationId } = req.query
    
    const filters = {}
    if (userId) filters.userId = userId
    if (type) filters.type = type
    if (status) filters.status = status
    if (priority) filters.priority = priority
    if (keyword) filters.keyword = keyword
    if (conversationId) filters.conversationId = conversationId

    const result = await getMessageList(parseInt(page), parseInt(pageSize), filters)
    res.json(result)
  } catch (error) {
    console.error('Get message list error:', error)
    res.status(500).json({ success: false, message: '获取消息列表失败' })
  }
})

// 获取会话列表
router.get('/conversations', async (req, res) => {
  try {
    const { openid } = req.query
    if (!openid) {
      return res.status(400).json({ success: false, message: '缺少 openid 参数' })
    }

    const result = await getConversationList(openid)
    res.json(result)
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ success: false, message: '获取会话列表失败' })
  }
})

// 获取消息详情
router.get('/detail', async (req, res) => {
  try {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少消息 ID 参数' })
    }

    const result = await getMessageDetail(parseInt(id))
    res.json(result)
  } catch (error) {
    console.error('Get message detail error:', error)
    res.status(500).json({ success: false, message: '获取消息详情失败' })
  }
})

// 创建消息
router.post('/create', async (req, res) => {
  try {
    const messageData = {
      ...req.body,
      userId: req.body.userId || req.body.fromOpenid,
      title: req.body.title || `会话 ${req.body.conversationId || ''}`,
      type: req.body.type || (req.body.fromOpenid ? 'chat' : 'system')
    }
    if (!messageData.userId || !messageData.title || !messageData.content) {
      return res.status(400).json({ success: false, message: '缺少必要参数' })
    }

    const result = await createMessage(messageData)
    res.json(result)
  } catch (error) {
    console.error('Create message error:', error)
    res.status(400).json({ success: false, message: error.message || '创建消息失败' })
  }
})

// 更新消息状态
router.post('/update-status', async (req, res) => {
  try {
    const { id, status } = req.body
    if (!id || !status) {
      return res.status(400).json({ success: false, message: '缺少必要参数' })
    }

    const result = await updateMessageStatus(parseInt(id), status)
    res.json(result)
  } catch (error) {
    console.error('Update message status error:', error)
    res.status(500).json({ success: false, message: '更新消息状态失败' })
  }
})

// 更新消息内容
router.post('/update', async (req, res) => {
  try {
    const { id, ...messageData } = req.body
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少消息 ID 参数' })
    }

    const result = await updateMessage(parseInt(id), messageData)
    res.json(result)
  } catch (error) {
    console.error('Update message error:', error)
    res.status(500).json({ success: false, message: '更新消息失败' })
  }
})

// 删除消息
router.post('/delete', async (req, res) => {
  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少消息 ID 参数' })
    }

    const result = await deleteMessage(parseInt(id))
    res.json(result)
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({ success: false, message: '删除消息失败' })
  }
})

// 批量删除消息
router.post('/delete-batch', async (req, res) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: '缺少消息 ID 列表' })
    }

    const result = await deleteMessages(ids.map(id => parseInt(id)))
    res.json(result)
  } catch (error) {
    console.error('Delete messages error:', error)
    res.status(500).json({ success: false, message: '批量删除消息失败' })
  }
})

// 获取未读消息数量
router.get('/unread-count', async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).json({ success: false, message: '缺少用户 ID 参数' })
    }

    const result = await getUnreadCount(userId)
    res.json(result)
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ success: false, message: '获取未读消息数量失败' })
  }
})

// 标记所有消息为已读
router.post('/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({ success: false, message: '缺少用户 ID 参数' })
    }

    const result = await markAllAsRead(userId)
    res.json(result)
  } catch (error) {
    console.error('Mark all read error:', error)
    res.status(500).json({ success: false, message: '标记全部已读失败' })
  }
})

module.exports = router
