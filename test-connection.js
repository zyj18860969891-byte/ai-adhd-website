const fetch = require('node-fetch');

// Test script to check service connectivity
async function testConnection() {
  const services = [
    { name: 'DB Service', url: 'http://db-service:8280/api/tasks/test-task-1' },
    { name: 'DB Service (localhost)', url: 'http://localhost:8280/api/tasks/test-task-1' },
    { name: 'DB Service (internal)', url: 'http://db-service.railway.internal:8280/api/tasks/test-task-1' }
  ];
  
  for (const service of services) {
    try {
      console.log(`Testing ${service.name}...`);
      const response = await fetch(service.url, { 
        method: 'GET',
        timeout: 5000 
      });
      
      console.log(`Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        console.log('Error response:', text.substring(0, 200));
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
    console.log('---');
  }
}

testConnection().catch(console.error);