const fs = require('fs')
const path = require('path')

// 消息数据文件路径
const messagesPath = path.join(__dirname, '../../../mock-db/messages.json')
const ordersPath = path.join(__dirname, '../../../mock-db/orders.json')

function getOrderByConversationId(conversationId) {
  if (!conversationId || !fs.existsSync(ordersPath)) return null

  const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'))
  return orders[conversationId] || null
}

function getOrderChatRecipient(order, fromOpenid) {
  if (!order || !fromOpenid) return ''
  if (order.openid === fromOpenid) return order.runnerOpenid || ''
  if (order.runnerOpenid === fromOpenid) return order.openid || ''
  return ''
}

// Mock 消息数据库
const mockMessageDB = {
  // 消息列表
  messages: {},
  // 自增消息 ID
  nextId: 1,
  
  // 从文件加载消息数据
  loadMessages() {
    try {
      if (fs.existsSync(messagesPath)) {
        const messagesData = JSON.parse(fs.readFileSync(messagesPath, 'utf8'))
        this.messages = messagesData
        // 计算下一个消息 ID
        const ids = Object.keys(messagesData).map(id => parseInt(id))
        if (ids.length > 0) {
          this.nextId = Math.max(...ids) + 1
        }
        console.log('从文件加载了', Object.keys(messagesData).length, '条消息')
      }
    } catch (error) {
      console.error('加载消息数据失败:', error)
      this.messages = {}
      this.nextId = 1
    }
  },
  
  // 保存消息数据到文件
  saveMessages() {
    try {
      fs.writeFileSync(messagesPath, JSON.stringify(this.messages, null, 2), 'utf8')
      console.log('消息数据已保存到文件')
    } catch (error) {
      console.error('保存消息数据失败:', error)
    }
  }
}

// 初始化加载消息数据
mockMessageDB.loadMessages()

// 创建消息
async function createMessage(messageData) {
  const conversationId = String(messageData.conversationId || '')
  const order = getOrderByConversationId(conversationId)
  const fromOpenid = messageData.fromOpenid || messageData.userId || ''
  let toOpenid = messageData.toOpenid || ''

  if (order) {
    if (!['PROCESSING', 'COMPLETED'].includes(order.status)) {
      throw new Error('订单被接取后才能聊天')
    }
    if (!toOpenid) {
      toOpenid = getOrderChatRecipient(order, fromOpenid)
    }
  }

  const id = mockMessageDB.nextId++
  const message = {
    id: id,
    userId: messageData.userId || fromOpenid,
    conversationId: conversationId,
    fromOpenid: fromOpenid,
    toOpenid: toOpenid,
    title: messageData.title,
    content: messageData.content,
    messageType: messageData.messageType || 'text',
    type: messageData.type || 'system', // system, order, user, chat
    status: messageData.status || 'unread', // unread, read, deleted
    priority: messageData.priority || 'normal', // low, normal, high, urgent
    createTime: Date.now(),
    readTime: null,
    updateTime: Date.now()
  }

  mockMessageDB.messages[id] = message
  // 保存到文件
  mockMessageDB.saveMessages()

  return {
    success: true,
    data: message
  }
}

// 获取消息列表
async function getMessageList(page = 1, pageSize = 10, filters = {}) {
  let filteredMessages = Object.values(mockMessageDB.messages)

  // 按条件过滤
  if (filters.userId) {
    filteredMessages = filteredMessages.filter(msg => msg.userId === filters.userId || msg.fromOpenid === filters.userId || msg.toOpenid === filters.userId)
  }
  if (filters.type) {
    filteredMessages = filteredMessages.filter(msg => msg.type === filters.type)
  }
  if (filters.status) {
    filteredMessages = filteredMessages.filter(msg => msg.status === filters.status)
  }
  if (filters.priority) {
    filteredMessages = filteredMessages.filter(msg => msg.priority === filters.priority)
  }
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    filteredMessages = filteredMessages.filter(msg => 
      msg.title.toLowerCase().includes(keyword) ||
      msg.content.toLowerCase().includes(keyword)
    )
  }
  if (filters.conversationId) {
    filteredMessages = filteredMessages.filter(msg => msg.conversationId === filters.conversationId)
  }

  // 按时间倒序排序
  filteredMessages.sort((a, b) => b.createTime - a.createTime)

  // 分页
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedMessages = filteredMessages.slice(start, end)

  return {
    success: true,
    data: {
      list: paginatedMessages,
      total: filteredMessages.length,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(filteredMessages.length / pageSize)
    }
  }
}

// 获取消息详情
async function getMessageDetail(id) {
  const message = mockMessageDB.messages[id]
  if (!message) {
    throw new Error('消息不存在')
  }

  return {
    success: true,
    data: message
  }
}

