const fs = require('fs');
const path = require('path');

// Mock 数据路径
const userDataPath = path.join(__dirname, '../../mock-db/users.json');

// 读取用户数据
function readUsers() {
    if (!fs.existsSync(userDataPath)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
}

// 保存用户数据
function saveUsers(users) {
    fs.writeFileSync(userDataPath, JSON.stringify(users, null, 2));
}

// 生成 mock openid
function generateMockOpenid() {
    return 'mock_openid_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// 登录
exports.login = function(data, callback) {
    try {
        const { code } = data;

        // 模拟登录成功，生成 mock openid
        const openid = generateMockOpenid();

        // 读取现有用户数据
        let users = readUsers();

        // 查找用户是否存在
        let user = null;
        for (let uid in users) {
            if (users[uid].openid === openid) {
                user = users[uid];
                break;
            }
        }

        // 如果用户不存在，创建新用户
        if (!user) {
            user = {
                id: Date.now().toString(),
                openid: openid,
                nickname: '用户_' + Math.floor(Math.random() * 1000),
                avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3Rq2KzDgN2FgL0w5Z8al9g/0',
                phone: '',
                balance: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // 保存新用户
            users[user.id] = user;
            saveUsers(users);
        }

        // 更新最后登录时间
        user.lastLoginAt = new Date().toISOString();
        users[user.id] = user;
        saveUsers(users);

        callback({
            success: true,
            data: {
                openid: openid,
                session_key: 'mock_session_' + Date.now(),
                user: user
            }
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 获取用户信息
exports.getUserInfo = function(data, callback) {
    try {
        const { openid } = data;

        if (!openid) {
            return callback({
                success: false,
                error: 'Missing openid'
            });
        }

        const users = readUsers();
        let user = null;

        // 查找用户
        for (let uid in users) {
            if (users[uid].openid === openid) {
                user = users[uid];
                break;
            }
        }

        if (!user) {
            return callback({
                success: false,
                error: 'User not found'
            });
        }

        callback({
            success: true,
            data: user
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 更新用户信息
exports.updateUser = function(data, callback) {
    try {
        const { openid, userInfo } = data;

        if (!openid || !userInfo) {
            return callback({
                success: false,
                error: 'Missing required parameters'
            });
        }

        const users = readUsers();
        let user = null;

        // 查找用户
        for (let uid in users) {
            if (users[uid].openid === openid) {
                user = users[uid];
                break;
            }
        }

        if (!user) {
            return callback({
                success: false,
                error: 'User not found'
            });
        }

        // 更新用户信息
        Object.assign(user, userInfo, {
            updatedAt: new Date().toISOString()
        });

        users[user.id] = user;
        saveUsers(users);

        callback({
            success: true,
            data: user
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};

// 获取用户列表（用于管理）
exports.getUsers = function(data, callback) {
    try {
        const users = readUsers();
        const userList = Object.values(users);

        callback({
            success: true,
            data: userList
        });

    } catch (error) {
        callback({
            success: false,
            error: error.message
        });
    }
};