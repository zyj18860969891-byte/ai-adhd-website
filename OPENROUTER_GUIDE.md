# 🤖 OpenRouter 配置指南

## 概述

本项目使用 OpenRouter 作为 AI 模型提供商，替换了原来的 OpenAI。OpenRouter 是一个统一的 AI 模型 API 平台，支持多种模型，包括 Qwen 等。

## 配置步骤

### 1. 获取 OpenRouter API 密钥

1. 访问 [OpenRouter 官网](https://openrouter.ai)
2. 注册账号并登录
3. 进入 [API Keys](https://openrouter.ai/keys) 页面
4. 点击 "Create new key" 生成新的 API 密钥
5. 复制密钥并保存（只显示一次）

**注意**: 项目已预配置 API 密钥，但建议在生产环境使用时替换为您的个人 API Key。

### 2. 配置环境变量

在 `.env` 文件中设置：

```env
# AI Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507
```

### 3. 模型选择

当前项目使用的是 **Qwen3-235B-A22B-2507** 模型：

- **模型 ID**: `qwen/qwen3-235b-a22b-2507`
- **提供商**: Alibaba Cloud
- **特点**: 
  - 强大的中文理解能力
  - 支持长文本处理
  - 性价比高

### 4. 其他可用模型

如果您想使用其他模型，可以参考以下选项：

```env
# 通义千问系列
OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507
OPENROUTER_MODEL=qwen/qwen3-32b-a22b-2507

# 其他模型
OPENROUTER_MODEL=openai/gpt-3.5-turbo
OPENROUTER_MODEL=openai/gpt-4
OPENROUTER_MODEL=anthropic/claude-3-sonnet
OPENROUTER_MODEL=google/gemini-pro
```

## JWT_SECRET 配置

### 为什么需要 JWT_SECRET？

JWT_SECRET 用于：
- JWT token 的签名和验证
- 用户会话安全
- API 请求认证
- 防止 CSRF 攻击

### 如何生成安全的 JWT_SECRET？

1. **使用在线工具生成随机字符串**：
   - [RandomKeygen](https://randomkeygen.com/)
   - [All Keys](https://allkeysgenerator.com/)

2. **使用命令行生成**：
   ```bash
   # Linux/Mac
   openssl rand -base64 32
   
   # Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. **手动创建**：
   - 至少 32 个字符
   - 包含大小写字母、数字、特殊字符
   - 不要使用容易猜测的字符串

### JWT_SECRET 配置示例

```env
# Security
JWT_SECRET=your_jwt_secret_key_here
# 示例（请使用您自己的随机字符串）：
# JWT_SECRET=K8mP9nQ2rT5wX7zA1cE4fG7jM3pS6vY9bD6gJ8qN2uR5tW8yZ3cF7iK0nS4vX9
```

## 部署配置

### Docker 部署

在 `docker-compose.yml` 中，确保环境变量正确：

```yaml
ai-service:
  environment:
    - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    - OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507
```

### Railway 部署

在 Railway 项目设置中添加环境变量：

```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507
JWT_SECRET=your_jwt_secret_here
```

### Vercel 部署

在 Vercel 项目设置中添加环境变量：

```env
REACT_APP_API_BASE_URL=https://your-backend.up.railway.app/api
```

## 测试配置

### 1. 检查环境变量

```bash
# 检查环境变量是否正确设置
echo $OPENROUTER_API_KEY
echo $OPENROUTER_MODEL
echo $JWT_SECRET
```

### 2. 测试 AI 服务

启动服务后，访问：

```
http://localhost:3001/api/health
```

应该返回：

```json
{
  "status": "healthy",
  "lastCheck": "2025-12-03T10:00:00Z",
  "version": "1.0.0"
}
```

### 3. 测试 AI 工具

使用 curl 测试分类功能：

```bash
curl -X POST http://localhost:3001/api/classify-task \
  -H "Content-Type: application/json" \
  -d '{
    "text": "需要完成项目报告并发送给客户",
    "context": {}
  }'
```

预期返回：

```json
{
  "category": "工作",
  "confidence": 0.9,
  "reasoning": "任务涉及项目报告和客户沟通，属于工作范畴",
  "suggestedTags": ["项目", "报告", "客户"]
}
```

## 常见问题

### 1. API 密钥无效

**问题**: 返回 401 错误

**解决**:
- 检查 `OPENROUTER_API_KEY` 是否正确
- 确认密钥没有过期
- 重新生成 API 密钥

### 2. 模型不可用

**问题**: 返回 404 或模型错误

**解决**:
- 检查 `OPENROUTER_MODEL` 配置
- 确认模型在 OpenRouter 中可用
- 尝试使用其他模型

### 3. JWT 认证失败

**问题**: API 请求返回 401

**解决**:
- 检查 `JWT_SECRET` 是否设置
- 确认 JWT token 格式正确
- 重新生成 JWT_SECRET

### 4. 配额超限

**问题**: 返回 429 错误

**解决**:
- 检查 OpenRouter 账户配额
- 升级账户或减少 API 调用
- 实现请求限流

## 性能优化

### 1. 模型选择

- **Qwen3-235B**: 性能最好，价格较高
- **Qwen3-32B**: 性能良好，性价比高
- **GPT-3.5-Turbo**: 价格便宜，响应快

### 2. 请求优化

- 减少不必要的 API 调用
- 实现请求缓存
- 使用批量处理

### 3. 错误处理

- 实现重试机制
- 添加降级策略
- 监控 API 使用情况

## 安全建议

1. **API 密钥安全**
   - 不要在代码中硬编码 API 密钥
   - 使用环境变量管理
   - 定期更换密钥

2. **JWT 安全**
   - 使用强密钥
   - 设置合理的过期时间
   - 实现 token 刷新机制

3. **数据安全**
   - 不要在日志中记录敏感信息
   - 使用 HTTPS
   - 实现 CORS 白名单

## 参考资源

- [OpenRouter 官方文档](https://openrouter.ai/docs)
- [Qwen 模型文档](https://qwenlm.github.io/)
- [JWT 最佳实践](https://auth0.com/docs/secure/tokens/json-web-tokens)
- [API 安全指南](https://owasp.org/www-project-api-security/)

---

**注意**: 请确保妥善保管您的 API 密钥和 JWT_SECRET，不要在公共代码仓库中暴露。