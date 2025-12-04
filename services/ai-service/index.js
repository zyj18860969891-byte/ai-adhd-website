const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

require('dotenv').config();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/your-username/ai-adhd-website',
    'X-Title': 'ADHD Task Manager'
  },
  timeout: 30000 // 30 second timeout
});

// Validate API key on startup
if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
  console.warn('WARNING: No API key configured. AI service will use fallback responses.');
  console.warn('Please set OPENROUTER_API_KEY or OPENAI_API_KEY environment variable.');
} else {
  console.log('API Key configured:', process.env.OPENROUTER_API_KEY ? 'OPENROUTER_API_KEY' : 'OPENAI_API_KEY');
  console.log('API Key length:', process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.length : process.env.OPENAI_API_KEY.length);
  console.log('Environment variables loaded successfully');
}

// Add comprehensive API key validation
function validateApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: No API key found in environment variables');
    return false;
  }
  
  // Basic validation for API key format
  if (apiKey.length < 10) {
    console.error('ERROR: API key appears to be invalid (too short)');
    return false;
  }
  
  console.log('API key validation passed');
  return true;
}

// Validate API key before starting service
if (!validateApiKey()) {
  console.warn('WARNING: AI service may not function properly without valid API key');
}

// Add error handling for OpenAI client
// Note: The openai.on('error') method may not be available in this version of the SDK
// We'll handle errors in the API calls instead

// Validate required environment variables
if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
  console.warn('Warning: No API key found. AI service will use fallback responses.');
  console.warn('Please set OPENROUTER_API_KEY or OPENAI_API_KEY environment variable.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'healthy', 
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
    environment: process.env.NODE_ENV || 'development',
    api_key_set: !!process.env.OPENROUTER_API_KEY || !!process.env.OPENAI_API_KEY,
    node_version: process.version,
    api_key_status: process.env.OPENROUTER_API_KEY ? 'Available' : process.env.OPENAI_API_KEY ? 'Available' : 'Not set',
    api_key_length: process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.length : process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    environment_details: {
      NODE_ENV: process.env.NODE_ENV,
      OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'Set' : 'Not set',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set'
    }
  };
  
  console.log('Health check requested:', healthStatus);
  res.json(healthStatus);
});

// Add explicit API endpoints for compatibility
app.post('/api/classify-task', async (req, res) => {
  try {
    const { text, context } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }
    console.log('Classify task request:', { text: text.substring(0, 50), context });
    const result = await classifyTask(text, context);
    console.log('Classification result:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('Classification Error:', error);
    res.status(500).json({ error: 'Failed to classify task' });
  }
});

app.post('/api/suggest-priority', async (req, res) => {
  try {
    const { task, context } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    console.log('Suggest priority request:', { task: task.substring(0, 50), context });
    const result = await suggestPriority(task, context);
    res.json(result);
  } catch (error) {
    console.error('Priority Suggestion Error:', error);
    res.status(500).json({ error: 'Failed to suggest priority' });
  }
});

app.post('/api/extract-tasks', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    console.log('Extract tasks request:', { text: text.substring(0, 50) });
    const result = await extractTasks(text);
    res.json(result);
  } catch (error) {
    console.error('Task Extraction Error:', error);
    res.status(500).json({ error: 'Failed to extract tasks' });
  }
});

app.post('/api/improve-task', async (req, res) => {
  try {
    const { task, context } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    console.log('Improve task request:', { task: task.substring(0, 50), context });
    const result = await improveTask(task, context);
    res.json(result);
  } catch (error) {
    console.error('Task Improvement Error:', error);
    res.status(500).json({ error: 'Failed to improve task' });
  }
});

app.post('/api/estimate-time', async (req, res) => {
  try {
    const { task, context } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    console.log('Estimate time request:', { task: task.substring(0, 50), context });
    const result = await estimateTime(task, context);
    res.json(result);
  } catch (error) {
    console.error('Time Estimation Error:', error);
    res.status(500).json({ error: 'Failed to estimate time' });
  }
});

