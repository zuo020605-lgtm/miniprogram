const fs = require('fs');
const path = require('path');

// Mock 数据路径
const messageDataPath = path.join(__dirname, '../../mock-db/messages.json');
const orderDataPath = path.join(__dirname, '../../mock-db/orders.json');

// 读取消息数据
function readMessages() {
    if (!fs.existsSync(messageDataPath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(messageDataPath, 'utf8'));
}

// 保存消息数据
function saveMessages(messages) {
    fs.writeFileSync(messageDataPath, JSON.stringify(messages, null, 2));
}

// 读取用户数据
function readUsers() {
    const userDataPath = path.join(__dirname, '../../mock-db/users.json');
    if (!fs.existsSync(userDataPath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
}

// 读取订单数据
function readOrders() {
    if (!fs.existsSync(orderDataPath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(orderDataPath, 'utf8'));
}

// 生成消息ID
function generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// 生成会话ID
function generateConversationId(openid1, openid2) {
    const ids = [openid1, openid2].sort();
    return 'conv_' + ids[0] + '_' + ids[1];
}

// 发送消息
exports.sendMessage = function(data, callback) {
    try {
        const { fromOpenid, toOpenid, content, orderId, messageType = 'text' } = data;

        if (!fromOpenid || !toOpenid || !content) {
            return callback({
                success: false,
                error: 'Missing required parameters'
            });
        }

        const messages = readMessages();
        const users = readUsers();
        const orders = readOrders();

        // 验证用户存在
        let fromUserExists = false;
        let toUserExists = false;
        for (let uid in users) {
            if (users[uid].openid === fromOpenid) {
                fromUserExists = true;
            }
            if (users[uid].openid === toOpenid) {
                toUserExists = true;
            }
        }

        if (!fromUserExists || !toUserExists) {
            return callback({
                success: false,
                error: 'User not found'
            });
        }

        // 验证订单存在（如果提供）
        if (orderId) {
            const order = orders[orderId];
            if (!order) {
                return callback({
                    success: false,
                    error: 'Order not found'
                });
            }
        }

        // 创建消息
        const message = {
            id: generateMessageId(),
            fromOpenid: fromOpenid,
            toOpenid: toOpenid,
            content: content,
            orderId: orderId,
            messageType: messageType, // text, image, file
            isRead: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 保存消息
        messages[message.id] = message;
        saveMessages(messages);

        // 更新会话最后消息时间
        const conversationId = generateConversationId(fromOpenid, toOpenid);
        if (!messages.conversations) {
            messages.conversations = {};
        }
        if (!messages.conversations[conversationId]) {
            messages.conversations[conversationId] = {
                id: conversationId,
                openid1: fromOpenid,
                openid2: toOpenid,
                lastMessage: content,
                lastMessageAt: message.createdAt,
                unreadCount: 0
            };
        } else {
            messages.conversations[conversationId].lastMessage = content;
            messages.conversations[conversationId].lastMessageAt = message.createdAt;
        }

        // 更新未读计数
        if (messages.conversations[conversationId].unreadCount === undefined) {
            messages.conversations[conversationId].unreadCount = 0;
        }
        messages.conversations[conversationId].unreadCount++;

        saveMessages(messages);

        callback({
            success: true,
            data: message
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 获取消息列表
exports.getMessages = function(data, callback) {
    try {
        const { openid, conversationId, limit = 50, offset = 0 } = data;
        const messages = readMessages();

        if (!openid) {
            return callback({
                success: false,
                error: 'Missing openid'
            });
        }

        // 过滤消息
        let messageList = Object.values(messages).filter(msg => {
            if (conversationId) {
                const convIds = [msg.fromOpenid, msg.toOpenid].sort();
                const currentConvId = convIds[0] + '_' + convIds[1];
                return currentConvId === conversationId;
            } else {
                // 获取指定用户的所有消息
                return msg.fromOpenid === openid || msg.toOpenid === openid;
            }
        });

        // 按时间倒序排列
        messageList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 分页
        const start = parseInt(offset);
        const end = start + parseInt(limit);
        const paginatedMessages = messageList.slice(start, end);

        callback({
            success: true,
            data: {
                list: paginatedMessages,
                total: messageList.length
            }
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 获取会话列表
exports.getConversations = function(data, callback) {
    try {
        const { openid } = data;
        const messages = readMessages();

        if (!openid) {
            return callback({
                success: false,
                error: 'Missing openid'
            });
        }

        const conversations = messages.conversations || {};
        const conversationList = Object.values(conversations).filter(conv => {
            return conv.openid1 === openid || conv.openid2 === openid;
        });

        // 获取会话用户信息
        const users = readUsers();
        const conversationListWithInfo = conversationList.map(conv => {
            let otherOpenid = conv.openid1 === openid ? conv.openid2 : conv.openid1;
            let otherUser = null;
            for (let uid in users) {
                if (users[uid].openid === otherOpenid) {
                    otherUser = users[uid];
                    break;
                }
            }
            return {
                ...conv,
                otherUser: otherUser
            };
        });

        callback({
            success: true,
            data: conversationListWithInfo
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 标记消息为已读
exports.markAsRead = function(data, callback) {
    try {
        const { openid, messageId } = data;
        const messages = readMessages();

        if (!openid || !messageId) {
            return callback({
                success: false,
                error: 'Missing required parameters'
            });
        }

        const message = messages[messageId];

        if (!message) {
            return callback({
                success: false,
                error: 'Message not found'
            });
        }

        // 验证是否是接收者
        if (message.toOpenid !== openid) {
            return callback({
                success: false,
                error: 'Permission denied'
            });
        }

        // 标记为已读
        message.isRead = true;
        message.updatedAt = new Date().toISOString();

        messages[messageId] = message;
        saveMessages(messages);

        callback({
            success: true,
            data: message
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 获取未读消息数量
exports.getUnreadCount = function(data, callback) {
    try {
        const { openid } = data;
        const messages = readMessages();

        if (!openid) {
            return callback({
                success: false,
                error: 'Missing openid'
            });
        }

        const conversations = messages.conversations || {};
        let totalUnread = 0;

        for (let convId in conversations) {
            const conv = conversations[convId];
            if (conv.openid1 === openid || conv.openid2 === openid) {
                let otherOpenid = conv.openid1 === openid ? conv.openid2 : conv.openid1;

                // 计算该会话的未读消息数量
                let unreadInConv = 0;
                for (let msgId in messages) {
                    if (msgId.startsWith('msg_')) {
                        const msg = messages[msgId];
                        if (msg.toOpenid === openid && !msg.isRead) {
                            const convIds = [msg.fromOpenid, msg.toOpenid].sort();
                            const currentConvId = convIds[0] + '_' + convIds[1];
                            if (currentConvId === convId) {
                                unreadInConv++;
                            }
                        }
                    }
                }
                conv.unreadCount = unreadInConv;
                totalUnread += unreadInConv;
            }
        }

        callback({
            success: true,
            data: {
                totalUnread: totalUnread,
                conversations: conversations
            }
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};