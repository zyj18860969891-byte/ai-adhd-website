# 部署前检查清单

## ✅ 已完成的配置

### 1. AI服务配置
- [x] API密钥已更新为新的OpenRouter密钥
- [x] 所有端点已实现并测试通过
- [x] 环境变量配置正确
- [x] 错误处理机制完善
- [x] 中文支持完全正常

### 2. Railway配置
- [x] railway.toml已更新API密钥
- [x] 所有服务端口配置正确
- [x] 环境变量设置正确

### 3. 服务依赖
- [x] AI服务依赖已安装
- [x] 数据库服务依赖已安装
- [x] 通知服务依赖已安装
- [x] 根目录依赖已安装

### 4. 环境变量文件
- [x] AI服务.env文件存在
- [x] 数据库服务.env文件已创建
- [x] 通知服务.env文件已创建

### 5. 部署配置
- [x] Vercel配置已设置
- [x] API代理配置正确
- [x] 前端构建配置正确

## 🚀 部署步骤

### 1. 推送代码到GitHub
```bash
git add .
git commit -m "feat: 完成AI服务修复和功能增强"
git push origin main
```

### 2. Railway部署
1. 登录Railway控制台
2. 确保GitHub仓库已连接
3. 点击"Deploy"按钮
4. 等待部署完成

### 3. 验证部署
1. 检查所有服务状态
2. 测试AI服务端点
3. 验证API连接
4. 测试前端功能

## 🔧 需要验证的端点

### AI服务端点 (Railway域名)
- [ ] `GET /api/health` - 健康检查
- [ ] `POST /api/classify-task` - 任务分类
- [ ] `POST /api/suggest-priority` - 优先级建议
- [ ] `POST /api/extract-tasks` - 任务提取
- [ ] `POST /api/improve-task` - 任务改进
- [ ] `POST /api/estimate-time` - 时间估计

### 前端端点 (Vercel)
- [ ] 主页加载正常
- [ ] PWA功能正常
- [ ] API连接正常

## 📋 环境变量验证

### Railway环境变量
- [ ] `NODE_ENV=production`
- [ ] `OPENROUTER_API_KEY=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`
- [ ] `OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507`
- [ ] `JWT_SECRET=your_strong_jwt_secret_here_change_this`
- [ ] `DB_PATH=./data/tasks.db`

### Vercel环境变量
- [ ] `VITE_API_BASE_URL=https://ai-adhd-website-production.up.railway.app`
- [ ] `VITE_WS_URL=wss://ai-adhd-website-production.up.railway.app`

## 🎯 预期结果

部署成功后，应该能够：
1. ✅ 所有微服务正常运行
2. ✅ AI服务所有端点响应正常
3. ✅ 前端PWA正常访问
4. ✅ 任务管理功能完整可用
5. ✅ 中文显示正常
6. ✅ API调用无错误

## 📝 注意事项

1. **API密钥**：确保新的OpenRouter API密钥已正确配置
2. **数据库**：首次部署会自动创建数据库
3. **域名**：Railway会分配随机域名，可在设置中自定义
4. **监控**：部署后检查Railway仪表板的日志和监控

## 🔍 故障排除

如果部署失败，检查：
1. GitHub代码是否最新
2. Railway环境变量是否正确
3. 依赖是否安装正确
4. 端口配置是否正确
5. API密钥是否有效

---

**状态**: ✅ 准备就绪，可以部署
**最后更新**: 2025年12月5日