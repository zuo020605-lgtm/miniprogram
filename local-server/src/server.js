const express = require('express')
const cors = require('cors')
const path = require('path')

const authRoutes = require('./routes/auth')
const paymentRoutes = require('./routes/payment')
const orderRoutes = require('./routes/order')
const userRoutes = require('./routes/user')
const messageRoutes = require('./routes/message')
const walletRoutes = require('./routes/wallet')

const app = express()
const PORT = process.env.PORT || 3000

// CORS 配置 - 允许后台管理系统跨域访问
const corsOptions = {
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:8000', 'http://127.0.0.1:8000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}

// 中间件
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/user', userRoutes)
app.use('/api/message', messageRoutes)
app.use('/api/wallet', walletRoutes)

// Mock 数据路由
app.use('/mock', express.static(path.join(__dirname, '../mock')))

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('CORS enabled for backend management system')
})
