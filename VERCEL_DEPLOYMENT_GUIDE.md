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

**重要提示**：项目已删除 `vercel.json` 文件，Vercel会自动检测并配置Vite项目，避免配置冲突。

### 3. 配置环境变量

在Vercel项目设置中，添加以下环境变量：

#### Build Environment Variables
```
VITE_API_BASE_URL=https://ai-adhd-website-production.up.railway.app
VITE_WS_URL=wss://ai-adhd-website-production.up.railway.app
```

### 4. 配置构建设置

项目已配置 `client/vercel.json` 文件，Vercel会自动应用正确配置。建议检查以下设置：

```
Framework Preset: Vite (自动检测)
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

**重要配置说明**：
- `client/vercel.json` 已配置正确的静态文件路由
- API请求会自动代理到Railway后端
- 环境变量已自动配置

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

## 快速部署步骤

### 一步到位的配置

1. **连接项目**：导入GitHub仓库
2. **环境变量**：添加 `VITE_API_BASE_URL` 和 `VITE_WS_URL`
3. **构建设置**：确认Root Directory为 `client`，Output Directory为 `dist`
4. **部署**：点击Deploy按钮

就这么简单！Vercel会自动处理其余配置。

### 常见问题解决

#### JavaScript模块加载错误
**问题**：`Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`

**解决**：已通过 `client/vercel.json` 中的静态文件路由配置修复

#### Manifest文件错误
**问题**：`Manifest: Line: 1, column: 1, Syntax error`

**解决**：已通过正确的静态文件路由配置修复

#### Meta标签警告
**问题**：`<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated`

**解决**：这是警告，不影响功能，可以忽略

## 下一步

部署完成后：
1. 更新域名配置（如果需要自定义域名）
2. 配置SSL证书（Vercel自动提供）
3. 设置环境变量监控
4. 进行完整的功能测试