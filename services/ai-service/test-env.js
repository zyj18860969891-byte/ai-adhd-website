#!/usr/bin/env node

/**
 * Test environment variables for AI service
 */

console.log('🔍 AI Service Environment Variables Test');
console.log('=====================================');

// 模拟Railway环境
console.log('\n📋 Testing Environment Variables:');

// 测试关键变量
const testVars = [
  'OPENROUTER_API_KEY',
  'OPENAI_API_KEY', 
  'OPENROUTER_MODEL',
  'NODE_ENV',
  'PORT'
];

testVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? 'Set' : 'Not set'}`);
  if (value) {
    // 只显示API密钥的前几个字符，避免泄露
    if (varName.includes('API_KEY')) {
      console.log(`  Value: ${value.substring(0, 10)}...${value.substring(value.length - 10)}`);
    } else {
      console.log(`  Value: ${value}`);
    }
  }
});

// 测试OpenAI客户端
console.log('\n🤖 Testing OpenAI Client:');
try {
  const { OpenAI } = require('openai');
  
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/your-username/ai-adhd-website',
      'X-Title': 'ADHD Task Manager'
    }
  });

  console.log('✅ OpenAI client created successfully');
  console.log(`   Base URL: ${openai.baseURL}`);
  console.log(`   API Key set: ${!!(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY)}`);
  
} catch (error) {
  console.log(`❌ OpenAI client creation failed: ${error.message}`);
}

// 测试API连接
console.log('\n🌐 Testing API Connection:');
try {
  // 这是一个简单的测试，不会实际调用API
  if (process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY) {
    console.log('✅ API credentials are available');
    console.log('✅ Service should be able to connect to OpenRouter/OpenAI');
  } else {
    console.log('❌ No API credentials found');
    console.log('❌ Service will not be able to connect to AI services');
  }
} catch (error) {
  console.log(`❌ API connection test failed: ${error.message}`);
}

console.log('\n📊 Test Summary:');
const hasApiKeys = !!(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
const hasModel = !!process.env.OPENROUTER_MODEL;
const hasEnv = !!process.env.NODE_ENV;

console.log(`API Keys Available: ${hasApiKeys ? '✅' : '❌'}`);
console.log(`Model Configured: ${hasModel ? '✅' : '❌'}`);
console.log(`Environment Set: ${hasEnv ? '✅' : '❌'}`);

if (hasApiKeys && hasModel && hasEnv) {
  console.log('\n🎉 All tests passed! AI service should work correctly.');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please check environment variables.');
  console.log('\n🔧 Required variables:');
  if (!hasApiKeys) console.log('   - OPENROUTER_API_KEY or OPENAI_API_KEY');
  if (!hasModel) console.log('   - OPENROUTER_MODEL');
  if (!hasEnv) console.log('   - NODE_ENV');
  process.exit(1);
}