app.post('/api/classify-task', async (req, res) => {
  try {
    const { text, context } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }
    console.log('Classify task request:', { text: text.substring(0, 50), context });
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
      API_KEY_SET: !!process.env.OPENROUTER_API_KEY,
      API_KEY_LENGTH: process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.length : 0
    });
    
    // Log the full request body for debugging
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    
    const result = await classifyTask(text, context);
    console.log('Classification result:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('Classification Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to classify task' });
  }
});

async function classifyTask(text, context = {}) {
  const prompt = `Please classify the following Chinese task and return JSON format:

Task: "${text}"
Context: ${JSON.stringify(context)}

Please return JSON format:
{
  "category": "Category (work, personal, project, study, health, finance, family, social)",
  "confidence": Confidence level between 0-1,
  "reasoning": "Reasoning for classification",
  "suggestedTags": ["tag1", "tag2"]
}`;

  try {
    console.log('Calling OpenRouter API with model:', process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507');
    console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Set' : 'Not set');
    
    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      console.warn('No API key available, returning fallback response');
      return {
        category: '个人',
        confidence: 0.5,
        reasoning: 'API密钥不可用，使用默认分类',
        suggestedTags: ['默认']
      };
    }
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [
        { role: 'system', content: 'You are a helpful task classification assistant for ADHD task management. You understand Chinese and can properly classify Chinese tasks.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" } // Request JSON response format
    });

    const content = response.choices[0].message.content;
    console.log("AI Response:", content.substring(0, 100));
    console.log("Full response type:", typeof content);
    console.log("Full response length:", content.length);
    console.log("Response object keys:", Object.keys(response));
    console.log("Response choices:", response.choices ? response.choices.length : 'No choices');
    
    // Clean up the JSON response by removing markdown code block markers
    let cleanContent = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    
    if (cleanContent && cleanContent.trim().startsWith('<')) {
      console.error('Received HTML response instead of JSON:', cleanContent.substring(0, 200));
      console.error('Full HTML response:', cleanContent);
      console.error('Response headers:', response.headers);
      console.error('Response status:', response.status);
      console.error('Response status text:', response.statusText);
      throw new Error('Received HTML response instead of JSON');
    }

    // Add additional validation for JSON parsing
    try {
      const parsed = JSON.parse(cleanContent);
      console.log('Successfully parsed JSON:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError.message);
      console.error('Raw content that failed to parse:', cleanContent.substring(0, 500));
      throw new Error('Failed to parse JSON response from AI service');
    }

  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    }

    return {
      category: '个人',
      confidence: 0.5,
      reasoning: 'AI分类失败，使用默认分类',
      suggestedTags: ['默认']
    };
  }
}

// Priority suggestion endpoint
app.post('/api/suggest-priority', async (req, res) => {
  try {
    const { task, context } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    console.log('Suggest priority request:', { task: task.substring(0, 50), context });
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    const result = await suggestPriority(task, context);
    res.json(result);
  } catch (error) {
    console.error('Priority Suggestion Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to suggest priority' });
  }
});

async function suggestPriority(task, context = {}) {
  const prompt = `Please suggest priority for the following Chinese task:

Task: "${task}"
Context: ${JSON.stringify(context)}

Please return JSON format:
{
  "priority": "Priority (high priority, medium priority, low priority, optional)",
  "confidence": Confidence level between 0-1,
  "reasoning": "Reasoning for priority suggestion"
}`;

  try {
    console.log('Calling OpenRouter API for priority with model:', process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507');
    
    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      console.warn('No API key available, returning fallback response');
      return {
        priority: '中优先级',
        confidence: 0.5,
        reasoning: 'API密钥不可用，使用默认优先级'
      };
    }
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [
        { role: 'system', content: 'You are a helpful priority suggestion assistant for ADHD task management. You understand Chinese and can properly suggest priorities for Chinese tasks.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" } // Request JSON response format
    });

    const content = response.choices[0].message.content;
    console.log('Priority Response:', content.substring(0, 100));
    console.log("Response object keys:", Object.keys(response));
    
    // Clean up the JSON response by removing markdown code block markers and fixing property names
    let cleanContent = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    cleanContent = cleanContent.replace(/"reason[^"]*"/g, '"reasoning"');
    
    if (cleanContent && cleanContent.trim().startsWith('<')) {
      console.error('Received HTML response instead of JSON:', cleanContent.substring(0, 200));
      console.error('Response headers:', response.headers);
      throw new Error('Received HTML response instead of JSON');
    }

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    return {
      priority: '中优先级',
      confidence: 0.5,
      reasoning: 'AI优先级建议失败，使用默认优先级'
    };
  }
}

