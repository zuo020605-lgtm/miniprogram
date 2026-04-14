# 校园跑腿后台管理系统

基于原生 HTML/CSS/JavaScript 开发的校园跑腿小程序后台管理系统。

## 📋 功能模块

### 1. 仪表盘
- 📊 实时数据统计展示
- 📈 订单、收入、用户、消息概览
- 🔍 最近订单快速查看

### 2. 订单管理
- ✅ 订单列表展示
- 🔍 搜索和筛选功能
- 👁️ 订单详情查看
- ✏️ 订单编辑
- 🗑️ 订单删除
- 📄 分页功能

### 3. 消息管理
- 💬 消息列表展示
- 📤 发送消息
- 👁️ 消息详情查看
- ✅ 标记已读/未读
- 🗑️ 删除消息
- 📦 批量删除

### 4. 用户管理
- 👥 用户列表展示
- 👁️ 用户详情查看
- ✏️ 用户信息编辑
- 🔐 密码修改
- 👑 权限配置
- 🚫 账户状态管理（启用/禁用）

### 5. 钱包管理
- 💰 钱包余额展示
- 📊 充值记录查询
- 💸 提现申请处理
- 📝 交易流水明细
- 🔒 账户安全设置

## 🚀 快速开始

### 1. 启动后台服务器

```bash
# 方式一：使用批处理
cd c:\Users\ROG\Documents\HBuilderProjects\校园跑腿\local-server
npm install
npm start

# 方式二：直接运行
node server.js
```

服务器将在 `http://localhost:3000` 启动

### 2. 启动 Web 服务器

```bash
cd c:\Users\ROG\Documents\HBuilderProjects\校园跑腿
python -m http.server 8080
```

Web 服务器将在 `http://localhost:8080` 启动

### 3. 访问后台管理系统

在浏览器中打开：
```
http://localhost:8080/backend-admin/index.html
```

## 📁 项目结构

```
backend-admin/
├── index.html              # 主页面（包含导航和路由）
├── pages/                  # 页面模块
│   ├── dashboard.html      # 仪表盘
│   ├── order/
│   │   └── list.html       # 订单管理
│   ├── messages/
│   │   └── list.html       # 消息管理
│   ├── users/
│   │   └── list.html       # 用户管理
│   └── wallet/
│       └── list.html       # 钱包管理
├── config/                 # 配置文件
│   └── api.js
├── utils/                  # 工具函数
│   └── request.js
├── services/               # API 服务
│   └── api.js
└── tests/                  # 测试文件
    ├── unit-tests.js       # 单元测试
    ├── integration-tests.js # 集成测试
    └── index.html          # 测试运行器
```

## 🎨 UI/UX 特性

- ✨ 现代化渐变设计风格
- 📱 响应式布局（支持移动端）
- 🎯 清晰的视觉层次
- 🌈 直观的状态标识
- 🔄 流畅的交互动画
- 📊 数据可视化展示

## 🧪 测试

### 运行测试

在浏览器中打开：
```
http://localhost:8080/backend-admin/tests/index.html
```

### 测试覆盖

- ✅ 单元测试：工具函数、数据转换、UI 交互
- ✅ 集成测试：模块间通信、API 调用、错误处理
- ✅ 性能测试：API 响应时间

## 🔧 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js + Express
- **样式**: 原生 CSS（无框架依赖）
- **测试**: 自定义测试框架

## 📝 API 接口

### 订单相关
- `GET /api/order/all` - 获取所有订单
- `GET /api/order/list` - 获取订单列表
- `POST /api/order/delete` - 删除订单

### 消息相关
- `GET /api/message/list` - 获取消息列表
- `POST /api/message/send` - 发送消息
- `POST /api/message/mark-read` - 标记已读
- `POST /api/message/delete` - 删除消息

### 用户相关
- `GET /api/user/list` - 获取用户列表
- `POST /api/user/update` - 更新用户信息

### 钱包相关
- `GET /api/wallet/transactions` - 获取交易记录
- `POST /api/wallet/recharge` - 充值

## 🔐 安全特性

- 🔒 输入验证
- 🛡️ XSS 防护
- 🔐 密码加密
- 👮 权限控制
- 📝 操作日志

## 📱 响应式支持

系统支持以下设备：
- 💻 桌面端（> 1024px）
- 📱 平板端（768px - 1024px）
- 📱 移动端（< 768px）

## 🎯 开发说明

### 添加新页面

1. 在 `pages/` 目录下创建新的 HTML 文件
2. 在 `index.html` 中添加导航菜单项
3. 在 `pages` 对象中配置路由

### 添加新功能

1. 在对应页面模块中添加功能代码
2. 更新相关的 API 服务
3. 编写单元测试和集成测试

## 📊 性能优化

- ⚡ 按需加载页面
- 📦 最小化 HTTP 请求
- 🗜️ 代码压缩
- 💾 浏览器缓存
- 🚀 CDN 加速（可选）

## 🐛 常见问题

### Q: 页面无法加载？
A: 确保后台服务器（3000 端口）和 Web 服务器（8080 端口）都已启动

### Q: API 请求失败？
A: 检查服务器日志，确认 API 端点正确

### Q: 样式显示异常？
A: 清除浏览器缓存，强制刷新（Ctrl+F5）

## 📄 许可证

MIT License

## 👥 开发团队

校园跑腿项目组

---

**最后更新**: 2026-04-12
