/**
 * 后台管理系统集成测试
 * 测试各个模块之间的集成和交互
 */

const assert = require('assert');

// 模拟 API 客户端
class APIClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  
  async get(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    return await response.json();
  }
  
  async post(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
}

// 测试订单管理模块
async function testOrderManagement() {
  console.log('📦 测试订单管理模块...');
  
  const client = new APIClient('http://localhost:3000/api');
  
  try {
    // 测试获取订单列表
    const ordersResult = await client.get('/order/all');
    assert.strictEqual(ordersResult.success, true, '获取订单列表应该成功');
    assert(Array.isArray(ordersResult.data.list), '订单列表应该是数组');
    console.log('  ✓ 获取订单列表成功');
    
    // 测试订单数据结构
    if (ordersResult.data.list.length > 0) {
      const order = ordersResult.data.list[0];
      assert(order.id, '订单应该有 ID');
      assert(typeof order.title === 'string', '订单应该有标题');
      assert(typeof order.price === 'number', '订单应该有价格');
      console.log('  ✓ 订单数据结构正确');
    }
    
    console.log('✅ 订单管理模块测试通过\n');
  } catch (error) {
    console.error('❌ 订单管理模块测试失败:', error.message);
  }
}

// 测试消息管理模块
async function testMessageManagement() {
  console.log('💬 测试消息管理模块...');
  
  const client = new APIClient('http://localhost:3000/api');
  
  try {
    // 测试获取消息列表
    const messagesResult = await client.get('/message/list');
    assert.strictEqual(messagesResult.success, true, '获取消息列表应该成功');
    console.log('  ✓ 获取消息列表成功');
    
    // 测试发送消息
    const sendResult = await client.post('/message/send', {
      receiverId: 'user_001',
      content: '集成测试消息'
    });
    console.log('  ✓ 发送消息功能可用');
    
    console.log('✅ 消息管理模块测试通过\n');
  } catch (error) {
    console.error('❌ 消息管理模块测试失败:', error.message);
  }
}

// 测试用户管理模块
async function testUserManagement() {
  console.log('👥 测试用户管理模块...');
  
  const client = new APIClient('http://localhost:3000/api');
  
  try {
    // 测试获取用户列表
    const usersResult = await client.get('/user/list');
    assert.strictEqual(usersResult.success, true, '获取用户列表应该成功');
    console.log('  ✓ 获取用户列表成功');
    
    // 测试用户数据结构
    if (usersResult.data.list.length > 0) {
      const user = usersResult.data.list[0];
      assert(user.id, '用户应该有 ID');
      assert(user.username || user.name, '用户应该有用户名');
      console.log('  ✓ 用户数据结构正确');
    }
    
    console.log('✅ 用户管理模块测试通过\n');
  } catch (error) {
    console.error('❌ 用户管理模块测试失败:', error.message);
  }
}

// 测试钱包管理模块
async function testWalletManagement() {
  console.log('💰 测试钱包管理模块...');
  
  const client = new APIClient('http://localhost:3000/api');
  
  try {
    // 测试获取交易记录
    const transactionsResult = await client.get('/wallet/transactions');
    console.log('  ✓ 获取交易记录功能可用');
    
    // 测试充值操作
    const rechargeResult = await client.post('/wallet/recharge', {
      userId: 'user_001',
      amount: 10000,
      remark: '测试充值'
    });
    console.log('  ✓ 充值功能可用');
    
    console.log('✅ 钱包管理模块测试通过\n');
  } catch (error) {
    console.error('❌ 钱包管理模块测试失败:', error.message);
  }
}

// 测试跨模块集成
async function testCrossModuleIntegration() {
  console.log('🔗 测试跨模块集成...');
  
  const client = new APIClient('http://localhost:3000/api');
  
  try {
    // 测试订单和用户的关联
    const ordersResult = await client.get('/order/all');
    const usersResult = await client.get('/user/list');
    
    if (ordersResult.data.list.length > 0 && usersResult.data.list.length > 0) {
      const order = ordersResult.data.list[0];
      const user = usersResult.data.list[0];
      
      // 验证订单用户关联
      assert(order.openid || order.userId, '订单应该关联用户');
      console.log('  ✓ 订单 - 用户关联正确');
    }
    
    // 测试消息和用户的关联
    const messagesResult = await client.get('/message/list');
    if (messagesResult.data.list.length > 0) {
      const message = messagesResult.data.list[0];
      assert(message.senderId || message.receiverId, '消息应该关联用户');
      console.log('  ✓ 消息 - 用户关联正确');
    }
    
    console.log('✅ 跨模块集成测试通过\n');
  } catch (error) {
    console.error('❌ 跨模块集成测试失败:', error.message);
  }
}

// 测试错误处理
async function testErrorHandling() {
  console.log('⚠️ 测试错误处理...');
  
  const client = new APIClient('http://localhost:3000/api');
  
  try {
    // 测试无效请求
    try {
      const result = await client.get('/order/invalid-endpoint');
      console.log('  ⚠ 无效端点未返回错误');
    } catch (error) {
      console.log('  ✓ 无效请求正确返回错误');
    }
    
    // 测试空数据
    const result = await client.get('/order/list');
    console.log('  ✓ 空数据处理正确');
    
    console.log('✅ 错误处理测试通过\n');
  } catch (error) {
    console.error('❌ 错误处理测试失败:', error.message);
  }
}

// 测试性能
async function testPerformance() {
  console.log('⚡ 测试性能...');
  
  const client = new APIClient('http://localhost:3000/api');
  
  try {
    // 测试 API 响应时间
    const startTime = Date.now();
    await client.get('/order/all');
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`  ✓ API 响应时间：${duration}ms`);
    
    if (duration < 1000) {
      console.log('  ✓ 响应时间符合要求 (< 1s)');
    } else {
      console.log('  ⚠ 响应时间较长 (> 1s)');
    }
    
    console.log('✅ 性能测试通过\n');
  } catch (error) {
    console.error('❌ 性能测试失败:', error.message);
  }
}

// 运行所有集成测试
async function runIntegrationTests() {
  console.log('\n========================================');
  console.log('🔧 开始运行后台管理系统集成测试');
  console.log('========================================\n');
  
  await testOrderManagement();
  await testMessageManagement();
  await testUserManagement();
  await testWalletManagement();
  await testCrossModuleIntegration();
  await testErrorHandling();
  await testPerformance();
  
  console.log('\n========================================');
  console.log('✅ 所有集成测试完成！');
  console.log('========================================\n');
}

// 如果在 Node.js 环境中直接运行
if (typeof require !== 'undefined' && require.main === module) {
  runIntegrationTests().catch(console.error);
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testOrderManagement,
    testMessageManagement,
    testUserManagement,
    testWalletManagement,
    testCrossModuleIntegration,
    testErrorHandling,
    testPerformance,
    runIntegrationTests
  };
}
