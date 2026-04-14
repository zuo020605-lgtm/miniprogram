// 配置文件
module.exports = {
  cloud: {
    env: 'cloud1-1hb4bq9id1e23c98', // 云开发环境ID
    traceUser: true
  },
  local: {
    baseUrl: 'http://localhost:3000', // 本地服务器地址
    useMock: true // 是否使用Mock数据
  }
}
