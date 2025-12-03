# ADHD Task Manager PWA 部署指南

## 🚀 快速开始

### 开发环境

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd ai-adhd-website
   ```

2. **安装依赖**
   ```bash
   # 使用启动脚本（推荐）
   chmod +x start-dev.sh
   ./start-dev.sh
   
   # 或者手动安装
   npm run setup
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入你的配置
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

### 生产环境

#### 方式一：使用 Docker（推荐）

1. **构建和启动**
   ```bash
   docker-compose up -d
   ```

2. **访问应用**
   - 前端：http://localhost:5173
   - 后端 API：http://localhost:3000

#### 方式二：手动部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **启动服务**
   ```bash
   npm start
   ```

## 📋 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker（可选，用于容器化部署）

## ⚙️ 配置说明

### 必需配置

在 `.env` 文件中配置以下环境变量：

```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_PATH=./data/tasks.db

# AI 配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# 前端配置
CLIENT_PORT=5173
CLIENT_URL=http://localhost:5173

# 安全配置
JWT_SECRET=your_jwt_secret_key_here
```

### 可选配置

```env
# 微服务配置
AI_SERVICE_URL=http://localhost:3001
DB_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003
```

## 🏗️ 架构说明

### 微服务架构

```
ai-adhd-website/
├── server/              # 主服务器（端口 3000）
├── client/              # 前端 PWA（端口 5173）
├── services/
│   ├── ai-service/      # AI 服务（端口 3001）
│   ├── db-service/      # 数据库服务（端口 3002）
│   └── notification-service/  # 通知服务（端口 3003）
└── data/                # 数据存储
```

### 服务说明

1. **主服务器**：协调所有微服务，提供统一的 API 接口
2. **AI 服务**：处理语音识别、任务分类、优先级建议
3. **数据库服务**：管理 SQLite 数据库，提供数据持久化
4. **通知服务**：处理推送通知和提醒

## 🔍 监控和维护

### 健康检查

每个服务都提供健康检查端点：

- 主服务器：`GET /api/health`
- AI 服务：`GET /api/services/ai/health`
- 数据库服务：`GET /api/services/db/health`
- 通知服务：`GET /api/services/notification/health`

### 任务进度监控

访问 `task-progress.json` 文件查看项目状态：

```json
{
  "project": {
    "status": "ready",
    "version": "1.0.0"
  },
  "currentTask": {
    "status": "completed"
  },
  "services": {
    "ai-service": { "status": "running" },
    "db-service": { "status": "running" },
    "notification-service": { "status": "running" },
    "frontend": { "status": "running" }
  }
}
```

## 🚨 故障排除

### 常见问题

1. **端口冲突**
   - 修改 `.env` 文件中的端口号
   - 确保所有服务使用不同的端口

2. **依赖安装失败**
   - 清理 npm 缓存：`npm cache clean --force`
   - 重新安装依赖：`npm install`

3. **数据库连接失败**
   - 检查 `DB_PATH` 配置
   - 确保数据目录存在且有写权限

4. **AI 服务不可用**
   - 检查 `OPENAI_API_KEY` 配置
   - 确认 OpenAI API 可访问

### 日志查看

```bash
# 查看 Docker 日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs ai-service
```

## 📦 备份和恢复

### 数据备份

```bash
# 通过 API 备份
curl -X POST http://localhost:3002/api/backup

# 手动备份数据库文件
cp data/tasks.db data/tasks.db.backup
```

### 数据恢复

```bash
# 恢复数据库文件
cp data/tasks.db.backup data/tasks.db
```

## 🔒 安全建议

1. **环境变量安全**
   - 不要在代码中硬编码敏感信息
   - 使用环境变量管理密钥

2. **生产环境配置**
   - 设置 `NODE_ENV=production`
   - 配置 HTTPS
   - 限制 API 访问权限

3. **数据库安全**
   - 定期备份数据
   - 限制数据库文件访问权限

## 📞 支持

如有问题，请：
1. 查看本部署指南
2. 检查服务健康状态
3. 查看日志文件
4. 提交 Issue 或联系开发团队

---

**注意**：本项目遵循"杜绝禁止任何模拟使用"原则，所有服务必须真实运行，禁止硬编码响应。