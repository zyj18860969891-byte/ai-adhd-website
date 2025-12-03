# ADHD Task Manager PWA

一个专为 ADHD 用户设计的渐进式 Web 应用任务管理工具，采用微服务架构。

## 🎯 核心原则

1. **单一任务进度文件** - 使用 `task-progress.json` 实时跟踪所有任务状态
2. **微服务架构** - 每个服务高度自治，整体高度内聚
3. **真实响应** - 杜绝模拟，所有响应必须真实
4. **精简部署** - 完成后自动清理无用文件
5. **MCP 协议集成** - 基于 AI 星座项目经验，采用 MCP 协议进行 AI 服务集成

## 🤖 MCP 服务集成

本项目参考了 AI 星座运势聊天小助手项目的成功经验，集成了 MCP（Model Context Protocol）协议：

### MCP 架构优势
- ✅ **标准化协议**：使用 MCP 协议进行 AI 服务通信
- ✅ **会话管理**：支持 sessionId 和上下文保持
- ✅ **工具注册**：标准化的工具注册和调用机制
- ✅ **协议兼容**：支持 stdio/stdout 通信协议

### AI 服务工具
- `classify-task` - 任务自动分类
- `transcribe-audio` - 语音转文字
- `suggest-priority` - 优先级建议
- `extract-tasks` - 任务提取

### 部署平台支持
- 🐳 **Docker** - 完整的容器化部署（推荐）
- ⚡ **Vercel** - 前端部署（参考星座项目经验）
- 🚂 **Railway** - 后端部署（参考星座项目经验）

## 🏗️ 项目架构

```
ai-adhd-website/
├── task-progress.json          # 主任务进度文件（最高优先级）
├── server/                     # 主服务器
├── client/                     # 前端 PWA 应用
├── services/                   # 微服务
│   ├── ai-service/            # AI 服务
│   ├── db-service/            # 数据库服务
│   └── notification-service/  # 通知服务
└── data/                      # 数据存储
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm run setup
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

**必需的环境变量：**

- `OPENROUTER_API_KEY` - OpenRouter API 密钥（已预配置）
- `OPENROUTER_MODEL` - 使用的模型（默认：qwen/qwen3-235b-a22b-2507）
- `JWT_SECRET` - JWT 签名密钥（建议设置，用于安全认证）

**注意**: 项目已预配置 OpenRouter API Key，如需在生产环境使用，请替换为您的个人 API Key。

**关于 JWT_SECRET：**
- JWT_SECRET 用于 JWT token 的签名和验证
- 建议设置一个强密钥（至少 32 字符的随机字符串）
- 如果不设置，某些安全功能可能无法正常工作
- 可以使用在线工具生成随机字符串作为密钥

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 📋 任务进度跟踪

所有任务状态实时记录在 `task-progress.json` 文件中：

```json
{
  "currentTask": {
    "id": "task-001",
    "status": "in-progress",
    "progress": 75,
    "lastUpdated": "2025-12-02T14:30:00Z"
  },
  "services": {
    "ai-service": { "status": "running", "lastCheck": "2025-12-02T14:30:00Z" },
    "db-service": { "status": "running", "lastCheck": "2025-12-02T14:30:00Z" },
    "notification-service": { "status": "running", "lastCheck": "2025-12-02T14:30:00Z" }
  },
  "deployment": {
    "status": "ready",
    "version": "1.0.0",
    "lastUpdated": "2025-12-02T14:30:00Z"
  }
}
```

## 🎨 PWA 特性

- ✅ 离线可用
- ✅ 添加到主屏幕
- ✅ 推送通知
- ✅ 快速加载
- ✅ 语音输入
- ✅ AI 智能分类

## 🔧 微服务

### AI 服务 (`services/ai-service/`)
- 语音识别
- 自然语言处理
- 任务分类
- 优先级建议

### 数据库服务 (`services/db-service/`)
- SQLite 数据库管理
- 数据持久化
- 查询优化
- 备份恢复

### 通知服务 (`services/notification-service/`)
- 推送通知
- 提醒管理
- 通知历史
- 用户偏好

## 🧪 测试

```bash
npm test
```

## 📦 部署

```bash
npm run deploy
```

## 📄 许可证

MIT License