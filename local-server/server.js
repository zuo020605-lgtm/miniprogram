const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 启用CORS
app.use(cors());
app.use(express.json());

// 云函数路由
app.post('/cloudfunction', (req, res) => {
    const { name, action, data } = req.body;

    if (!name || !action) {
        return res.status(400).json({
            error: 'Missing required parameters',
            code: 'INVALID_PARAMS'
        });
    }

    const functionPath = path.join(__dirname, '..', 'cloudfunctions', name, 'index.js');

    // 检查云函数是否存在
    if (!fs.existsSync(functionPath)) {
        return res.status(404).json({
            error: `Function ${name} not found`,
            code: 'FUNCTION_NOT_FOUND'
        });
    }

    // 动态加载云函数
    try {
        const funcModule = require(functionPath);

        // 调用云函数
        if (typeof funcModule[action] === 'function') {
            funcModule[action](data, (result) => {
                res.json({
                    result: result,
                    errMsg: 'cloud.callFunction:ok'
                });
            });
        } else {
            res.status(400).json({
                error: `Action ${action} not found in function ${name}`,
                code: 'ACTION_NOT_FOUND'
            });
        }
    } catch (error) {
        console.error(`Error executing ${name}/${action}:`, error);
        res.status(500).json({
            error: error.message,
            code: 'EXECUTION_ERROR'
        });
    }
});

// 获取所有云函数列表
app.get('/cloudfunctions', (req, res) => {
    const functionsPath = path.join(__dirname, '..', 'cloudfunctions');
    const functions = [];

    if (fs.existsSync(functionsPath)) {
        const dirs = fs.readdirSync(functionsPath, { withFileTypes: true });
        dirs.forEach(dir => {
            if (dir.isDirectory()) {
                const indexPath = path.join(functionsPath, dir.name, 'index.js');
                if (fs.existsSync(indexPath)) {
                    const func = require(indexPath);
                    const actions = Object.keys(func).filter(key => typeof func[key] === 'function');
                    functions.push({
                        name: dir.name,
                        actions: actions
                    });
                }
            }
        });
    }

    res.json({ functions });
});

// 获取Mock数据
app.get('/mock-data/:type', (req, res) => {
    const { type } = req.params;
    const dataPath = path.join(__dirname, '..', 'mock-db', `${type}.json`);

    if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        res.json(data);
    } else {
        res.status(404).json({
            error: `Mock data ${type} not found`,
            code: 'DATA_NOT_FOUND'
        });
    }
});

// 保存Mock数据
app.post('/mock-data/:type', (req, res) => {
    const { type } = req.params;
    const data = req.body;
    const dataPath = path.join(__dirname, '..', 'mock-db', `${type}.json`);

    // 确保目录存在
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ success: true, message: 'Data saved successfully' });
});

// 管理后台API路由
// 登录验证
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'admin123') {
        const token = 'admin_token_' + Date.now();
        res.json({
            success: true,
            token: token,
            message: '登录成功'
        });
    } else {
        res.json({
            success: false,
            message: '用户名或密码错误'
        });
    }
});

// 管理后台删除用户
app.post('/mock-data/users', (req, res) => {
    const { action, id } = req.body;
    const dataPath = path.join(__dirname, '..', 'mock-db', 'users.json');

    if (action === 'delete' && id) {
        try {
            let users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            delete users[id];
            fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
            res.json({ success: true, message: '用户删除成功' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(400).json({ success: false, error: 'Invalid request' });
    }
});

// 管理后台删除订单
app.post('/mock-data/orders', (req, res) => {
    const { action, id } = req.body;
    const dataPath = path.join(__dirname, '..', 'mock-db', 'orders.json');

    if (action === 'delete' && id) {
        try {
            let orders = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            delete orders[id];
            fs.writeFileSync(dataPath, JSON.stringify(orders, null, 2));
            res.json({ success: true, message: '订单删除成功' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else if (action === 'updateStatus' && id) {
        const { status } = req.body;
        try {
            let orders = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            if (orders[id]) {
                orders[id].status = status;
                orders[id].updatedAt = new Date().toISOString();
                fs.writeFileSync(dataPath, JSON.stringify(orders, null, 2));
                res.json({ success: true, message: '订单状态更新成功' });
            } else {
                res.status(404).json({ success: false, error: '订单不存在' });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(400).json({ success: false, error: 'Invalid request' });
    }
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Local cloud server running on http://localhost:${PORT}`);
    console.log(`📡 Cloud function endpoint: http://localhost:${PORT}/cloudfunction`);
    console.log(`📋 Functions list: http://localhost:${PORT}/cloudfunctions`);
    console.log(`💾 Mock data endpoints: http://localhost:${PORT}/mock-data`);
});