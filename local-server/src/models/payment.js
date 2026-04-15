// Mock支付数据库
const mockPaymentDB = {
  // 订单记录
  orders: {},
  // 自增订单号
  nextTradeNo: 1,
  // 预支付订单记录
  prepayIds: {}
}

// Mock统一下单接口
async function mockUnifiedOrder(orderBody) {
  const {
    openid,
    orderId,
    out_trade_no,
    total_fee,
    body,
    paymentMethod = 'wechat',
    trade_type = 'JSAPI',
    spbill_create_ip = '127.0.0.1'
  } = orderBody

  const payFee = Number(total_fee || 0)
  if (!Number.isFinite(payFee) || payFee <= 0) {
    throw new Error('支付金额异常')
  }

  // 生成mock预支付ID
  const prepay_id = `mock_prepay_id_${mockPaymentDB.nextTradeNo}`

  // 保存订单信息
  mockPaymentDB.orders[out_trade_no] = {
    out_trade_no: out_trade_no,
    prepay_id: prepay_id,
    total_fee: payFee,
    body: body,
    openid: openid,
    orderId: orderId || '',
    paymentMethod: paymentMethod,
    status: 'SUCCESS',
    create_time: Date.now(),
    time_end: Date.now(),
    spbill_create_ip: spbill_create_ip
  }

  // 保存预支付ID
  mockPaymentDB.prepayIds[prepay_id] = out_trade_no

  mockPaymentDB.nextTradeNo++

  return {
    return_code: 'SUCCESS',
    return_msg: 'OK',
    appid: 'mock_appid',
    mch_id: 'mock_mch_id',
    prepay_id: prepay_id,
    nonce_str: 'mock_nonce_str',
    sign: 'mock_sign',
    code_url: `weixin://wxpay/bizpayurl?pr=${prepay_id}`,
    out_trade_no,
    total_fee: payFee,
    trade_state: 'SUCCESS'
  }
}

// Mock查询订单接口
async function mockQueryOrder(out_trade_no) {
  const order = mockPaymentDB.orders[out_trade_no]
  if (!order) {
    throw new Error('订单不存在')
  }

  return {
    return_code: 'SUCCESS',
    return_msg: 'OK',
    appid: 'mock_appid',
    mch_id: 'mock_mch_id',
    out_trade_no: out_trade_no,
    total_fee: order.total_fee,
    transaction_id: `mock_transaction_${out_trade_no}`,
    bank_type: 'CMC',
    time_end: order.time_end || null,
    trade_state: order.status,
    trade_state_desc: getOrderStatusDesc(order.status)
  }
}

// 获取订单状态描述
function getOrderStatusDesc(status) {
  const statusMap = {
    'NOTPAY': '未支付',
    'SUCCESS': '支付成功',
    'REFUND': '转入退款',
    'CLOSED': '已关闭',
    'REVOKED': '已撤销',
    'USERPAYING': '用户支付中',
    'PAYERROR': '支付失败'
  }
  return statusMap[status] || '未知状态'
}

module.exports = {
  mockUnifiedOrder,
  mockQueryOrder
}
