# Vercel 前端部署指南

## 部署步骤

### 1. 准备工作

确保你已经：
- ✅ Railway后端已部署并运行
- ✅ Railway域名已配置：`https://ai-adhd-website-production.up.railway.app`
- ✅ GitHub仓库已包含最新代码

### 2. 连接Vercel项目

1. 访问 [Vercel Dashboard](https://vercel.com/)
2. 点击 "New Project" 或 "Import Project"
3. 选择你的GitHub仓库：`ai-adhd-website`
4. 点击 "Import"

### 3. 配置环境变量

在Vercel项目设置中，添加以下环境变量：

#### Build Environment Variables
```
VITE_API_BASE_URL=https://ai-adhd-website-production.up.railway.app
VITE_WS_URL=wss://ai-adhd-website-production.up.railway.app
```

### 4. 配置构建设置

确保构建设置如下：

```
Framework Preset: Other
Root Directory: (留空)
Build Command: cd client && npm run build
Output Directory: client/dist
Install Command: npm install
Development Command: cd client && npm run dev
```

### 5. 部署

1. 点击 "Deploy"
2. 等待构建完成
3. Vercel会自动分配一个域名，如：`https://ai-adhd-website.vercel.app`

### 6. 验证部署

部署完成后，访问你的Vercel域名，确认：
- ✅ 前端页面正常加载
- ✅ API调用成功（通过浏览器开发者工具检查网络请求）
- ✅ WebSocket连接正常
- ✅ 所有功能正常工作

## 环境变量说明

### VITE_API_BASE_URL
- **用途**：前端API请求的基础URL
- **值**：`https://ai-adhd-website-production.up.railway.app`
- **说明**：指向Railway后端服务

### VITE_WS_URL
- **用途**：WebSocket连接URL
- **值**：`wss://ai-adhd-website-production.up.railway.app`
- **说明**：指向Railway后端的WebSocket服务

## 常见问题

### 1. API请求失败
**原因**：CORS配置问题
**解决**：确保Railway后端已正确配置CORS，允许Vercel域名访问

### 2. WebSocket连接失败
**原因**：WebSocket URL配置错误
**解决**：检查VITE_WS_URL环境变量是否正确

### 3. 构建失败
**原因**：依赖版本冲突
**解决**：检查package.json和package-lock.json

## 完整架构

```
用户访问
    ↓
Vercel域名 (前端PWA)
    ↓
API请求 → Railway域名 (后端Gateway服务)
    ↓
    ├── AI服务 (端口8190)
    ├── Database服务 (端口8280)
    └── Notification服务 (端口8380)
```

## 下一步

部署完成后：
1. 更新域名配置（如果需要自定义域名）
2. 配置SSL证书（Vercel自动提供）
3. 设置环境变量监控
4. 进行完整的功能测试