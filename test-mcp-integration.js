#!/usr/bin/env node

/**
 * MCP 服务集成测试脚本
 * 测试所有 MCP 服务是否正确配置和集成
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 MCP 服务集成测试');
console.log('===================');

// 测试结果
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

// 1. 检查 MCP 配置文件
console.log('\n📋 1. MCP 配置文件检查');
test(
  'mcp-config.json 存在',
  fs.existsSync('mcp-config.json'),
  'MCP 配置文件不存在'
);

if (fs.existsSync('mcp-config.json')) {
  try {
    const mcpConfig = JSON.parse(fs.readFileSync('mcp-config.json', 'utf8'));
    
    test(
      'MCP 配置格式正确',
      typeof mcpConfig === 'object' && mcpConfig.mcp,
      'MCP 配置格式无效'
    );
    
    if (mcpConfig.mcp && mcpConfig.mcp.services && mcpConfig.mcp.services['ai-service']) {
      const aiService = mcpConfig.mcp.services['ai-service'];
      
      test(
        'AI 服务配置完整',
        aiService.name && aiService.port && aiService.tools,
        'AI 服务配置不完整'
      );
      
      test(
        'AI 工具配置正确',
        Array.isArray(aiService.tools) && aiService.tools.length === 4,
        'AI 工具数量不正确'
      );
      
      const expectedTools = ['classify-task', 'transcribe-audio', 'suggest-priority', 'extract-tasks'];
      const hasAllTools = expectedTools.every(tool => aiService.tools.includes(tool));
      
      test(
        '包含所有必需的 AI 工具',
        hasAllTools,
        `缺少工具: ${expectedTools.filter(t => !aiService.tools.includes(t)).join(', ')}`
      );
      
      test(
        'AI 提供商配置',
        aiService.aiProvider === 'OpenAI',
        'AI 提供商未配置为 OpenAI'
      );
      
      test(
        '模型配置',
        aiService.model === 'gpt-3.5-turbo',
        '模型未配置为 gpt-3.5-turbo'
      );
      
      test(
        '会话管理启用',
        aiService.sessionManagement && aiService.sessionManagement.enabled,
        '会话管理未启用'
      );
    }
  } catch (error) {
    test('MCP 配置文件可解析', false, `JSON 解析错误: ${error.message}`);
  }
}

// 2. 检查 AI 服务
console.log('\n🤖 2. AI 服务检查');
test(
  'AI 服务目录存在',
  fs.existsSync('services/ai-service'),
  'AI 服务目录不存在'
);

if (fs.existsSync('services/ai-service')) {
  test(
    'AI 服务入口文件存在',
    fs.existsSync('services/ai-service/index.js'),
    'AI 服务入口文件不存在'
  );
  
  test(
    'AI 服务 package.json 存在',
    fs.existsSync('services/ai-service/package.json'),
    'AI 服务 package.json 不存在'
  );
  
  if (fs.existsSync('services/ai-service/index.js')) {
    const aiServiceCode = fs.readFileSync('services/ai-service/index.js', 'utf8');
    
    test(
      '包含 classify-task 端点',
      aiServiceCode.includes('/api/classify-task'),
      '缺少 classify-task 端点'
    );
    
    test(
      '包含 transcribe-audio 端点',
      aiServiceCode.includes('/api/transcribe'),
      '缺少 transcribe-audio 端点'
    );
    
    test(
      '包含 suggest-priority 端点',
      aiServiceCode.includes('/api/suggest-priority'),
      '缺少 suggest-priority 端点'
    );
    
    test(
      '包含 extract-tasks 端点',
      aiServiceCode.includes('/api/extract-tasks'),
      '缺少 extract-tasks 端点'
    );
    
    test(
      '包含 OpenAI 初始化',
      aiServiceCode.includes('new OpenAI'),
      '缺少 OpenAI 初始化'
    );
    
    test(
      '包含 WebSocket 支持',
      aiServiceCode.includes('WebSocket.Server'),
      '缺少 WebSocket 支持'
    );
  }
}

// 3. 检查 Docker 配置
console.log('\n🐳 3. Docker 配置检查');
test(
  'docker-compose.yml 存在',
  fs.existsSync('docker-compose.yml'),
  'Docker Compose 文件不存在'
);

if (fs.existsSync('docker-compose.yml')) {
  const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
  
  test(
    '包含 AI 服务配置',
    dockerCompose.includes('ai-service'),
    'Docker Compose 中缺少 AI 服务'
  );
  
  test(
    'AI 服务端口映射',
    dockerCompose.includes('3001:3001'),
    'AI 服务端口映射不正确'
  );
  
  test(
    'AI 服务环境变量',
    dockerCompose.includes('OPENAI_API_KEY'),
    'AI 服务缺少环境变量配置'
  );
}

// 4. 检查部署配置
console.log('\n🚀 4. 部署配置检查');
test(
  'Vercel 配置存在',
  fs.existsSync('client/vercel.json'),
  'Vercel 配置文件不存在'
);

test(
  'Railway 配置存在',
  fs.existsSync('railway.toml'),
  'Railway 配置文件不存在'
);

if (fs.existsSync('client/vercel.json')) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('client/vercel.json', 'utf8'));
    
    test(
      'Vercel API 代理配置',
      vercelConfig.routes && vercelConfig.routes.some(r => r.src === '/api/services/(.*)'),
      'Vercel API 代理配置不正确'
    );
  } catch (error) {
    test('Vercel 配置文件可解析', false, `JSON 解析错误: ${error.message}`);
  }
}

// 5. 检查文档
console.log('\n📚 5. 文档检查');
test(
  'MCP 服务指南存在',
  fs.existsSync('MCP_SERVICES_GUIDE.md'),
  'MCP 服务指南不存在'
);

test(
  '部署指南存在',
  fs.existsSync('DEPLOYMENT.md'),
  '部署指南不存在'
);

// 6. 检查任务进度文件
console.log('\n📊 6. 任务进度检查');
test(
  'task-progress.json 存在',
  fs.existsSync('task-progress.json'),
  '任务进度文件不存在'
);

if (fs.existsSync('task-progress.json')) {
  try {
    const taskProgress = JSON.parse(fs.readFileSync('task-progress.json', 'utf8'));
    
    test(
      '包含 MCP 集成状态',
      taskProgress.deployment && taskProgress.deployment.mcpIntegration,
      '任务进度中缺少 MCP 集成状态'
    );
    
    if (taskProgress.deployment && taskProgress.deployment.mcpIntegration) {
      test(
        'MCP 状态为 implemented',
        taskProgress.deployment.mcpIntegration.status === 'implemented',
        'MCP 状态未设置为 implemented'
      );
      
      test(
        '包含 AI 工具列表',
        Array.isArray(taskProgress.deployment.mcpIntegration.tools),
        '缺少 AI 工具列表'
      );
    }
  } catch (error) {
    test('任务进度文件可解析', false, `JSON 解析错误: ${error.message}`);
  }
}

// 输出测试结果
console.log('\n📊 测试结果');
console.log('===========');
console.log(`✅ 通过: ${results.passed}`);
console.log(`❌ 失败: ${results.failed}`);
console.log(`📈 总计: ${results.passed + results.failed}`);

const successRate = Math.round((results.passed / (results.passed + results.failed)) * 100);
console.log(`🎯 成功率: ${successRate}%`);

if (results.failed === 0) {
  console.log('\n🎉 所有测试通过！MCP 服务已正确集成');
  process.exit(0);
} else {
  console.log('\n⚠️  发现问题，请检查上述失败的测试项');
  process.exit(1);
}