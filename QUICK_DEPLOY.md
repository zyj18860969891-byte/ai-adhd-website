# 快速部署指南

## 一键部署脚本

使用我们提供的部署脚本快速完成部署：

```bash
# 1. 使脚本可执行
chmod +x scripts/deploy.sh

# 2. 运行部署脚本
./scripts/deploy.sh
```

## 手动部署步骤

如果脚本不可用，请按以下步骤操作：

### 1. 提交更改
```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "🚀 优化Docker构建以提高Railway部署成功率

- 添加重试机制和镜像源
- 优化内存使用和构建时间
- 创建简化版Dockerfile
- 更新Railway配置

🔧 修复Docker Hub 500错误和注册表访问问题"
```

### 2. 推送部署
```bash
# 推送到远程仓库
git push origin main
```

### 3. 监控部署
1. 访问 Railway 控制台
2. 查看构建日志
3. 等待部署完成

## 验证部署

部署完成后，验证以下内容：

### 健康检查
访问以下端点确认服务正常：
- `https://your-app.railway.app/api/health`
- `https://your-app.railway.app/api/ai/health`

### 功能测试
1. 创建新任务
2. 测试AI分类功能
3. 验证优先级建议
4. 检查通知功能

## 常见问题

### 构建失败
- 检查Dockerfile语法
- 确认环境变量已设置
- 尝试使用简化版Dockerfile

### 服务启动失败
- 检查日志中的错误信息
- 确认所有依赖服务正常
- 验证环境变量配置

### AI服务不可用
- 确认API密钥正确
- 检查AI服务URL配置
- 查看服务日志

## 获取帮助

如果遇到问题：
1. 查看构建日志
2. 检查应用日志
3. 参考故障排除文档
4. 联系技术支持