// Task extraction endpoint
app.post('/api/extract-tasks', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    console.log('Extract tasks request:', { text: text.substring(0, 50) });
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    const result = await extractTasks(text);
    res.json(result);
  } catch (error) {
    console.error('Task Extraction Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to extract tasks' });
  }
});

async function extractTasks(text) {
  const prompt = `From this text: "${text}", extract specific tasks. Return JSON format:

{
  "tasks": [
    {
      "task": "Task description",
      "category": "Category (work, personal, project, study, health, finance, family, social)",
      "priority": "Priority (high priority, medium priority, low priority, optional)"
    }
  ]
}`;

  try {
    console.log('Calling OpenRouter API for extraction with model:', process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507');
    
    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      console.warn('No API key available, returning fallback response');
      return {
        tasks: [
          {
            task: text,
            category: '个人',
            priority: '中优先级'
          }
        ]
      };
    }
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [
        { role: 'system', content: 'You are a helpful task extraction assistant for ADHD task management. You understand Chinese and can properly extract tasks from Chinese text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" } // Request JSON response format
    });

    const content = response.choices[0].message.content;
    console.log('Extraction Response:', content.substring(0, 100));
    console.log("Response object keys:", Object.keys(response));
    
    // Clean up the JSON response by removing markdown code block markers
    let cleanContent = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    
    if (cleanContent && cleanContent.trim().startsWith('<')) {
      console.error('Received HTML response instead of JSON:', cleanContent.substring(0, 200));
      console.error('Response headers:', response.headers);
      throw new Error('Received HTML response instead of JSON');
    }

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    return {
      tasks: [
        {
          task: text,
          category: '个人',
          priority: '中优先级'
        }
      ]
    };
  }
}

// Task improvement endpoint
app.post('/api/improve-task', async (req, res) => {
  try {
    const { task, context } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    console.log('Improve task request:', { task: task.substring(0, 50), context });
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    const result = await improveTask(task, context);
    res.json(result);
  } catch (error) {
    console.error('Task Improvement Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to improve task' });
  }
});

async function improveTask(task, context = {}) {
  const prompt = `Please improve the following task by making it more specific, actionable, and clear:

Task: "${task}"
Context: ${JSON.stringify(context)}

Please return JSON format:
{
  "improvedTask": "Improved task description",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "reasoning": "Reasoning for improvements"
}`;

  try {
    console.log('Calling OpenRouter API for task improvement with model:', process.env.OPENROUTER_MODEL);
    
    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      console.warn('No API key available, returning fallback response');
      return {
        improvedTask: task,
        suggestions: ['任务描述已经很清晰'],
        reasoning: 'API密钥不可用，使用原始任务'
      };
    }
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [
        { role: 'system', content: 'You are a helpful task improvement assistant for ADHD task management. You understand Chinese and can make tasks more specific and actionable.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 400,
      response_format: { type: "json_object" } // Request JSON response format
    });

    const content = response.choices[0].message.content;
    console.log('Improvement Response:', content.substring(0, 100));
    console.log("Response object keys:", Object.keys(response));
    
    // Clean up the JSON response by removing markdown code block markers
    let cleanContent = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    
    if (cleanContent && cleanContent.trim().startsWith('<')) {
      console.error('Received HTML response instead of JSON:', cleanContent.substring(0, 200));
      console.error('Response headers:', response.headers);
      throw new Error('Received HTML response instead of JSON');
    }

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    return {
      improvedTask: task,
      suggestions: ['任务描述已经很清晰'],
      reasoning: 'AI任务改进失败，使用原始任务'
    };
  }
}

// Task time estimation endpoint
app.post('/api/estimate-time', async (req, res) => {
  try {
    const { task, context } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    console.log('Estimate time request:', { task: task.substring(0, 50), context });
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    const result = await estimateTime(task, context);
    res.json(result);
  } catch (error) {
    console.error('Time Estimation Error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to estimate time' });
  }
});

