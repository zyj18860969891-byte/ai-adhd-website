# ADHD Task Manager PWA - 完整部署指南

## 📋 部署概览

本项目采用微服务架构，部署到 Railway（后端）+ Vercel（前端）：

### 服务架构

```
┌─────────────────────────────────────────┐
│              Vercel                     │  ← 前端 PWA
│  https://your-app.vercel.app            │
└─────────────────────────────────────────┘
                    │
                    │ API 请求
                    ▼
┌─────────────────────────────────────────┐
│             Railway                     │  ← 后端微服务
│  https://your-app.up.railway.app        │
├─────────────────────────────────────────┤
│  Gateway (Port 3000)                    │
│  - API Gateway                          │
│  - 代理到各微服务                       │
├─────────────────────────────────────────┤
│  AI Service (Port 3001)                 │
│  - 任务分类                             │
│  - AI 建议                              │
├─────────────────────────────────────────┤
│  DB Service (Port 3002)                 │
│  - SQLite 数据库                        │
│  - 数据持久化                           │
├─────────────────────────────────────────┤
│  Notification Service (Port 3003)       │
│  - 推送通知                             │
│  - WebSocket 通信                       │
└─────────────────────────────────────────┘
```

## 🚀 快速部署

### 方法一：使用部署脚本（推荐）

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行完整部署
./deploy.sh

# 或者分步执行
./deploy.sh check     # 检查依赖
./deploy.sh build     # 构建项目
./deploy.sh railway   # 部署到 Railway
./deploy.sh vercel    # 部署到 Vercel
./deploy.sh verify    # 验证部署
```

### 方法二：手动部署

#### 1. 部署后端到 Railway

```bash
# 登录 Railway
railway login

# 初始化项目
railway init your-adhd-task-manager

# 推送代码
git push railway main

# 配置环境变量
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set OPENROUTER_API_KEY=your_api_key
railway variables set JWT_SECRET=your_jwt_secret
# ... 其他环境变量
```

#### 2. 部署前端到 Vercel

```bash
# 进入前端目录
cd client

# 登录 Vercel
vercel login

# 设置环境变量
vercel env add VITE_API_BASE_URL production "https://your-app.up.railway.app"

# 部署
vercel --prod
```

## 🔧 端口配置总结

### 本地开发环境

| 服务 | 端口 | WebSocket | 说明 |
|------|------|-----------|------|
| Gateway | 3000 | 3100 | API 网关 |
| AI Service | 3001 | 3101 | AI 功能 |
| DB Service | 3002 | - | 数据库 |
| Notification | 3003 | 3103 | 通知服务 |
| Client | 5173 | - | 前端开发 |

### 线上生产环境

在线上环境中：
- **所有服务使用 Railway 动态分配的端口**
- **通过环境变量 `PORT` 配置**
- **服务间通信使用 `localhost:PORT`**
- **外部访问通过 Railway 域名**

## 🌐 访问地址

部署完成后，你会得到两个 URL：

1. **后端 API**: `https://your-app.up.railway.app`
2. **前端应用**: `https://your-app.vercel.app`

## ⚙️ 环境变量配置

### Railway（后端）必需环境变量

```bash
# 基础配置
NODE_ENV=production
PORT=3000

# 微服务端口
GATEWAY_PORT=3000
AI_SERVICE_PORT=3001
DB_SERVICE_PORT=3002
NOTIFICATION_SERVICE_PORT=3003

# AI 配置
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507

# 安全配置
JWT_SECRET=your_strong_jwt_secret_here

# 数据库配置
DB_PATH=./data/tasks.db

# CORS 配置
CORS_ORIGIN=https://your-app.vercel.app
```

### Vercel（前端）必需环境变量

```bash
# API 配置
VITE_API_BASE_URL=https://your-app.up.railway.app
VITE_WS_URL=wss://your-app.up.railway.app

# 应用配置
VITE_APP_TITLE=ADHD Task Manager
VITE_APP_VERSION=1.0.0
```

## 🧪 验证部署

部署完成后，验证以下内容：

### 1. 健康检查

