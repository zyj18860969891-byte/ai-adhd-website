# 🧪 快速测试检查清单

## 📋 测试前检查

- [ ] Node.js v18+ 已安装
- [ ] npm v8+ 已安装
- [ ] 网络能访问 OpenRouter API
- [ ] 所有依赖已安装

## 🚀 启动服务

### 方式 1：一键启动（推荐）
```bash
start-all-services.bat
```
**效果**: 自动打开 5 个命令行窗口，分别启动所有服务

### 方式 2：手动启动
需要 5 个独立窗口：

1. **主服务器** (端口 3000)
   ```bash
   npm run dev:server
   ```

2. **AI 服务** (端口 3001)
   ```bash
   cd services/ai-service && node index.js
   ```

3. **数据库服务** (端口 3002)
   ```bash
   cd services/db-service && node index.js
   ```

4. **通知服务** (端口 3003)
   ```bash
   cd services/notification-service && node index.js
   ```

5. **前端 PWA** (端口 5173)
   ```bash
   cd client && npm run dev
   ```

## ✅ 快速验证

### 1. 服务启动检查（2 分钟）
打开浏览器，依次访问：

- [ ] http://localhost:3000/api/health ✅
- [ ] http://localhost:3001/api/health ✅
- [ ] http://localhost:3002/api/health ✅
- [ ] http://localhost:3003/api/health ✅

**预期**: 返回 JSON 健康状态

### 2. 前端界面检查（3 分钟）
- [ ] http://localhost:5173 能正常访问 ✅
- [ ] 页面无 JavaScript 错误 ✅
- [ ] 导航菜单正常 ✅

### 3. AI 功能测试（5 分钟）
测试任务分类功能：

```bash
curl -X POST http://localhost:3001/api/classify-task \
  -H "Content-Type: application/json" \
  -d '{"text": "需要完成项目报告", "context": {}}'
```

- [ ] 返回 JSON 响应 ✅
- [ ] 包含 category 字段 ✅
- [ ] confidence 值合理 ✅

### 4. 数据库功能测试（3 分钟）
```bash
curl http://localhost:3002/api/tasks
```

- [ ] 返回空数组 [] ✅
- [ ] 无错误响应 ✅

### 5. 主服务器代理测试（2 分钟）
```bash
curl -X POST http://localhost:3000/api/services/ai/classify-task \
  -H "Content-Type: application/json" \
  -d '{"text": "需要完成项目报告", "context": {}}'
```

- [ ] 能通过主服务器访问 AI 服务 ✅

## 🎯 测试完成标准

- [ ] ✅ 所有 5 个服务正常启动
- [ ] ✅ 所有健康检查通过
- [ ] ✅ 前端界面正常
- [ ] ✅ AI 服务响应正常
- [ ] ✅ 数据库服务响应正常
- [ ] ✅ 无错误日志

## ⏱️ 测试时间

- **快速测试**: 15 分钟
- **完整测试**: 30-60 分钟
- **压力测试**: 2 小时+

## 🆘 问题排查

如果某个服务启动失败：

1. **查看对应窗口的日志**
2. **检查端口是否被占用**
3. **运行验证脚本**:
   ```bash
   node verify-api-key.js
   ```
4. **检查环境变量**:
   ```bash
   type .env
   ```

## 📞 快速支持

- [ ] 查看 [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- [ ] 查看 [OPENROUTER_GUIDE.md](./OPENROUTER_GUIDE.md)
- [ ] 查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**测试完成时间**: __________  
**测试人员**: __________  
**测试结果**: ✅ 通过 / ❌ 失败

**备注**: ____________________