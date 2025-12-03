const axios = require('axios');

async function testServices() {
  console.log('Testing services...\n');
  
  // Test main server
  try {
    const mainResponse = await axios.get('http://localhost:3000/api/health');
    console.log('✅ Main Server:', mainResponse.data);
  } catch (error) {
    console.log('❌ Main Server Error:', error.message);
  }
  
  // Test AI service
  try {
    const aiResponse = await axios.get('http://localhost:3001/api/health');
    console.log('✅ AI Service:', aiResponse.data);
  } catch (error) {
    console.log('❌ AI Service Error:', error.message);
  }
  
  // Test database service directly
  try {
    const dbResponse = await axios.get('http://localhost:3002/api/health');
    console.log('✅ Database Service:', dbResponse.data);
  } catch (error) {
    console.log('❌ Database Service Error:', error.message);
  }
  
  // Test notification service directly
  try {
    const notifResponse = await axios.get('http://localhost:3003/api/health');
    console.log('✅ Notification Service:', notifResponse.data);
  } catch (error) {
    console.log('❌ Notification Service Error:', error.message);
  }
  
  // Test database service through main server proxy
  try {
    const proxyResponse = await axios.get('http://localhost:3000/api/services/db/health');
    console.log('✅ Database Service (via proxy):', proxyResponse.data);
  } catch (error) {
    console.log('❌ Database Service (via proxy) Error:', error.message);
  }
  
  // Test tasks endpoint through main server proxy
  try {
    const tasksResponse = await axios.get('http://localhost:3000/api/services/db/tasks');
    console.log('✅ Tasks (via proxy):', tasksResponse.data);
  } catch (error) {
    console.log('❌ Tasks (via proxy) Error:', error.message);
  }
}

testServices();