```bash
# 主服务器
curl https://your-app.up.railway.app/api/health

# AI 服务
curl https://your-app.up.railway.app/api/services/ai/health

# 数据库服务
curl https://your-app.up.railway.app/api/services/db/health

# 通知服务
curl https://your-app.up.railway.app/api/services/notification/health
```

### 2. 功能测试

```bash
# 测试任务创建
curl -X POST https://your-app.up.railway.app/api/services/db/tasks \
  -H "Content-Type: application/json" \
  -d '{"id":"test-1","title":"Test Task","status":"pending"}'

# 测试 AI 分类
curl -X POST https://your-app.up.railway.app/api/services/ai/classify-task \
  -H "Content-Type: application/json" \
  -d '{"text":"需要完成项目报告","context":{}}'
```

### 3. 前端访问

访问 `https://your-app.vercel.app`，确认：
- ✅ 页面正常加载
- ✅ 无 500 错误
- ✅ 可以创建任务
- ✅ AI 功能正常
- ✅ 通知功能正常

## 📊 监控和维护

### 查看日志

```bash
# 查看所有服务日志
railway logs

# 查看特定服务日志
railway logs --service gateway
railway logs --service ai-service
railway logs --service db-service
railway logs --service notification-service
```

### 性能监控

Railway 提供：
- CPU 使用率
- 内存使用率
- 网络流量
- 响应时间

### 扩展服务

在 Railway 仪表板中：
1. 进入服务设置
2. 调整实例数量
3. 配置自动缩放

## 💰 成本估算

### Railway 成本

| 服务 | 免费额度 | 超出后价格 |
|------|----------|------------|
| Gateway | 500,000 请求/月 | $1/100k 请求 |
| AI Service | 500,000 请求/月 | $1/100k 请求 |
| DB Service | 500,000 请求/月 | $1/100k 请求 |
| Notification | 500,000 请求/月 | $1/100k 请求 |

**预估月成本**: $0-20（取决于使用量）

### Vercel 成本

| 项目 | 免费额度 | 超出后价格 |
|------|----------|------------|
| 前端托管 | 100GB 流量/月 | $20/1000GB |
| Serverless Functions | 100,000 调用/月 | $0.0005/调用 |

**预估月成本**: $0-5（取决于使用量）

## 🔒 安全配置

### HTTPS

- Railway 和 Vercel 自动提供 HTTPS 证书

### CORS

配置 `CORS_ORIGIN` 环境变量限制跨域访问

### JWT

- 使用强密钥（至少 32 字符）
- 定期轮换密钥
- 不要在客户端存储敏感信息

### API Key

- 将 `OPENROUTER_API_KEY` 设置为 Secret
- 定期检查使用量
- 如有泄露立即更换

## 🆘 故障排除

### 常见问题

1. **服务启动失败**
   - 检查环境变量
   - 查看服务日志
   - 确认端口未被占用

2. **数据库连接失败**
   - 检查 `DB_PATH` 配置
   - 确保有写权限
   - 检查 SQLite 文件是否存在

3. **AI 服务不可用**
   - 检查 `OPENROUTER_API_KEY`
   - 检查网络连接
   - 查看 OpenRouter 使用量

4. **前端无法连接后端**
   - 检查 `VITE_API_BASE_URL` 配置
   - 确认 CORS 配置正确
   - 检查 Railway 服务状态

### 调试命令

```bash
# 重启所有服务
railway restart

# 查看环境变量
railway env

# 查看服务状态
railway status

# SSH 到服务
railway ssh
```

## 📝 后续步骤

1. **配置自定义域名**
   - Railway: 添加自定义域名
   - Vercel: 配置自定义域名

2. **设置监控告警**
   - Railway: 配置告警规则
   - Vercel: 监控性能指标

3. **优化性能**
   - 启用缓存
   - 优化数据库查询
   - 压缩前端资源

4. **备份数据**
   - 定期备份 SQLite 数据库
   - 考虑使用云数据库

## 🎉 恭喜！

你已经成功部署了 ADHD Task Manager PWA！

**访问地址**:
- 前端应用: `https://your-app.vercel.app`
- API 文档: `https://your-app.up.railway.app/api/health`

现在可以开始使用你的 ADHD 友好任务管理应用了！🎉