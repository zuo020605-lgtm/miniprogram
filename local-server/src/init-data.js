const fs = require('fs');
const path = require('path');

// 创建测试数据
function createTestData() {
  // 创建一些测试订单数据
  const testOrders = [
    {
      id: 'order_001',
      openid: 'mock_openid_1',
      title: '代取快递',
      description: '帮我取一个快递，地址在东门快递柜，取件码是1234',
      price: 5.00,
      location: '东门快递柜',
      contact: { phone: '13800138001' },
      status: 'PENDING',
      createTime: Date.now() - 3600000, // 1小时前
      updateTime: Date.now() - 3600000,
      runner: null
    },
    {
      id: 'order_002',
      openid: 'mock_openid_1',
      title: '代买午餐',
      description: '帮我一份黄焖鸡米饭，不要香菜，送到3号楼楼下',
      price: 12.00,
      location: '3号楼楼下',
      contact: { phone: '13800138001' },
      status: 'PROCESSING',
      createTime: Date.now() - 7200000, // 2小时前
      updateTime: Date.now() - 1800000, // 30分钟前
      runner: { id: 'runner_1', name: '跑腿小哥' }
    }
  ];

  // 写入到Mock数据文件中
  const ordersPath = path.join(__dirname, '../../mock-db/orders.json');

  // 保留原有数据
  let existingData = {};
  if (fs.existsSync(ordersPath)) {
    existingData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  }

  // 添加测试数据
  testOrders.forEach(order => {
    existingData[order.id] = order;
  });

  // 保存回文件
  fs.writeFileSync(ordersPath, JSON.stringify(existingData, null, 2));

  console.log('创建了', testOrders.length, '个测试订单');
}

// 启动时创建测试数据
createTestData();

module.exports = { createTestData };