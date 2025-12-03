# Railway 部署指南

## 概述

本项目使用微服务架构，包含以下服务：
- **主服务器 (Gateway)** - 端口 3000
- **AI 服务** - 端口 3001  
- **数据库服务** - 端口 3002
- **通知服务** - 端口 3003
- **前端 PWA** - 端口 5173

## 部署步骤

### 1. 准备工作

确保你有：
- [Railway](https://railway.app) 账号
- GitHub 仓库已推送最新代码
- OpenRouter API Key

### 2. 连接 GitHub 仓库

1. 登录 Railway
2. 点击 "Deploy from GitHub repo"
3. 选择你的 ADHD Task Manager 仓库
4. 点击 "Deploy"

### 3. 配置环境变量

在 Railway 仪表板中配置以下环境变量：

#### 必需的环境变量

```bash
# Node.js 环境
NODE_ENV=production

# 主服务器端口
PORT=3000

# 微服务端口配置
GATEWAY_PORT=3000
AI_SERVICE_PORT=3001
DB_SERVICE_PORT=3002
NOTIFICATION_SERVICE_PORT=3003

# AI 配置
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507

# JWT 密钥（设置为 Secret）
JWT_SECRET=your_strong_jwt_secret_here

# 数据库路径
DB_PATH=./data/tasks.db

# CORS 配置
CORS_ORIGIN=https://your-adhd-task-manager.vercel.app
```

#### 可选的环境变量

```bash
# 日志级别
LOG_LEVEL=info

# 数据库备份
DB_BACKUP_ENABLED=true
DB_BACKUP_INTERVAL=24
```

### 4. 配置服务

Railway 会自动读取 `railway.toml` 文件并配置服务。

### 5. 启动服务

Railway 会自动：
1. 构建 Docker 镜像
2. 启动所有微服务
3. 运行健康检查

## 服务架构

```
┌─────────────────────────────────────────┐
│           Railway App                   │
├─────────────────────────────────────────┤
│  Gateway (Port 3000)                    │
│  - API Gateway                          │
│  - WebSocket Server (3100)              │
├─────────────────────────────────────────┤
│  AI Service (Port 3001)                 │
│  - Task Classification                  │
│  - AI Suggestions                       │
│  - WebSocket Server (3101)              │
├─────────────────────────────────────────┤
│  DB Service (Port 3002)                 │
│  - SQLite Database                      │
│  - Data Persistence                     │
├─────────────────────────────────────────┤
│  Notification Service (Port 3003)       │
│  - Push Notifications                   │
│  - WebSocket Server (3103)              │
└─────────────────────────────────────────┘
```

## 健康检查

Railway 会定期检查以下端点：

- Gateway: `https://your-app.railway.app/api/health`
- AI Service: `https://your-app.railway.app:3001/api/health`
- DB Service: `https://your-app.railway.app:3002/api/health`
- Notification Service: `https://your-app.railway.app:3003/api/health`

## 监控和日志

### 查看日志

```bash
# 在 Railway 仪表板中
# 或使用 CLI
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

## 故障排除

### 常见问题

1. **服务启动失败**
   - 检查环境变量是否正确
   - 查看服务日志

2. **端口冲突**
   - Railway 会自动分配端口
   - 确保使用环境变量配置端口

3. **数据库连接失败**
   - 检查 `DB_PATH` 配置
   - 确保有写权限

4. **AI 服务不可用**
   - 检查 `OPENROUTER_API_KEY`
   - 检查网络连接

### 调试命令

```bash
# 重启所有服务
railway restart

# 重启特定服务
railway restart --service gateway

# 查看环境变量
railway env

# 查看服务状态
railway status
```

## 扩展和优化

### 水平扩展

在 Railway 仪表板中：
1. 进入服务设置
2. 调整实例数量
3. 配置自动缩放

### 性能优化

1. **数据库优化**
   - 启用查询缓存
   - 定期备份

2. **AI 服务优化**
   - 启用请求缓存
   - 优化模型配置

3. **通知服务优化**
   - 批量发送通知
   - 优化 WebSocket 连接

## 成本管理

### 估算成本

- **Gateway**: $5/month
- **AI Service**: $5/month
- **DB Service**: $5/month
- **Notification Service**: $5/month
- **总计**: ~$20/month

### 降低成本

1. 使用免费额度
2. 优化资源使用
3. 设置预算提醒

## 安全配置

### HTTPS

Railway 自动提供 HTTPS 证书。

### CORS

配置 `CORS_ORIGIN` 环境变量限制跨域访问。

### JWT

使用强密钥并定期轮换。

## 备份和恢复

### 数据库备份

```bash
# 手动备份
railway ssh
cp ./data/tasks.db ./data/tasks.db.backup

# 自动备份（通过 cron）
0 2 * * * cd /app && cp ./data/tasks.db ./data/tasks.db.$(date +%Y%m%d)
```

### 代码回滚

在 Railway 仪表板中：
1. 进入 Deployments
2. 选择历史版本
3. 点击 Rollback

## 支持

如有问题，请：
1. 查看 Railway 文档
2. 检查项目 Issues
3. 联系支持团队