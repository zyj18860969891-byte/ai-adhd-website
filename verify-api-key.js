#!/usr/bin/env node

/**
 * API Key 配置验证脚本
 * 验证 OpenRouter API Key 是否正确配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔑 API Key 配置验证');
console.log('===================');

const expectedApiKey = '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';

// 验证结果
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, condition, message) {
  if (condition) {
    console.log(`✅ ${name}`);
    results.passed++;
    results.tests.push({ name, status: 'passed', message });
  } else {
    console.log(`❌ ${name}`);
    console.log(`   ${message}`);
    results.failed++;
    results.tests.push({ name, status: 'failed', message });
  }
}

// 1. 验证 .env 文件
console.log('\n📋 1. 环境变量文件验证');
test(
  '.env 文件存在',
  fs.existsSync('.env'),
  '.env 文件不存在'
);

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  test(
    'API Key 正确配置',
    envContent.includes(expectedApiKey),
    'API Key 未正确配置'
  );
  
  test(
    '模型配置正确',
    envContent.includes('qwen/qwen3-235b-a22b-2507'),
    '模型配置不正确'
  );
}

// 2. 验证 .env.example 文件
console.log('\n📋 2. 环境变量示例文件验证');
test(
  '.env.example 文件存在',
  fs.existsSync('.env.example'),
  '.env.example 文件不存在'
);

if (fs.existsSync('.env.example')) {
  const envExampleContent = fs.readFileSync('.env.example', 'utf8');
  
  test(
    '示例文件包含 API Key',
    envExampleContent.includes(expectedApiKey),
    '示例文件未包含 API Key'
  );
}

// 3. 验证 Docker Compose 配置
console.log('\n🐳 3. Docker Compose 配置验证');
test(
  'docker-compose.yml 存在',
  fs.existsSync('docker-compose.yml'),
  'docker-compose.yml 文件不存在'
);

if (fs.existsSync('docker-compose.yml')) {
  const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
  
  test(
    'Docker Compose 包含 API Key',
    dockerCompose.includes(expectedApiKey),
    'Docker Compose 未配置 API Key'
  );
  
  test(
    'AI 服务端口正确',
    dockerCompose.includes('3001:3001'),
    'AI 服务端口配置不正确'
  );
}

// 4. 验证 Railway 配置
console.log('\n🚂 4. Railway 配置验证');
test(
  'railway.toml 存在',
  fs.existsSync('railway.toml'),
  'railway.toml 文件不存在'
);

if (fs.existsSync('railway.toml')) {
  const railwayConfig = fs.readFileSync('railway.toml', 'utf8');
  
  test(
    'Railway 配置包含 API Key',
    railwayConfig.includes(expectedApiKey),
    'Railway 配置未包含 API Key'
  );
  
  test(
    'Railway 配置包含模型',
    railwayConfig.includes('qwen/qwen3-235b-a22b-2507'),
    'Railway 配置未包含模型'
  );
}

// 5. 验证 AI 服务配置
console.log('\n🤖 5. AI 服务配置验证');
test(
  'AI 服务文件存在',
  fs.existsSync('services/ai-service/index.js'),
  'AI 服务文件不存在'
);

if (fs.existsSync('services/ai-service/index.js')) {
  const aiServiceCode = fs.readFileSync('services/ai-service/index.js', 'utf8');
  
  test(
    'AI 服务使用 OpenRouter',
    aiServiceCode.includes('baseURL: "https://openrouter.ai/api/v1"'),
    'AI 服务未配置为使用 OpenRouter'
  );
  
  test(
    'AI 服务使用环境变量',
    aiServiceCode.includes('process.env.OPENROUTER_API_KEY'),
    'AI 服务未使用环境变量'
  );
}

// 6. 验证 MCP 配置
console.log('\n🔗 6. MCP 配置验证');
test(
  'MCP 配置文件存在',
  fs.existsSync('mcp-config.json'),
  'MCP 配置文件不存在'
);

if (fs.existsSync('mcp-config.json')) {
  try {
    const mcpConfig = JSON.parse(fs.readFileSync('mcp-config.json', 'utf8'));
    
    if (mcpConfig.mcp && mcpConfig.mcp.services && mcpConfig.mcp.services['ai-service']) {
      const aiService = mcpConfig.mcp.services['ai-service'];
      
      test(
        'MCP 配置使用 OpenRouter',
        aiService.aiProvider === 'OpenRouter',
        'MCP 配置未使用 OpenRouter'
      );
      
      test(
        'MCP 配置使用正确模型',
        aiService.model === 'qwen/qwen3-235b-a22b-2507',
        'MCP 配置未使用正确模型'
      );
    }
  } catch (error) {
    test('MCP 配置文件可解析', false, `JSON 解析错误: ${error.message}`);
  }
}

// 7. 验证文档
console.log('\n📚 7. 文档验证');
test(
  'README.md 存在',
  fs.existsSync('README.md'),
  'README.md 文件不存在'
);

test(
  'OPENROUTER_GUIDE.md 存在',
  fs.existsSync('OPENROUTER_GUIDE.md'),
  'OPENROUTER_GUIDE.md 文件不存在'
);

if (fs.existsSync('README.md')) {
  const readmeContent = fs.readFileSync('README.md', 'utf8');
  
  test(
    'README.md 包含 API Key 说明',
    readmeContent.includes('已预配置'),
    'README.md 未说明 API Key 已配置'
  );
}

// 输出验证结果
console.log('\n📊 API Key 配置验证结果');
console.log('========================');
console.log(`✅ 通过: ${results.passed}`);
console.log(`❌ 失败: ${results.failed}`);
console.log(`📈 总计: ${results.passed + results.failed}`);

const successRate = Math.round((results.passed / (results.passed + results.failed)) * 100);
console.log(`🎯 成功率: ${successRate}%`);

if (results.failed === 0) {
  console.log('\n🎉 所有 API Key 配置验证通过！');
  console.log('\n📝 配置摘要：');
  console.log(`- API Key: ${expectedApiKey}`);
  console.log('- 模型: qwen/qwen3-235b-a22b-2507');
  console.log('- 支持平台: Docker, Railway, Vercel');
  console.log('\n🚀 您可以开始使用项目了！');
  process.exit(0);
} else {
  console.log('\n❌ 发现配置问题，请检查上述失败的验证项');
  process.exit(1);
}