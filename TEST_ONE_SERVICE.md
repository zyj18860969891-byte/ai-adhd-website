# 🧪 快速测试单个服务

## 最简单的测试方法

如果您想快速测试，建议先启动一个服务进行验证：

### 步骤 1：测试 AI 服务（推荐先测试这个）

```powershell
# 1. 进入 AI 服务目录
cd E:\MultiModel\ai-adhd-website\services\ai-service

# 2. 启动 AI 服务
node index.js
```

**预期输出**:
```
AI Service running on port 3001
WebSocket running on port 3101
```

**验证**:
打开浏览器访问: http://localhost:3001/api/health

应该返回:
```json
{
  "status": "healthy",
  "lastCheck": "2025-12-03T...",
  "version": "1.0.0"
}
```

### 步骤 2：测试任务分类功能

在另一个 PowerShell 窗口中运行:

```powershell
# 测试任务分类
curl -X POST http://localhost:3001/api/classify-task `
  -H "Content-Type: application/json" `
  -d '{ "text": "需要完成项目报告", "context": {} }'
```

**预期输出**:
```json
{
  "category": "工作",
  "confidence": 0.9,
  "reasoning": "任务涉及项目报告和客户沟通，属于工作范畴",
  "suggestedTags": ["项目", "报告", "客户"]
}
```

### 步骤 3：如果 AI 服务正常，再启动其他服务

#### 启动数据库服务
```powershell
# 新开一个 PowerShell 窗口
cd E:\MultiModel\ai-adhd-website\services\db-service
node index.js
```

#### 启动主服务器
```powershell
# 新开一个 PowerShell 窗口
cd E:\MultiModel\ai-adhd-website
npm run dev:server
```

#### 启动前端
```powershell
# 新开一个 PowerShell 窗口
cd E:\MultiModel\ai-adhd-website\client
npm run dev
```

## 🎯 为什么推荐先测试 AI 服务？

1. **AI 服务最关键** - 项目的核心功能
2. **最容易出问题** - 需要 API Key 和网络
3. **验证简单** - 直接 HTTP 请求就能测试
4. **依赖最少** - 不依赖其他微服务

## ⚠️ 如果 AI 服务启动失败

### 常见错误 1：缺少依赖
```powershell
# 安装 AI 服务依赖
cd E:\MultiModel\ai-adhd-website\services\ai-service
npm install
```

### 常见错误 2：环境变量未配置
检查 `.env` 文件是否存在：
```powershell
type .env
```

如果没有，创建一个：
```powershell
copy .env.example .env
```

### 常见错误 3：端口被占用
```powershell
# 查看 3001 端口是否被占用
netstat -ano | findstr :3001

# 如果被占用，结束占用进程
taskkill /PID <进程ID> /F
```

### 常见错误 4：网络问题
确保能访问 OpenRouter：
```powershell
# 测试网络连接
curl https://openrouter.ai/api/v1/models
```

## 📋 成功标准

✅ AI 服务启动成功  
✅ http://localhost:3001/api/health 返回健康状态  
✅ 任务分类 API 正常工作  
✅ 无错误日志  

如果 AI 服务测试通过，说明：
- ✅ 依赖安装正确
- ✅ 环境变量配置正确
- ✅ API Key 有效
- ✅ 网络连接正常

然后就可以启动其他服务了！

---

**提示**: 如果 AI 服务测试通过，其他服务通常也不会有问题，因为它们的依赖更简单。