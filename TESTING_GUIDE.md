# 🧪 测试指南

## 测试准备

### 需要启动的服务（共 5 个）

| 服务 | 端口 | 启动命令 | 文件位置 |
|------|------|----------|----------|
| 主服务器 | 3000 | `npm run dev:server` | `server/index.js` |
| AI 服务 | 3001 | `node index.js` | `services/ai-service/index.js` |
| 数据库服务 | 3002 | `node index.js` | `services/db-service/index.js` |
| 通知服务 | 3003 | `node index.js` | `services/notification-service/index.js` |
| 前端 PWA | 5173 | `npm run dev` | `client/src/main.jsx` |

## 🚀 启动步骤

### 步骤 1：检查环境
```bash
# 检查 Node.js 版本
node -v
# 应该显示 v18.x 或更高版本

# 检查 npm 版本
npm -v
# 应该显示 8.x 或更高版本
```

### 步骤 2：安装依赖
```bash
# 安装主项目依赖
npm install

# 安装前端依赖
cd client && npm install && cd ..

# 安装微服务依赖
cd services/ai-service && npm install && cd ../..
cd services/db-service && npm install && cd ../..
cd services/notification-service && npm install && cd ../..
```

### 步骤 3：配置环境变量
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件（可选，API Key 已预配置）
# 确保 OPENROUTER_API_KEY 和 JWT_SECRET 已设置
```

### 步骤 4：启动服务

**需要 5 个独立的命令行窗口/标签页：**

#### 窗口 1：主服务器（端口 3000）
```bash
npm run dev:server
```
**验证**: 访问 http://localhost:3000/api/health

#### 窗口 2：AI 服务（端口 3001）
```bash
cd services/ai-service
node index.js
```
**验证**: 访问 http://localhost:3001/api/health

#### 窗口 3：数据库服务（端口 3002）
```bash
cd services/db-service
node index.js
```
**验证**: 访问 http://localhost:3002/api/health

#### 窗口 4：通知服务（端口 3003）
```bash
cd services/notification-service
node index.js
```
**验证**: 访问 http://localhost:3003/api/health

#### 窗口 5：前端 PWA（端口 5173）
```bash
cd client
npm run dev
```
**验证**: 访问 http://localhost:5173

## 🔍 测试检查点

### 1. 服务健康检查

每个服务都应该返回健康状态：

```bash
# 主服务器
curl http://localhost:3000/api/health

# AI 服务
curl http://localhost:3001/api/health

# 数据库服务
curl http://localhost:3002/api/health

# 通知服务
curl http://localhost:3003/api/health
```

**预期响应**:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-03T...",
  "services": {...},
  "version": "1.0.0"
}
```

### 2. 前端界面测试

访问 http://localhost:5173

**应该看到**:
- ✅ 首页加载成功
- ✅ 导航菜单正常
- ✅ 无 JavaScript 错误

### 3. AI 服务测试

测试 AI 工具是否正常工作：

```bash
# 测试任务分类
curl -X POST http://localhost:3001/api/classify-task \
  -H "Content-Type: application/json" \
  -d '{
    "text": "需要完成项目报告并发送给客户",
    "context": {}
  }'
```

**预期响应**:
```json
{
  "category": "工作",
  "confidence": 0.9,
  "reasoning": "任务涉及项目报告和客户沟通，属于工作范畴",
  "suggestedTags": ["项目", "报告", "客户"]
}
```

### 4. 数据库服务测试

```bash
# 获取任务列表
curl http://localhost:3002/api/tasks

# 获取统计数据
curl http://localhost:3002/api/stats
```

**预期响应**:
```json
[]
```
（空数组表示数据库正常，还没有任务）

### 5. 主服务器代理测试

```bash
# 通过主服务器访问 AI 服务
curl -X POST http://localhost:3000/api/services/ai/classify-task \
  -H "Content-Type: application/json" \
  -d '{
    "text": "需要完成项目报告并发送给客户",
    "context": {}
  }'
```

### 6. WebSocket 连接测试

检查 WebSocket 连接是否正常：
- 主服务器 WebSocket: ws://localhost:3100
- AI 服务 WebSocket: ws://localhost:3101
- 通知服务 WebSocket: ws://localhost:3103

## 🐛 常见问题排查

### 问题 1：端口被占用
**症状**: "EADDRINUSE" 错误
**解决**: 
- 检查端口是否被其他程序占用
- 修改配置文件中的端口号
- 关闭占用端口的程序

### 问题 2：API Key 错误
**症状**: AI 服务返回 401 错误
**解决**:
- 检查 .env 文件中的 OPENROUTER_API_KEY
- 确认 API Key 有效
- 重启 AI 服务

### 问题 3：数据库连接失败
**症状**: 数据库服务启动失败
**解决**:
- 检查 data 目录是否存在
- 检查文件权限
- 确认 sqlite3 安装正确

### 问题 4：前端无法连接后端
**症状**: CORS 错误或连接失败
**解决**:
- 检查前端 API 配置
- 确认主服务器运行在 3000 端口
- 检查 CORS 配置

## 📊 测试脚本

我已经创建了自动化测试脚本：

```bash
# 验证 API Key 配置
node verify-api-key.js

# 验证部署配置
node check-openrouter-config.js

# 验证整体部署
bash verify-deployment.sh  # Linux/Mac
# 或
./verify-deployment.sh     # PowerShell
```

## 🎯 测试完成标准

✅ 所有 5 个服务都能正常启动  
✅ 所有健康检查端点返回 200  
✅ 前端界面能正常访问  
✅ AI 服务能正常响应请求  
✅ 数据库服务能正常响应请求  
✅ 主服务器能正确代理请求  
✅ 无 JavaScript 错误或 CORS 错误  

## 📞 测试支持

如果遇到问题：
1. 查看控制台错误信息
2. 检查服务日志
3. 运行验证脚本
4. 参考本文档的排查指南
5. 查看项目文档：
   - [DEPLOYMENT.md](./DEPLOYMENT.md)
   - [OPENROUTER_GUIDE.md](./OPENROUTER_GUIDE.md)
   - [README.md](./README.md)

---

**测试时间**: 建议预留 30-60 分钟进行完整测试  
**测试环境**: 确保网络能访问 OpenRouter API