const fs = require('fs')
const path = require('path')

// 用户数据文件路径
const usersPath = path.join(__dirname, '../../../mock-db/users.json')

// Mock 用户数据库
const mockUserDB = {
  // 用户列表
  users: {},
  // 自增用户 ID
  nextId: 1,
  
  // 从文件加载用户数据
  loadUsers() {
    try {
      if (fs.existsSync(usersPath)) {
        const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
        let normalized = false
        let nextId = 1

        Object.entries(usersData).forEach(([key, user]) => {
          const numericKey = Number.parseInt(key, 10)
          if (Number.isInteger(numericKey) && numericKey > 0) {
            nextId = Math.max(nextId, numericKey + 1)
          }
          if (Number.isInteger(user.id) && user.id > 0) {
            nextId = Math.max(nextId, user.id + 1)
          }
        })

        Object.entries(usersData).forEach(([key, user]) => {
          if (!Number.isInteger(user.id)) {
            const numericKey = Number.parseInt(key, 10)
            user.id = Number.isInteger(numericKey) && numericKey > 0 ? numericKey : nextId++
            normalized = true
          }
          if (normalizeRunnerFields(user)) {
            normalized = true
          }
        })

        this.users = usersData
        this.nextId = nextId
        console.log('从文件加载了', Object.keys(usersData).length, '个用户')
        if (normalized) {
          this.saveUsers()
        }
      }
    } catch (error) {
      console.error('加载用户数据失败:', error)
      this.users = {}
      this.nextId = 1
    }
  },
  
  // 保存用户数据到文件
  saveUsers() {
    try {
      fs.writeFileSync(usersPath, JSON.stringify(this.users, null, 2), 'utf8')
      console.log('用户数据已保存到文件')
    } catch (error) {
      console.error('保存用户数据失败:', error)
    }
  }
}

function normalizeRunnerFields(user) {
  let changed = false
  const defaults = {
    isRunner: false,
    runnerVerified: false,
    runnerAppliedAt: null,
    runnerVerifiedAt: null,
    runnerBadge: 'none'
  }

  Object.keys(defaults).forEach(field => {
    if (user[field] === undefined) {
      user[field] = defaults[field]
      changed = true
    }
  })

  return changed
}

function findUserKey(id) {
  const idText = String(id)
  if (mockUserDB.users[idText]) {
    return idText
  }

  return Object.keys(mockUserDB.users).find(key => {
    const user = mockUserDB.users[key]
    return String(user.id) === idText || user.openid === idText
  })
}

function getUserById(id) {
  const key = findUserKey(id)
  if (!key) {
    throw new Error('用户不存在')
  }
  return {
    key,
    user: mockUserDB.users[key]
  }
}

function findUserByOpenid(openid) {
  if (!openid) return null
  return Object.values(mockUserDB.users).find(user => user.openid === openid) || null
}

function isAdminOpenid(openid) {
  const user = findUserByOpenid(openid)
  return !!(user && user.role === 'admin' && user.status !== 'banned')
}

function isVerifiedRunnerOpenid(openid) {
  const user = findUserByOpenid(openid)
  return !!(user && user.isRunner && user.runnerVerified && user.status !== 'banned')
}

// 初始化加载用户数据
mockUserDB.loadUsers()

// 创建用户
async function createUser(userData) {
  const id = mockUserDB.nextId++
  const user = {
    id: id,
    openid: userData.openid,
    nickName: userData.nickName || `用户${id}`,
    avatarUrl: userData.avatarUrl || 'https://example.com/default-avatar.jpg',
    gender: userData.gender || 0,
    phone: userData.phone || '',
    role: userData.role || 'user', // user, admin
    status: userData.status || 'active', // active, banned
    isRunner: !!userData.isRunner,
    runnerVerified: !!userData.runnerVerified,
    runnerAppliedAt: userData.runnerAppliedAt || null,
    runnerVerifiedAt: userData.runnerVerifiedAt || null,
    runnerBadge: userData.runnerBadge || (userData.isRunner ? 'junior' : 'none'),
    createTime: Date.now(),
    updateTime: Date.now()
  }

  mockUserDB.users[id] = user
  // 保存到文件
  mockUserDB.saveUsers()

  return {
    success: true,
    data: user
  }
}

