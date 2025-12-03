# 服务端口配置

## 本地开发环境端口

| 服务 | 端口 | 说明 |
|------|------|------|
| **主服务器 (Gateway)** | 3000 | API 网关，WebSocket 3100 |
| **AI 服务** | 3001 | AI 功能服务，WebSocket 3101 |
| **数据库服务** | 3002 | SQLite 数据库服务 |
| **通知服务** | 3003 | 推送通知服务，WebSocket 3103 |
| **前端 PWA** | 5173 | Vite 开发服务器 |

## 线上生产环境端口

在线上环境中，所有服务将使用 **动态分配的端口**，通过环境变量配置。

### Railway 环境变量配置

```bash
# 主服务器
PORT=3000
NODE_ENV=production

# AI 服务
PORT=3001
NODE_ENV=production

# 数据库服务
PORT=3002
NODE_ENV=production

# 通知服务
PORT=3003
NODE_ENV=production

# 微服务 URL（内部通信）
AI_SERVICE_URL=http://localhost:3001
DB_SERVICE_URL=http://localhost:3002
NOTIFICATION_SERVICE_URL=http://localhost:3003

# AI 配置
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507

# 安全
JWT_SECRET=your_strong_jwt_secret_here
```

## 服务间通信

### 1. 主服务器代理配置

主服务器将请求代理到各个微服务：

- `/api/services/ai/*` → AI 服务 (8190)
- `/api/services/db/*` → 数据库服务 (8280)
- `/api/services/notification/*` → 通知服务 (8380)

### 2. 环境变量配置

在 Railway 环境中，需要设置以下环境变量：

```bash
# 微服务 URL（内部通信）
AI_SERVICE_URL=http://localhost:8190
DB_SERVICE_URL=http://localhost:8280
NOTIFICATION_SERVICE_URL=http://localhost:8380
```

如果未设置环境变量，主服务器将使用默认的本地端口配置。

### 2. 前端代理配置

前端通过 Vite 代理到主服务器：

- `/api/*` → 主服务器 (3000)

## 端口冲突解决方案

1. **使用环境变量**：所有端口通过 `process.env.PORT` 配置
2. **动态端口分配**：Railway 会自动分配端口
3. **内部通信**：使用 `localhost` + 端口号
4. **外部访问**：通过 Railway 提供的域名

## Docker Compose 端口映射

```yaml
services:
  gateway:
    ports:
      - "3000:3000"
  ai-service:
    ports:
      - "3001:3001"
  db-service:
    ports:
      - "3002:3002"
  notification-service:
    ports:
      - "3003:3003"
  client:
    ports:
      - "5173:5173"
```

## 健康检查端点

- 主服务器：`/api/health`
- AI 服务：`/api/health`
- 数据库服务：`/api/health`
- 通知服务：`/api/health`

## WebSocket 端口

所有 WebSocket 服务使用 `parseInt(PORT, 10) + 100` 计算端口号，确保正确的数值加法而不是字符串拼接。

- 主服务器：3100 (parseInt(PORT, 10) + 100)
- AI 服务：3101 (parseInt(PORT, 10) + 100)
- 通知服务：3103 (parseInt(PORT, 10) + 100)

### 修复说明

在 Railway 生产环境中，`process.env.PORT` 是字符串类型。使用 `parseInt(PORT, 10)` 确保：

1. **正确的数值计算**：避免字符串拼接（如 "8080" + 100 = "8080100"）
2. **明确的进制**：使用十进制解析
3. **生产环境兼容性**：在生产环境中正确计算 WebSocket 端口

### 代码示例

```javascript
// 正确的做法
const wsPort = parseInt(process.env.PORT || PORT, 10) + 100;

// 错误的做法（会导致字符串拼接）
const wsPort = process.env.PORT + 100; // "8080" + 100 = "8080100"
```