async function estimateTime(task, context = {}) {
  const prompt = `Please estimate the time required to complete the following task. Consider the complexity and any relevant context:

Task: "${task}"
Context: ${JSON.stringify(context)}

Please return JSON format:
{
  "estimatedTime": "Time estimate (e.g., 30 minutes, 2 hours, 1 day)",
  "confidence": Confidence level between 0-1,
  "reasoning": "Reasoning for time estimate",
  "suggestions": ["Time management suggestion 1", "Time management suggestion 2"]
}`;

  try {
    console.log('Calling OpenRouter API for time estimation with model:', process.env.OPENROUTER_MODEL);
    
    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      console.warn('No API key available, returning fallback response');
      return {
        estimatedTime: '1小时',
        confidence: 0.5,
        reasoning: 'API密钥不可用，使用默认估计',
        suggestions: ['建议设置合理的时间限制']
      };
    }
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [
        { role: 'system', content: 'You are a helpful time estimation assistant for ADHD task management. You understand Chinese and can provide realistic time estimates for tasks.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 400,
      response_format: { type: "json_object" } // Request JSON response format
    });

    const content = response.choices[0].message.content;
    console.log('Time Estimation Response:', content.substring(0, 100));
    console.log("Response object keys:", Object.keys(response));
    
    // Clean up the JSON response by removing markdown code block markers
    let cleanContent = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    
    if (cleanContent && cleanContent.trim().startsWith('<')) {
      console.error('Received HTML response instead of JSON:', cleanContent.substring(0, 200));
      console.error('Response headers:', response.headers);
      throw new Error('Received HTML response instead of JSON');
    }

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    return {
      estimatedTime: '1小时',
      confidence: 0.5,
      reasoning: 'AI时间估计失败，使用默认估计',
      suggestions: ['建议设置合理的时间限制']
    };
  }
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
    environment: process.env.NODE_ENV || 'development',
    api_key_set: !!process.env.OPENROUTER_API_KEY,
    node_version: process.version,
    api_key_status: process.env.OPENROUTER_API_KEY ? 'Available' : 'Not set',
    api_key_length: process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.length : 0,
    environment_details: {
      NODE_ENV: process.env.NODE_ENV,
      OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'Set' : 'Not set',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set'
    }
  });
});

// Detailed health check endpoint for debugging
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy', 
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
    environment: process.env.NODE_ENV || 'development',
    api_key_set: !!process.env.OPENROUTER_API_KEY || !!process.env.OPENAI_API_KEY,
    node_version: process.version,
    api_key_status: process.env.OPENROUTER_API_KEY ? 'Available' : process.env.OPENAI_API_KEY ? 'Available' : 'Not set',
    api_key_length: process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.length : process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    environment_details: {
      NODE_ENV: process.env.NODE_ENV,
      OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'Set' : 'Not set',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set'
    }
  };
  
  console.log('Health check requested:', healthStatus);
  res.json(healthStatus);
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
  console.log(`NODE_ENV is: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`Model: ${process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507'}`);
  console.log(`API Key: ${process.env.OPENROUTER_API_KEY ? 'Set' : process.env.OPENAI_API_KEY ? 'Set' : 'Not set'}`);
  console.log(`Environment variables:`, {
    NODE_ENV: process.env.NODE_ENV,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? 'Set' : 'Not set',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set'
  });
  
  // Additional logging for debugging
  console.log('Service initialized successfully');
  console.log('Available endpoints:');
  console.log('  POST /api/classify-task');
  console.log('  POST /api/suggest-priority');
  console.log('  POST /api/extract-tasks');
  console.log('  POST /api/improve-task');
  console.log('  POST /api/estimate-time');
  console.log('  GET  /api/health');
  console.log('  GET  /health (legacy)');
  
  // Check if we're in production and warn about API keys
  if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode');
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      console.warn('WARNING: No API key set in production! AI features will use fallback responses.');
    }
  }
  
  // Log all environment variables for debugging
  console.log('All environment variables:');
  Object.keys(process.env).filter(key => key.includes('OPENROUTER') || key.includes('OPENAI') || key.includes('NODE_ENV')).forEach(key => {
    console.log(`  ${key}: ${process.env[key] ? 'Set' : 'Not set'}`);
  });
});
