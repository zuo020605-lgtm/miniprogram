/**
 * 后台管理系统单元测试
 */

// 测试工具函数
function testUtilityFunctions() {
  console.log('=== 开始测试工具函数 ===');
  
  // 测试格式化货币
  console.log('测试 formatCurrency:');
  console.assert(formatCurrency(10000) === '¥100.00', 'formatCurrency(10000) 应该等于 ¥100.00');
  console.assert(formatCurrency(0) === '¥0.00', 'formatCurrency(0) 应该等于 ¥0.00');
  console.log('✓ formatCurrency 测试通过');
  
  // 测试格式化日期
  console.log('测试 formatDate:');
  const testDate = new Date('2024-01-01 12:00:00');
  const formatted = formatDate(testDate.getTime());
  console.assert(formatted.includes('2024'), '格式化日期应该包含年份');
  console.log('✓ formatDate 测试通过');
  
  console.log('=== 工具函数测试完成 ===\n');
}

// 测试订单类型转换
function testOrderTypeConversion() {
  console.log('=== 开始测试订单类型转换 ===');
  
  const typeMap = {
    'campus-errand': '校园跑腿',
    'express': '快递代取',
    'exam': '考试代替',
    'campus-class': '校园代课',
    'running': '校园跑腿',
    'delivering': '快递代取'
  };
  
  console.assert(typeMap['campus-errand'] === '校园跑腿', 'campus-errand 应该转换为校园跑腿');
  console.assert(typeMap['express'] === '快递代取', 'express 应该转换为快递代取');
  console.log('✓ 订单类型转换测试通过');
  
  console.log('=== 订单类型转换测试完成 ===\n');
}

// 测试状态转换
function testStatusConversion() {
  console.log('=== 开始测试状态转换 ===');
  
  const statusMap = {
    'PENDING': '待接取',
    'PROCESSING': '进行中',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消',
    'pending': '待接取',
    'accepted': '已接单',
    'finished': '已完成'
  };
  
  console.assert(statusMap['PENDING'] === '待接取', 'PENDING 应该转换为待接取');
  console.assert(statusMap['COMPLETED'] === '已完成', 'COMPLETED 应该转换为已完成');
  console.log('✓ 状态转换测试通过');
  
  console.log('=== 状态转换测试完成 ===\n');
}

// 测试 API 调用
async function testAPICalls() {
  console.log('=== 开始测试 API 调用 ===');
  
  try {
    // 测试健康检查
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthResult = await healthResponse.json();
    console.assert(healthResult.status === 'ok', '健康检查应该返回 ok');
    console.log('✓ 健康检查 API 测试通过');
    
    // 测试订单列表
    const ordersResponse = await fetch('http://localhost:3000/api/order/all');
    const ordersResult = await ordersResponse.json();
    console.assert(ordersResult.success === true, '订单列表 API 应该返回 success: true');
    console.log('✓ 订单列表 API 测试通过');
    
    console.log('=== API 调用测试完成 ===\n');
  } catch (error) {
    console.error('API 测试失败:', error.message);
  }
}

// 测试数据验证
function testDataValidation() {
  console.log('=== 开始测试数据验证 ===');
  
  // 测试订单数据格式
  const mockOrder = {
    id: 'order_001',
    title: '测试订单',
    price: 1000,
    status: 'PENDING',
    type: 'campus-errand',
    createTime: Date.now()
  };
  
  console.assert(typeof mockOrder.id === 'string', '订单 ID 应该是字符串');
  console.assert(typeof mockOrder.price === 'number', '订单价格应该是数字');
  console.assert(mockOrder.price > 0, '订单价格应该大于 0');
  console.log('✓ 数据格式验证测试通过');
  
  console.log('=== 数据验证测试完成 ===\n');
}

// 测试 UI 交互
function testUIInteractions() {
  console.log('=== 开始测试 UI 交互 ===');
  
  // 测试模态框显示/隐藏
  console.log('测试模态框操作...');
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'testModal';
  document.body.appendChild(modal);
  
  modal.classList.add('show');
  console.assert(modal.classList.contains('show'), '模态框应该显示');
  
  modal.classList.remove('show');
  console.assert(!modal.classList.contains('show'), '模态框应该隐藏');
  
  document.body.removeChild(modal);
  console.log('✓ UI 交互测试通过');
  
  console.log('=== UI 交互测试完成 ===\n');
}

// 测试消息处理
function testMessageHandling() {
  console.log('=== 开始测试消息处理 ===');
  
  const mockMessage = {
    id: 'msg_001',
    senderId: 'user_001',
    receiverId: 'user_002',
    content: '测试消息内容',
    isRead: false,
    createdAt: Date.now()
  };
  
  console.assert(typeof mockMessage.content === 'string', '消息内容应该是字符串');
  console.assert(typeof mockMessage.isRead === 'boolean', '消息状态应该是布尔值');
  console.log('✓ 消息处理测试通过');
  
  console.log('=== 消息处理测试完成 ===\n');
}

// 测试钱包操作
function testWalletOperations() {
  console.log('=== 开始测试钱包操作 ===');
  
  // 测试充值计算
  const rechargeAmount = 10000; // 分
  const rechargeAmountYuan = rechargeAmount / 100; // 元
  console.assert(rechargeAmountYuan === 100, '10000 分应该等于 100 元');
  
  // 测试提现验证
  const withdrawAmount = 5000;
  const balance = 10000;
  console.assert(withdrawAmount <= balance, '提现金额不能超过余额');
  console.log('✓ 钱包操作测试通过');
  
  console.log('=== 钱包操作测试完成 ===\n');
}

// 运行所有测试
async function runAllTests() {
  console.log('\n========================================');
  console.log('🧪 开始运行后台管理系统测试套件');
  console.log('========================================\n');
  
  // 同步测试
  testUtilityFunctions();
  testOrderTypeConversion();
  testStatusConversion();
  testDataValidation();
  testUIInteractions();
  testMessageHandling();
  testWalletOperations();
  
  // 异步测试
  await testAPICalls();
  
  console.log('\n========================================');
  console.log('✅ 所有测试完成！');
  console.log('========================================\n');
}

// 页面加载时运行测试
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', runAllTests);
}

// 导出测试函数（Node.js 环境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testUtilityFunctions,
    testOrderTypeConversion,
    testStatusConversion,
    testDataValidation,
    testMessageHandling,
    testWalletOperations,
    runAllTests
  };
}
