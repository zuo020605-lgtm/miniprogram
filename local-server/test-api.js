/**
 * API 测试脚本
 * 用于测试所有新增的 API 端点
 */

const API_BASE_URL = 'http://localhost:3000/api'

// 测试用户管理 API
async function testUserAPI() {
  console.log('\n=== 测试用户管理 API ===')
  
  try {
    // 测试获取用户列表
    console.log('\n1. 测试获取用户列表')
    const userListRes = await fetch(`${API_BASE_URL}/user/list?page=1&pageSize=10`)
    const userListResult = await userListRes.json()
    console.log('用户列表:', userListResult)
    
    // 测试创建用户
    console.log('\n2. 测试创建用户')
    const createUserRes = await fetch(`${API_BASE_URL}/user/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        openid: 'test_openid_' + Date.now(),
        nickName: '测试用户',
        phone: '13800138000',
        role: 'user',
        status: 'active'
      })
    })
    const createUserResult = await createUserRes.json()
    console.log('创建用户:', createUserResult)
    
    // 测试获取用户详情
    if (createUserResult.data && createUserResult.data.id) {
      console.log('\n3. 测试获取用户详情')
      const userId = createUserResult.data.id
      const userDetailRes = await fetch(`${API_BASE_URL}/user/detail?id=${userId}`)
      const userDetailResult = await userDetailRes.json()
      console.log('用户详情:', userDetailResult)
      
      // 测试更新用户
      console.log('\n4. 测试更新用户')
      const updateUserRes = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          nickName: '更新后的测试用户',
          status: 'active'
        })
      })
      const updateUserResult = await updateUserRes.json()
      console.log('更新用户:', updateUserResult)
      
      // 测试删除用户
      console.log('\n5. 测试删除用户')
      const deleteUserRes = await fetch(`${API_BASE_URL}/user/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      })
      const deleteUserResult = await deleteUserRes.json()
      console.log('删除用户:', deleteUserResult)
    }
    
  } catch (error) {
    console.error('用户 API 测试失败:', error)
  }
}

// 测试消息管理 API
async function testMessageAPI() {
  console.log('\n=== 测试消息管理 API ===')
  
  try {
    // 测试获取消息列表
    console.log('\n1. 测试获取消息列表')
    const messageListRes = await fetch(`${API_BASE_URL}/message/list?page=1&pageSize=10`)
    const messageListResult = await messageListRes.json()
    console.log('消息列表:', messageListResult)
    
    // 测试创建消息
    console.log('\n2. 测试创建消息')
    const createMessageRes = await fetch(`${API_BASE_URL}/message/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test_user_1',
        title: '测试消息',
        content: '这是一条测试消息',
        type: 'system',
        priority: 'normal'
      })
    })
    const createMessageResult = await createMessageRes.json()
    console.log('创建消息:', createMessageResult)
    
    // 测试获取消息详情
    if (createMessageResult.data && createMessageResult.data.id) {
      console.log('\n3. 测试获取消息详情')
      const messageId = createMessageResult.data.id
      const messageDetailRes = await fetch(`${API_BASE_URL}/message/detail?id=${messageId}`)
      const messageDetailResult = await messageDetailRes.json()
      console.log('消息详情:', messageDetailResult)
      
      // 测试更新消息状态
      console.log('\n4. 测试更新消息状态')
      const updateStatusRes = await fetch(`${API_BASE_URL}/message/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: messageId,
          status: 'read'
        })
      })
      const updateStatusResult = await updateStatusRes.json()
      console.log('更新消息状态:', updateStatusResult)
      
      // 测试删除消息
      console.log('\n5. 测试删除消息')
      const deleteMessageRes = await fetch(`${API_BASE_URL}/message/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: messageId })
      })
      const deleteMessageResult = await deleteMessageRes.json()
      console.log('删除消息:', deleteMessageResult)
    }
    
    // 测试获取未读消息数量
    console.log('\n6. 测试获取未读消息数量')
    const unreadCountRes = await fetch(`${API_BASE_URL}/message/unread-count?userId=test_user_1`)
    const unreadCountResult = await unreadCountRes.json()
    console.log('未读消息数量:', unreadCountResult)
    
  } catch (error) {
    console.error('消息 API 测试失败:', error)
  }
}

// 测试订单管理 API
async function testOrderAPI() {
  console.log('\n=== 测试订单管理 API ===')
  
  try {
    // 测试获取订单列表
    console.log('\n1. 测试获取订单列表')
    const orderListRes = await fetch(`${API_BASE_URL}/order/list?openid=test_openid&page=1&pageSize=10`)
    const orderListResult = await orderListRes.json()
    console.log('订单列表:', orderListResult)
    
    // 测试获取所有订单
    console.log('\n2. 测试获取所有订单')
    const allOrdersRes = await fetch(`${API_BASE_URL}/order/all`)
    const allOrdersResult = await allOrdersRes.json()
    console.log('所有订单:', allOrdersResult)
    
  } catch (error) {
    console.error('订单 API 测试失败:', error)
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始运行 API 测试...')
  console.log('API 基础地址:', API_BASE_URL)
  
  await testOrderAPI()
  await testUserAPI()
  await testMessageAPI()
  
  console.log('\n=== 所有测试完成 ===')
}

// 执行测试
runAllTests().catch(console.error)