// 获取用户列表
async function getUserList(page = 1, pageSize = 10, filters = {}) {
  let filteredUsers = Object.values(mockUserDB.users)

  // 按条件过滤
  if (filters.role) {
    filteredUsers = filteredUsers.filter(user => user.role === filters.role)
  }
  if (filters.status) {
    filteredUsers = filteredUsers.filter(user => user.status === filters.status)
  }
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    filteredUsers = filteredUsers.filter(user => 
      user.nickName.toLowerCase().includes(keyword) ||
      user.phone.includes(keyword) ||
      user.openid.toLowerCase().includes(keyword)
    )
  }

  // 按时间倒序排序
  filteredUsers.sort((a, b) => b.createTime - a.createTime)

  // 分页
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedUsers = filteredUsers.slice(start, end)

  return {
    success: true,
    data: {
      list: paginatedUsers,
      total: filteredUsers.length,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(filteredUsers.length / pageSize)
    }
  }
}

// 获取用户详情
async function getUserDetail(id) {
  const { user } = getUserById(id)

  return {
    success: true,
    data: user
  }
}

// 更新用户信息
async function updateUser(id, userData) {
  const { key, user } = getUserById(id)

  // 更新允许的字段
  const allowedFields = [
    'nickName',
    'avatarUrl',
    'gender',
    'phone',
    'role',
    'status',
    'isRunner',
    'runnerVerified',
    'runnerAppliedAt',
    'runnerVerifiedAt',
    'runnerBadge'
  ]
  allowedFields.forEach(field => {
    if (userData[field] !== undefined) {
      user[field] = userData[field]
    }
  })
  user.updateTime = Date.now()

  mockUserDB.users[key] = user
  // 保存到文件
  mockUserDB.saveUsers()

  return {
    success: true,
    data: user
  }
}

// 删除用户
async function deleteUser(id) {
  const { key } = getUserById(id)

  delete mockUserDB.users[key]
  // 保存到文件
  mockUserDB.saveUsers()

  return {
    success: true,
    message: '删除成功'
  }
}

// Mock 登录接口
async function mockLogin(code) {
  // 模拟微信登录过程
  const id = mockUserDB.nextId++
  const openid = `mock_openid_${id}`

  // 如果是新用户，创建用户信息
  if (!mockUserDB.users[openid]) {
    mockUserDB.users[openid] = {
      id,
      openid: openid,
      nickName: `用户${openid}`,
      avatarUrl: 'https://example.com/default-avatar.jpg',
      gender: 0,
      phone: '',
      role: 'user',
      status: 'active',
      isRunner: false,
      runnerVerified: false,
      runnerAppliedAt: null,
      runnerVerifiedAt: null,
      runnerBadge: 'none',
      createTime: Date.now(),
      updateTime: Date.now()
    }
    mockUserDB.saveUsers()
  }

  return {
    success: true,
    data: {
      session_key: 'mock_session_key',
      openid: openid,
      unionid: openid,
      errcode: 0,
      errmsg: 'ok'
    }
  }
}

// Mock 获取用户信息
async function mockUserInfo(openid) {
  // 查找用户
  const user = Object.values(mockUserDB.users).find(u => u.openid === openid)
  if (!user) {
    throw new Error('用户不存在')
  }

  return {
    success: true,
    data: user
  }
}

async function applyRunner(id) {
  const { key, user } = getUserById(id)
  normalizeRunnerFields(user)
  user.runnerAppliedAt = Date.now()
  user.runnerVerified = false
  user.runnerVerifiedAt = null
  user.updateTime = Date.now()

  mockUserDB.users[key] = user
  mockUserDB.saveUsers()

  return {
    success: true,
    data: user
  }
}

async function approveRunner(id) {
  const { key, user } = getUserById(id)
  normalizeRunnerFields(user)
  user.isRunner = true
  user.runnerVerified = true
  user.runnerVerifiedAt = Date.now()
  user.runnerBadge = 'junior'
  user.updateTime = Date.now()

  mockUserDB.users[key] = user
  mockUserDB.saveUsers()

  return {
    success: true,
    data: user
  }
}

async function revokeRunner(id) {
  const { key, user } = getUserById(id)
  normalizeRunnerFields(user)
  user.isRunner = false
  user.runnerVerified = false
  user.updateTime = Date.now()

  mockUserDB.users[key] = user
  mockUserDB.saveUsers()

  return {
    success: true,
    data: user
  }
}

module.exports = {
  createUser,
  getUserList,
  getUserDetail,
  updateUser,
  deleteUser,
  mockLogin,
  mockUserInfo,
  applyRunner,
  approveRunner,
  revokeRunner,
  findUserByOpenid,
  isAdminOpenid,
  isVerifiedRunnerOpenid
}
