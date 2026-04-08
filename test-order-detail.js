// 测试订单详情功能
const uniCloud = require('uni-cloud-sdk');

async function testOrderDetail() {
  try {
    // 初始化云对象
    const orderCloud = uniCloud.importObject('order');
    
    // 测试1: 正常订单
    console.log('测试1: 正常订单');
    const testOrderId = 'test-order-1';
    const result1 = await orderCloud.getOrderDetail(testOrderId);
    console.log('结果:', result1);
    
    // 测试2: 不存在的订单
    console.log('\n测试2: 不存在的订单');
    const nonExistentOrderId = 'non-existent-order';
    const result2 = await orderCloud.getOrderDetail(nonExistentOrderId);
    console.log('结果:', result2);
    
    // 测试3: 空订单ID
    console.log('\n测试3: 空订单ID');
    const emptyOrderId = '';
    const result3 = await orderCloud.getOrderDetail(emptyOrderId);
    console.log('结果:', result3);
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testOrderDetail();
