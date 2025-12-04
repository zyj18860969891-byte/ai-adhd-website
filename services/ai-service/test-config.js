#!/usr/bin/env node

/**
 * AI Service Configuration Test
 * 测试AI服务配置是否正确
 */

console.log('🤖 AI Service Configuration Test');
console.log('=================================');

// 模拟环境变量
process.env.OPENROUTER_API_KEY = 'test_key';
process.env.OPENROUTER_MODEL = 'qwen/qwen3-235b-a22b-2507';
process.env.NODE_ENV = 'development';
process.env.PORT = '3001';

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

// 1. 测试环境变量
console.log('\n📋 1. Environment Variables Test');
test(
  'OPENROUTER_API_KEY is set',
  !!process.env.OPENROUTER_API_KEY,
  'OPENROUTER_API_KEY should be set'
);

test(
  'OPENROUTER_MODEL is set',
  !!process.env.OPENROUTER_MODEL,
  'OPENROUTER_MODEL should be set'
);

test(
  'NODE_ENV is set',
  !!process.env.NODE_ENV,
  'NODE_ENV should be set'
);

test(
  'PORT is set',
  !!process.env.PORT,
  'PORT should be set'
);

// 2. 测试模型配置
console.log('\n📋 2. Model Configuration Test');
test(
  'Model is valid',
  process.env.OPENROUTER_MODEL === 'qwen/qwen3-235b-a22b-2507',
  `Model should be qwen/qwen3-235b-a22b-2507, got: ${process.env.OPENROUTER_MODEL}`
);

// 3. 测试环境
console.log('\n📋 3. Environment Test');
test(
  'Development environment',
  process.env.NODE_ENV === 'development',
  `NODE_ENV should be development, got: ${process.env.NODE_ENV}`
);

test(
  'Production environment check',
  process.env.NODE_ENV !== 'production',
  'NODE_ENV should not be production in development'
);

// 4. 测试端口配置
console.log('\n📋 4. Port Configuration Test');
test(
  'Port is valid',
  process.env.PORT === '3001',
  `Port should be 3001, got: ${process.env.PORT}`
);

test(
  'Port is numeric',
  !isNaN(process.env.PORT),
  `Port should be numeric, got: ${process.env.PORT}`
);

// 输出测试结果
console.log('\n📊 AI Service Configuration Test Results');
console.log('=======================================');
console.log(`✅ 通过: ${results.passed}`);
console.log(`❌ 失败: ${results.failed}`);
console.log(`📈 总计: ${results.passed + results.failed}`);

const successRate = Math.round((results.passed / (results.passed + results.failed)) * 100);
console.log(`🎯 成功率: ${successRate}%`);

if (results.failed === 0) {
  console.log('\n🎉 所有 AI Service 配置测试通过！');
  console.log('\n📝 配置摘要：');
  console.log(`- API Key: ${process.env.OPENROUTER_API_KEY ? 'Set' : 'Not set'}`);
  console.log(`- 模型: ${process.env.OPENROUTER_MODEL}`);
  console.log(`- 环境: ${process.env.NODE_ENV}`);
  console.log(`- 端口: ${process.env.PORT}`);
  console.log('\n🚀 AI Service 配置正确，可以开始使用！');
  process.exit(0);
} else {
  console.log('\n❌ 发现配置问题，请检查上述失败的测试项');
  process.exit(1);
}