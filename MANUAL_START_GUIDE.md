# 🚀 手动启动指南

## 测试前准备

### 1. 检查环境
```powershell
# 检查 Node.js 版本
node -v
# 应该显示 v18.x 或更高版本

# 检查 npm 版本
npm -v
# 应该显示 8.x 或更高版本
```

### 2. 安装依赖（如果还没安装）
```powershell
# 安装主项目依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..

# 安装微服务依赖
cd services/ai-service
npm install
cd ../..

cd services/db-service
npm install
cd ../..

cd services/notification-service
npm install
cd ../..
```

## 🎯 手动启动步骤

### 步骤 1：打开 5 个 PowerShell 窗口

**建议**: 打开 5 个独立的 PowerShell 窗口，每个窗口运行一个服务

### 步骤 2：在每个窗口中启动对应的服务

#### 窗口 1：主服务器（端口 3000）
```powershell
# 确保在项目根目录
cd E:\MultiModel\ai-adhd-website

# 启动主服务器
npm run dev:server
```

**验证**: 打开浏览器访问 http://localhost:3000/api/health

---

#### 窗口 2：AI 服务（端口 3001）
```powershell
# 进入 AI 服务目录
cd E:\MultiModel\ai-adhd-website\services\ai-service

# 启动 AI 服务
node index.js
```

**验证**: 打开浏览器访问 http://localhost:3001/api/health

---

#### 窗口 3：数据库服务（端口 3002）
```powershell
# 进入数据库服务目录
cd E:\MultiModel\ai-adhd-website\services\db-service

# 启动数据库服务
node index.js
```

**验证**: 打开浏览器访问 http://localhost:3002/api/health

---

#### 窗口 4：通知服务（端口 3003）
```powershell
# 进入通知服务目录
cd E:\MultiModel\ai-adhd-website\services\notification-service

# 启动通知服务
node index.js
```

**验证**: 打开浏览器访问 http://localhost:3003/api/health

---

#### 窗口 5：前端 PWA（端口 5173）
```powershell
# 进入前端目录
cd E:\MultiModel\ai-adhd-website\client

# 启动前端开发服务器
npm run dev
```

**验证**: 打开浏览器访问 http://localhost:5173

## 📋 启动顺序说明

**建议的启动顺序**:
1. **AI 服务** (端口 3001) - 先启动 AI 服务
2. **数据库服务** (端口 3002) - 再启动数据库
3. **通知服务** (端口 3003) - 然后通知服务
4. **主服务器** (端口 3000) - 最后主服务器
5. **前端 PWA** (端口 5173) - 最后前端

**原因**: 主服务器依赖其他微服务，所以最后启动

## 🎨 窗口管理建议

### 方式 1：使用 PowerShell 标签页
- Windows Terminal 支持多标签页
- 每个标签页运行一个服务
- 方便切换和管理

### 方式 2：使用独立窗口
- 每个服务一个独立的 PowerShell 窗口
- 可以并排显示，方便查看日志
- 推荐使用这种方式

### 方式 3：使用任务栏分组
- 将 5 个窗口都固定在任务栏
- 方便快速切换
- 可以最小化不常用的窗口

## 🔍 启动成功判断

### 主服务器（端口 3000）成功标志：
```
Server running on port 3000
WebSocket running on port 3100
```

### AI 服务（端口 3001）成功标志：
```
AI Service running on port 3001
WebSocket running on port 3101
```

### 数据库服务（端口 3002）成功标志：
```
Database Service running on port 3002
```

### 通知服务（端口 3003）成功标志：
```
Notification Service running on port 3003
WebSocket running on port 3103
```

### 前端 PWA（端口 5173）成功标志：
```
vite v5.4.14 dev server running at:
> http://localhost:5173/
```

## ⚠️ 常见问题

### 问题 1：端口被占用
**错误信息**: `EADDRINUSE`
**解决方法**:
```powershell
# 查看端口占用
netstat -ano | findstr :3000

# 结束占用进程
taskkill /PID <进程ID> /F
```

### 问题 2：依赖未安装
**错误信息**: `Cannot find module`
**解决方法**:
```powershell
# 重新安装依赖
npm install
cd client && npm install && cd ..
cd services/ai-service && npm install && cd ../..
cd services/db-service && npm install && cd ../..
cd services/notification-service && npm install && cd ../..
```

### 问题 3：环境变量未配置
**错误信息**: `OPENROUTER_API_KEY is not defined`
**解决方法**:
```powershell
# 检查 .env 文件
type .env

# 如果没有，复制示例文件
copy .env.example .env
```

## 🧪 快速测试

所有服务启动后，进行快速测试：

### 1. 测试主服务器
```powershell
curl http://localhost:3000/api/health
```

### 2. 测试 AI 服务
```powershell
curl http://localhost:3001/api/health
```

### 3. 测试数据库服务
```powershell
curl http://localhost:3002/api/health
```

### 4. 测试通知服务
```powershell
curl http://localhost:3003/api/health
```

### 5. 测试前端
- 打开浏览器访问 http://localhost:5173
- 应该看到 ADHD Task Manager 的界面

## 📞 如果遇到问题

1. **查看对应窗口的日志输出**
2. **检查端口是否被占用**
3. **确认所有依赖已安装**
4. **检查环境变量配置**
5. **运行验证脚本**:
   ```powershell
   node verify-api-key.js
   ```

---

**提示**: 如果觉得手动启动麻烦，可以使用 PowerShell 脚本：
```powershell
.\run-services.ps1
```