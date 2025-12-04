const axios = require('axios');

async function testAIEndpoints() {
  try {
    console.log('Testing AI Service endpoints...');
    
    // Test classify-task endpoint
    console.log('\n1. Testing classify-task endpoint:');
    const classifyResponse = await axios.post('http://localhost:3001/api/classify-task', {
      text: "完成项目报告",
      context: { user: "test", time: "2025-12-04" }
    });
    console.log('Classify response:', JSON.stringify(classifyResponse.data, null, 2));
    
    // Test suggest-priority endpoint
    console.log('\n2. Testing suggest-priority endpoint:');
    const priorityResponse = await axios.post('http://localhost:3001/api/suggest-priority', {
      task: "完成项目报告",
      context: { user: "test", time: "2025-12-04" }
    });
    console.log('Priority response:', JSON.stringify(priorityResponse.data, null, 2));
    
    // Test extract-tasks endpoint
    console.log('\n3. Testing extract-tasks endpoint:');
    const extractResponse = await axios.post('http://localhost:3001/api/extract-tasks', {
      text: "我需要完成项目报告，还要准备明天的会议"
    });
    console.log('Extract tasks response:', JSON.stringify(extractResponse.data, null, 2));
    
    // Test health endpoint
    console.log('\n4. Testing health endpoint:');
    const healthResponse = await axios.get('http://localhost:3001/api/health');
    console.log('Health response:', JSON.stringify(healthResponse.data, null, 2));
    
  } catch (error) {
    console.error('Test Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAIEndpoints();