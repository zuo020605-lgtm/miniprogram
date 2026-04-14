# 校园跑腿微信小程序

基于微信平台的校园跑腿服务小程序，支持代取快递、代课、考试代替等功能。

## 后台管理系统

### 问题修复

以下已修复的问题：

#### 1. API 路径错误
- **问题**：仪表盘页面请求 `/api/order/all`，但实际API应该是 `/api/orders`
- **修复**：将请求路径修改为 `/api/orders`

#### 2. 脚本引用路径错误
- **问题**：仪表盘页面引用 `/backend-admin/js/` 路径，但实际文件在 `js/` 目录下
- **修复**：将脚本引用修改为相对路径 `../js/`

#### 3. 缺少后端服务
- **问题**：前端请求后端API，但没有实际的后端服务
- **修复**：
  - 创建了 `backend-server.js` 作为模拟后端服务
  - 提供了 `/api/orders` 接口返回模拟订单数据

## 快速开始

## 快速开始

### 后台管理系统

**1. 安装依赖**
```bash
npm install
```

**2. 启动后端服务**
```bash
npm run backend
```
或者直接运行：
```bash
npm run backend
```
或者使用批处理文件：
```bash
start-backend.bat
```
后端服务将在 http://localhost:3000 启动

**3. 打开后台管理页面**
- 直接用浏览器打开 `backend-admin/index.html`
- 默认账号：admin
- 默认密码：123456

### 微信小程序

**1. 安装依赖**
```bash
cd local-server
npm install
```

**2. 启动服务器**
```bash
# 方式一：使用批处理
start-server.bat

# 方式二：手动启动
cd local-server
npm start
```

**3. 运行小程序**
- 打开微信开发者工具
- 导入本项目
- 编译运行

## 功能状态

✅ **已实现：** 登录认证、首页展示、发布任务、订单管理、消息中心、个人中心、Mock 支付

⚠️ **待实现：** 接单功能、完成订单、取消订单、评价系统、搜索功能

## 项目结构

```
├── app.js                 # 应用入口
├── pages/                 # 页面目录
├── utils/                 # 工具库
├── local-server/          # 本地服务器
└── static/                # 静态资源
```

服务器将在 http://localhost:3000 启动

## 常见问题

### 后台管理系统
**Q: DataUtils/ApiCache 加载失败怎么办？**
A: 检查 js/ 目录下的这两个文件是否存在，路径是否正确

**Q: API 请求失败怎么办？**
A: 确保 backend-server.js 已启动，访问 http://localhost:3000/api/orders 确认接口正常

**Q: 登录失败怎么办？**
A: 使用默认账号 admin/123456 登录

### 微信小程序
**Q: 登录失败怎么办？**
A: 确保本地服务器已启动，访问 http://localhost:3000/health 确认

**Q: 如何修改 API 地址？**
A: 修改 `utils/api.js` 中的 `API_BASE_URL` 常量

## API 接口

### 用户认证
- `POST /api/auth/login` - 微信登录
- `GET /api/auth/userinfo` - 获取用户信息

### 订单管理
- `POST /api/order/create` - 创建订单
- `GET /api/order/list` - 获取订单列表
- `GET /api/order/detail` - 获取订单详情

### 支付系统
- `POST /api/payment/unifiedorder` - 统一下单
- `GET /api/payment/query` - 查询订单状态
- `POST /api/payment/notify` - 支付回调

## Mock 数据说明

所有接口都使用 Mock 数据模拟真实功能，不依赖微信云开发。

### 用户数据
- 使用预定义的用户信息
- 支持多个用户切换

### 订单数据
- 订单保存在内存中
- 支持创建、查询、取消操作

### 支付数据
- 模拟微信支付流程
- 随机成功/失败概率

## 开发说明

### 修改配置
- `config.js` - 本地服务器配置
- `project.config.json` - 微信开发者工具配置

### 添加新功能
1. 在 `local-server/src/routes/` 添加新的路由
2. 在 `local-server/src/models/` 添加数据模型
3. 在 `pages/` 添加新的页面
4. 更新 `app.json` 配置页面路径

## 技术栈

- 微信小程序原生开发
- Node.js + Express (Mock 服务器)
- 本地存储管理

## 注意事项

- 本地服务器仅用于开发和测试
- 所有数据都是 Mock 数据，不会持久化
- 重启服务器会清空所有数据

## 许可证

MIT License
