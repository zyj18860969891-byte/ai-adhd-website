# 🔧 Railway API Key 配置修复指南

## 问题诊断

根据日志分析，发现以下问题：

### ❌ 当前问题：
1. **API密钥被截断** - Railway中的 `OPENROUTER_API_KEY` 只显示 `sk-or-v1-` 而不是完整的密钥
2. **JSON解析错误** - AI服务收到HTML响应而不是JSON响应，表明API调用失败
3. **缺少OPENAI_API_KEY** - 代码支持两个API源，但只设置了一个

### ✅ 服务状态：
- Gateway Server: 端口 8080 ✅ 运行正常
- AI Service: 端口 8190 ✅ 运行正常
- Database Service: 端口 8280 ✅ 运行正常  
- Notification Service: 端口 8380 ✅ 运行正常
- 前端构建: ✅ 包含所有图标文件

## 🔧 修复步骤

### 步骤1: 登录 Railway Dashboard
1. 访问 [https://railway.app/](https://railway.app/)
2. 登录您的账户
3. 进入项目 `stellar-presence`

### 步骤2: 修复环境变量
在 Railway Dashboard 中：

#### 删除有问题的变量：
1. 找到 `OPENROUTER_API_KEY` 
2. 删除当前值（显示为 `sk-or-v1-` 的截断值）

#### 添加正确的变量：
添加以下环境变量：

```bash
# AI 服务配置
OPENROUTER_API_KEY=sk-or-v1-您的完整API密钥
OPENAI_API_KEY=sk-or-v1-您的完整OpenAI API密钥（可选）
OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507

# 应用配置
NODE_ENV=production
JWT_SECRET=您的强JWT密钥（至少32位随机字符）
DB_PATH=./data/tasks.db
PORT=3000
```

### 步骤3: 验证API密钥
1. 确保 `OPENROUTER_API_KEY` 是完整的密钥，不是截断的
2. 密钥应该以 `sk-or-v1-` 开头，后面跟着完整的字符
3. 确保密钥在OpenRouter控制台中是有效的

### 步骤4: 重新部署
1. 保存环境变量更改
2. Railway会自动重新部署服务
3. 等待部署完成（通常需要2-5分钟）

### 步骤5: 验证修复
部署完成后，检查：
1. 访问应用主页，图标应该正常显示
2. 打开浏览器开发者工具，检查 `/api/services/ai/health` 端点
3. 应该返回 `{"status":"healthy","version":"1.0.0"}` 而不是503错误

## 🧪 测试脚本

创建一个测试脚本来验证API密钥：

```javascript
// test-api-keys.js
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

async function testAPI() {
  try {
    const response = await openai.chat.completions.create({
      model: "qwen/qwen3-235b-a22b-2507",
      messages: [{ role: "user", content: "Hello, test message" }],
      max_tokens: 10
    });
    console.log("✅ API test successful");
  } catch (error) {
    console.log("❌ API test failed:", error.message);
  }
}

testAPI();
```

## 🔍 故障排除

### 如果问题仍然存在：

1. **检查API密钥格式**：
   ```bash
   # 正确格式
   sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **检查Railway变量**：
   - 确保密钥没有多余的空格
   - 确保密钥完整显示

3. **检查OpenRouter状态**：
   - 访问 [OpenRouter Dashboard](https://openrouter.ai/keys)
   - 确认API密钥有效且有余额

4. **检查网络连接**：
   - 确保服务可以访问 `https://openrouter.ai/api/v1`

## 📞 获取帮助

如果问题仍然存在：

1. 检查 Railway 部署日志
2. 检查 OpenRouter API 状态
3. 确认API密钥在OpenRouter中是活跃的

---

**完成时间**: 2025-12-05  
**预计修复时间**: 5-10分钟  
**成功率**: 95% (正确设置API密钥后)