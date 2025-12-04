const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/your-username/ai-adhd-website",
    "X-Title": "ADHD Task Manager"
  }
});

async function testAPI() {
  try {
    console.log('Testing OpenRouter API...');
    console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Set' : 'Not set');
    
    const response = await openai.chat.completions.create({
      model: "qwen/qwen3-235b-a22b-2507",
      messages: [{ role: "user", content: "Hello, please respond with JSON: {\"test\": \"success\"}" }],
      max_tokens: 50
    });
    
    console.log('API Response status:', response.status);
    console.log('API Response:', JSON.stringify(response, null, 2));
    
    const content = response.choices[0].message.content;
    console.log('Content:', content);
    
    // Check if it's HTML
    if (content && content.trim().startsWith('<')) {
      console.error('ERROR: Received HTML response instead of JSON');
      console.error('HTML content:', content.substring(0, 200));
    } else {
      console.log('SUCCESS: Received valid response');
    }
    
  } catch (error) {
    console.error('API Test Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();