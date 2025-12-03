#!/usr/bin/env node

/**
 * OpenRouter 配置检查脚本
 * 检查 OpenRouter 和 JWT_SECRET 配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 OpenRouter 配置检查');
console.log('=====================');

// 检查结果
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function test(name, condition, message, type = 'error') {
  if (condition) {
    console.log(`✅ ${name}`);
    results.passed++;
    results.tests.push({ name, status: 'passed', message });
  } else {
    if (type === 'warning') {
      console.log(`⚠️  ${name}`);
      console.log(`   ${message}`);
      results.warnings++;
      results.tests.push({ name, status: 'warning', message });
    } else {
      console.log(`❌ ${name}`);
      console.log(`   ${message}`);
      results.failed++;
      results.tests.push({ name, status: 'failed', message });
    }
  }
}

// 1. 检查环境变量文件
console.log('\n📋 1. 环境变量文件检查');
test(
  '.env.example 存在',
  fs.existsSync('.env.example'),
  '环境变量示例文件不存在'
);

if (fs.existsSync('.env.example')) {
  const envContent = fs.readFileSync('.env.example', 'utf8');
  
  test(
    '包含 OPENROUTER_API_KEY',
    envContent.includes('OPENROUTER_API_KEY'),
    '缺少 OPENROUTER_API_KEY 配置'
  );
  
  test(
    '包含 OPENROUTER_MODEL',
    envContent.includes('OPENROUTER_MODEL'),
    '缺少 OPENROUTER_MODEL 配置'
  );
  
  test(
    '包含 JWT_SECRET',
    envContent.includes('JWT_SECRET'),
    '缺少 JWT_SECRET 配置'
  );
  
  test(
    '使用正确的模型',
    envContent.includes('qwen/qwen3-235b-a22b-2507'),
    '模型配置不正确，应使用 qwen/qwen3-235b-a22b-2507'
  );
}

// 2. 检查 AI 服务配置
console.log('\n🤖 2. AI 服务配置检查');
test(
  'AI 服务使用 OpenRouter',
  fs.existsSync('services/ai-service/index.js'),
  'AI 服务文件不存在'
);

if (fs.existsSync('services/ai-service/index.js')) {
  const aiServiceCode = fs.readFileSync('services/ai-service/index.js', 'utf8');
  
  test(
    '初始化 OpenRouter',
    aiServiceCode.includes('baseURL: "https://openrouter.ai/api/v1"'),
    'AI 服务未配置为使用 OpenRouter'
  );
  
  test(
    '使用 OPENROUTER_MODEL',
    aiServiceCode.includes('process.env.OPENROUTER_MODEL'),
    '未使用 OPENROUTER_MODEL 环境变量'
  );
  
  test(
    '包含 HTTP-Referer 头',
    aiServiceCode.includes('HTTP-Referer'),
    '缺少 HTTP-Referer 头配置'
  );
  
  test(
    '包含 X-Title 头',
    aiServiceCode.includes('X-Title'),
    '缺少 X-Title 头配置'
  );
}

// 3. 检查 MCP 配置
console.log('\n🔗 3. MCP 配置检查');
test(
  'MCP 配置使用 OpenRouter',
  fs.existsSync('mcp-config.json'),
  'MCP 配置文件不存在'
);

if (fs.existsSync('mcp-config.json')) {
  try {
    const mcpConfig = JSON.parse(fs.readFileSync('mcp-config.json', 'utf8'));
    
    if (mcpConfig.mcp && mcpConfig.mcp.services && mcpConfig.mcp.services['ai-service']) {
      const aiService = mcpConfig.mcp.services['ai-service'];
      
      test(
        'AI 提供商为 OpenRouter',
        aiService.aiProvider === 'OpenRouter',
        'MCP 配置中 AI 提供商未设置为 OpenRouter'
      );
      
      test(
        '模型配置正确',
        aiService.model === 'qwen/qwen3-235b-a22b-2507',
        'MCP 配置中模型未设置为 qwen/qwen3-235b-a22b-2507'
      );
    }
  } catch (error) {
    test('MCP 配置文件可解析', false, `JSON 解析错误: ${error.message}`);
  }
}

// 4. 检查部署配置
console.log('\n🚀 4. 部署配置检查');

// Docker Compose
test(
  'Docker Compose 使用 OpenRouter',
  fs.existsSync('docker-compose.yml'),
  'Docker Compose 文件不存在'
);

if (fs.existsSync('docker-compose.yml')) {
  const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
  
  test(
    'AI 服务使用 OPENROUTER_API_KEY',
    dockerCompose.includes('OPENROUTER_API_KEY'),
    'Docker Compose 中未配置 OPENROUTER_API_KEY'
  );
  
  test(
    'AI 服务使用正确的模型',
    dockerCompose.includes('qwen/qwen3-235b-a22b-2507'),
    'Docker Compose 中模型配置不正确'
  );
}

// Railway
test(
  'Railway 配置存在',
  fs.existsSync('railway.toml'),
  'Railway 配置文件不存在'
);

if (fs.existsSync('railway.toml')) {
  const railwayConfig = fs.readFileSync('railway.toml', 'utf8');
  
  test(
    '包含 OPENROUTER_API_KEY',
    railwayConfig.includes('OPENROUTER_API_KEY'),
    'Railway 配置中缺少 OPENROUTER_API_KEY'
  );
  
  test(
    '包含 OPENROUTER_MODEL',
    railwayConfig.includes('OPENROUTER_MODEL'),
    'Railway 配置中缺少 OPENROUTER_MODEL'
  );
}

// 5. 检查文档
console.log('\n📚 5. 文档检查');
test(
  'OpenRouter 指南存在',
  fs.existsSync('OPENROUTER_GUIDE.md'),
  'OpenRouter 配置指南不存在'
);

test(
  'README.md 包含 JWT_SECRET 说明',
  fs.existsSync('README.md'),
  'README.md 文件不存在'
);

if (fs.existsSync('README.md')) {
  const readmeContent = fs.readFileSync('README.md', 'utf8');
  
  test(
    'README.md 包含 JWT_SECRET 说明',
    readmeContent.includes('JWT_SECRET'),
    'README.md 中缺少 JWT_SECRET 说明'
  );
  
  test(
    'README.md 包含 OpenRouter 配置',
    readmeContent.includes('OPENROUTER_API_KEY'),
    'README.md 中缺少 OpenRouter 配置说明'
  );
}

// 6. 检查 .env 文件（如果存在）
console.log('\n⚙️  6. 环境配置检查（可选）');
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  test(
    'OPENROUTER_API_KEY 已配置',
    envContent.includes('OPENROUTER_API_KEY=') && !envContent.includes('your_openrouter_api_key_here'),
    'OPENROUTER_API_KEY 未配置或使用默认值',
    'warning'
  );
  
  test(
    'OPENROUTER_MODEL 已配置',
    envContent.includes('OPENROUTER_MODEL=qwen/qwen3-235b-a22b-2507'),
    'OPENROUTER_MODEL 未正确配置'
  );
  
  test(
    'JWT_SECRET 已配置',
    envContent.includes('JWT_SECRET=') && !envContent.includes('your_jwt_secret_key_here'),
    'JWT_SECRET 未配置或使用默认值',
    'warning'
  );
  
  // 检查 JWT_SECRET 长度
  const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
  if (jwtSecretMatch && jwtSecretMatch[1]) {
    const jwtSecret = jwtSecretMatch[1].trim();
    test(
      'JWT_SECRET 长度足够',
      jwtSecret.length >= 32,
      `JWT_SECRET 长度只有 ${jwtSecret.length} 字符，建议至少 32 字符`,
      'warning'
    );
  }
} else {
  test(
    '.env 文件存在（可选）',
    false,
    '建议创建 .env 文件并配置实际的 API 密钥和 JWT_SECRET',
    'warning'
  );
}

// 输出测试结果
console.log('\n📊 配置检查结果');
console.log('================');
console.log(`✅ 通过: ${results.passed}`);
console.log(`⚠️  警告: ${results.warnings}`);
console.log(`❌ 失败: ${results.failed}`);
console.log(`📈 总计: ${results.passed + results.failed + results.warnings}`);

const successRate = Math.round((results.passed / (results.passed + results.failed)) * 100);
console.log(`🎯 成功率: ${successRate}%`);

if (results.failed === 0) {
  console.log('\n🎉 所有必需配置检查通过！');
  if (results.warnings > 0) {
    console.log(`⚠️  发现 ${results.warnings} 个警告，请注意查看。`);
  }
  console.log('\n📝 下一步：');
  console.log('1. 创建 .env 文件：cp .env.example .env');
  console.log('2. 配置 OPENROUTER_API_KEY');
  console.log('3. 配置 JWT_SECRET（建议至少 32 字符）');
  console.log('4. 运行 npm run dev 启动开发服务器');
  process.exit(0);
} else {
  console.log('\n❌ 发现问题，请检查上述失败的配置项');
  process.exit(1);
}