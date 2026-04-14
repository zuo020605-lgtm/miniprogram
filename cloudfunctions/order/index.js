const fs = require('fs');
const path = require('path');

// Mock 数据路径
const orderDataPath = path.join(__dirname, '../../mock-db/orders.json');

// 读取订单数据
function readOrders() {
    if (!fs.existsSync(orderDataPath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(orderDataPath, 'utf8'));
}

// 保存订单数据
function saveOrders(orders) {
    fs.writeFileSync(orderDataPath, JSON.stringify(orders, null, 2));
}

// 生成订单ID
function generateOrderId() {
    return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// 获取用户列表（从用户云函数获取）
function getUsers() {
    const usersPath = path.join(__dirname, '../../mock-db/users.json');
    if (!fs.existsSync(usersPath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
}

// 创建订单
exports.createOrder = function(data, callback) {
    try {
        const { openid, title, description, price, address, contact } = data;

        if (!openid || !title || !description || !price || !address) {
            return callback({
                success: false,
                error: 'Missing required parameters'
            });
        }

        const orders = readOrders();
        const users = getUsers();

        // 验证用户存在
        let userExists = false;
        for (let uid in users) {
            if (users[uid].openid === openid) {
                userExists = true;
                break;
            }
        }

        if (!userExists) {
            return callback({
                success: false,
                error: 'User not found'
            });
        }

        // 创建新订单
        const order = {
            id: generateOrderId(),
            openid: openid,
            title: title,
            description: description,
            price: parseFloat(price),
            address: address,
            contact: contact || '',
            status: 'pending', // pending, accepted, finished, cancelled
            type: 'running', // running, delivering
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            accepterId: null, // 接单者ID
            finisherId: null, // 完成者ID
            deliveryInfo: {}
        };

        // 保存订单
        orders[order.id] = order;
        saveOrders(orders);

        callback({
            success: true,
            data: order
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 获取订单列表
exports.getOrders = function(data, callback) {
    try {
        const { openid, status, type } = data;
        const orders = readOrders();

        // 过滤订单
        let orderList = Object.values(orders);

        if (openid) {
            orderList = orderList.filter(order => order.openid === openid);
        }

        if (status) {
            orderList = orderList.filter(order => order.status === status);
        }

        if (type) {
            orderList = orderList.filter(order => order.type === type);
        }

        // 按创建时间倒序排列
        orderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        callback({
            success: true,
            data: orderList
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 获取订单详情
exports.getOrderDetail = function(data, callback) {
    try {
        const { orderId } = data;

        if (!orderId) {
            return callback({
                success: false,
                error: 'Missing orderId'
            });
        }

        const orders = readOrders();
        const order = orders[orderId];

        if (!order) {
            return callback({
                success: false,
                error: 'Order not found'
            });
        }

        // 获取用户信息
        const users = getUsers();
        let accepterInfo = null;
        let creatorInfo = null;

        for (let uid in users) {
            if (users[uid].openid === order.openid) {
                creatorInfo = users[uid];
            }
            if (users[uid].id === order.accepterId) {
                accepterInfo = users[uid];
            }
        }

        const orderDetail = {
            ...order,
            creatorInfo: creatorInfo,
            accepterInfo: accepterInfo
        };

        callback({
            success: true,
            data: orderDetail
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 接单
exports.acceptOrder = function(data, callback) {
    try {
        const { orderId, accepterOpenid } = data;

        if (!orderId || !accepterOpenid) {
            return callback({
                success: false,
                error: 'Missing required parameters'
            });
        }

        const orders = readOrders();
        const users = getUsers();
        const order = orders[orderId];

        if (!order) {
            return callback({
                success: false,
                error: 'Order not found'
            });
        }

        // 检查订单状态
        if (order.status !== 'pending') {
            return callback({
                success: false,
                error: 'Order cannot be accepted'
            });
        }

        // 查找接单者信息
        let accepterId = null;
        for (let uid in users) {
            if (users[uid].openid === accepterOpenid) {
                accepterId = uid;
                break;
            }
        }

        if (!accepterId) {
            return callback({
                success: false,
                error: 'Accepter not found'
            });
        }

        // 更新订单
        order.status = 'accepted';
        order.accepterId = accepterId;
        order.acceptedAt = new Date().toISOString();
        order.updatedAt = new Date().toISOString();

        orders[orderId] = order;
        saveOrders(orders);

        callback({
            success: true,
            data: order
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 完成订单
exports.finishOrder = function(data, callback) {
    try {
        const { orderId, finisherOpenid } = data;

        if (!orderId || !finisherOpenid) {
            return callback({
                success: false,
                error: 'Missing required parameters'
            });
        }

        const orders = readOrders();
        const users = getUsers();
        const order = orders[orderId];

        if (!order) {
            return callback({
                success: false,
                error: 'Order not found'
            });
        }

        // 检查订单状态
        if (order.status !== 'accepted') {
            return callback({
                success: false,
                error: 'Order cannot be finished'
            });
        }

        // 验证完成者是否是接单者
        let finisherId = null;
        for (let uid in users) {
            if (users[uid].openid === finisherOpenid) {
                finisherId = uid;
                break;
            }
        }

        if (finisherId !== order.accepterId) {
            return callback({
                success: false,
                error: 'Only the accepter can finish the order'
            });
        }

        // 更新订单
        order.status = 'finished';
        order.finisherId = finisherId;
        order.finishedAt = new Date().toISOString();
        order.updatedAt = new Date().toISOString();

        orders[orderId] = order;
        saveOrders(orders);

        callback({
            success: true,
            data: order
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 取消订单
exports.cancelOrder = function(data, callback) {
    try {
        const { orderId, openid } = data;

        if (!orderId || !openid) {
            return callback({
                success: false,
                error: 'Missing required parameters'
            });
        }

        const orders = readOrders();
        const order = orders[orderId];

        if (!order) {
            return callback({
                success: false,
                error: 'Order not found'
            });
        }

        // 检查订单状态
        if (order.status === 'finished' || order.status === 'cancelled') {
            return callback({
                success: false,
                error: 'Order cannot be cancelled'
            });
        }

        // 检查是否是订单创建者
        if (order.openid !== openid) {
            return callback({
                success: false,
                error: 'Only creator can cancel the order'
            });
        }

        // 更新订单
        order.status = 'cancelled';
        order.updatedAt = new Date().toISOString();

        orders[orderId] = order;
        saveOrders(orders);

        callback({
            success: true,
            data: order
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};