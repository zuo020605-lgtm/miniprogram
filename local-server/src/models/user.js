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
        this.users = usersData
        // 计算下一个用户 ID
        const ids = Object.keys(usersData).map(id => parseInt(id))
        if (ids.length > 0) {
          this.nextId = Math.max(...ids) + 1
        }
        console.log('从文件加载了', Object.keys(usersData).length, '个用户')
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
  const user = mockUserDB.users[id]
  if (!user) {
    throw new Error('用户不存在')
  }

  return {
    success: true,
    data: user
  }
}

// 更新用户信息
async function updateUser(id, userData) {
  const user = mockUserDB.users[id]
  if (!user) {
    throw new Error('用户不存在')
  }

  // 更新允许的字段
  const allowedFields = ['nickName', 'avatarUrl', 'gender', 'phone', 'role', 'status']
  allowedFields.forEach(field => {
    if (userData[field] !== undefined) {
      user[field] = userData[field]
    }
  })
  user.updateTime = Date.now()

  mockUserDB.users[id] = user
  // 保存到文件
  mockUserDB.saveUsers()

  return {
    success: true,
    data: user
  }
}

// 删除用户
async function deleteUser(id) {
  const user = mockUserDB.users[id]
  if (!user) {
    throw new Error('用户不存在')
  }

  delete mockUserDB.users[id]
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
  const openid = `mock_openid_${mockUserDB.nextId}`
  mockUserDB.nextId++

  // 如果是新用户，创建用户信息
  if (!mockUserDB.users[openid]) {
    mockUserDB.users[openid] = {
      openid: openid,
      nickName: `用户${openid}`,
      avatarUrl: 'https://example.com/default-avatar.jpg',
      gender: 0,
      phone: ''
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

module.exports = {
  createUser,
  getUserList,
  getUserDetail,
  updateUser,
  deleteUser,
  mockLogin,
  mockUserInfo
}