// 更新消息状态（标记为已读等）
async function updateMessageStatus(id, status) {
  const message = mockMessageDB.messages[id]
  if (!message) {
    throw new Error('消息不存在')
  }

  message.status = status
  if (status === 'read') {
    message.readTime = Date.now()
  }
  message.updateTime = Date.now()

  mockMessageDB.messages[id] = message
  // 保存到文件
  mockMessageDB.saveMessages()

  return {
    success: true,
    data: message
  }
}

// 更新消息内容
async function updateMessage(id, messageData) {
  const message = mockMessageDB.messages[id]
  if (!message) {
    throw new Error('消息不存在')
  }

  // 更新允许的字段
  const allowedFields = ['title', 'content', 'type', 'priority']
  allowedFields.forEach(field => {
    if (messageData[field] !== undefined) {
      message[field] = messageData[field]
    }
  })
  message.updateTime = Date.now()

  mockMessageDB.messages[id] = message
  // 保存到文件
  mockMessageDB.saveMessages()

  return {
    success: true,
    data: message
  }
}

// 删除消息
async function deleteMessage(id) {
  const message = mockMessageDB.messages[id]
  if (!message) {
    throw new Error('消息不存在')
  }

  delete mockMessageDB.messages[id]
  // 保存到文件
  mockMessageDB.saveMessages()

  return {
    success: true,
    message: '删除成功'
  }
}

// 批量删除消息
async function deleteMessages(ids) {
  let count = 0
  ids.forEach(id => {
    if (mockMessageDB.messages[id]) {
      delete mockMessageDB.messages[id]
      count++
    }
  })
  // 保存到文件
  mockMessageDB.saveMessages()

  return {
    success: true,
    data: { deleted: count }
  }
}

// 获取未读消息数量
async function getUnreadCount(userId) {
  const unreadMessages = Object.values(mockMessageDB.messages).filter(
    msg => msg.toOpenid === userId && msg.status === 'unread'
  )

  return {
    success: true,
    data: { count: unreadMessages.length }
  }
}

// 标记所有消息为已读
async function markAllAsRead(userId) {
  Object.values(mockMessageDB.messages).forEach(msg => {
    if (msg.toOpenid === userId && msg.status === 'unread') {
      msg.status = 'read'
      msg.readTime = Date.now()
      msg.updateTime = Date.now()
    }
  })
  // 保存到文件
  mockMessageDB.saveMessages()

  return {
    success: true,
    message: '已全部标记为已读'
  }
}

async function markConversationAsRead(openid, conversationId) {
  let count = 0
  Object.values(mockMessageDB.messages).forEach(msg => {
    if (
      msg.toOpenid === openid &&
      msg.conversationId === String(conversationId) &&
      msg.status === 'unread'
    ) {
      msg.status = 'read'
      msg.readTime = Date.now()
      msg.updateTime = Date.now()
      count++
    }
  })
  mockMessageDB.saveMessages()

  return {
    success: true,
    data: { updated: count }
  }
}

async function getConversationList(openid) {
  const messages = Object.values(mockMessageDB.messages)
    .filter(msg => msg.fromOpenid === openid || msg.toOpenid === openid || msg.userId === openid)

  const conversationMap = {}
  messages.forEach(msg => {
    const conversationId = msg.conversationId || `message_${msg.id}`
    if (!conversationMap[conversationId]) {
      conversationMap[conversationId] = {
        id: conversationId,
        name: msg.title || '会话',
        avatar: '/static/default-avatar.png',
        lastMessage: '',
        lastMessageTime: 0,
        unreadCount: 0,
        messageType: msg.type || 'chat',
        targetOpenid: '',
        createTime: 0
      }
    }

    const existing = conversationMap[conversationId]
    if (msg.status === 'unread' && msg.toOpenid === openid) {
      existing.unreadCount += 1
    }

    if (!existing.createTime || msg.createTime > existing.createTime) {
      existing.name = msg.title || existing.name || '会话'
      existing.lastMessage = msg.content || ''
      existing.lastMessageTime = msg.createTime
      existing.messageType = msg.type || 'chat'
      existing.targetOpenid = msg.fromOpenid === openid ? msg.toOpenid : msg.fromOpenid
      existing.createTime = msg.createTime
    }
  })

  const list = Object.values(conversationMap).sort((a, b) => b.createTime - a.createTime)

  return {
    success: true,
    data: {
      list,
      total: list.length
    }
  }
}

module.exports = {
  createMessage,
  getMessageList,
  getMessageDetail,
  updateMessageStatus,
  updateMessage,
  deleteMessage,
  deleteMessages,
  getUnreadCount,
  markAllAsRead,
  markConversationAsRead,
  getConversationList
}
