const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Load environment variables
require('dotenv').config();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || "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",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/your-username/ai-adhd-website",
    "X-Title": "ADHD Task Manager"
  }
});

// Task classification system
const TASK_CATEGORIES = [
  '工作', '个人', '项目', '学习', '健康', '财务', '家庭', '社交'
];

const PRIORITY_LEVELS = [
  '高优先级', '中优先级', '低优先级', '可选'
];

// Health check
let healthStatus = {
  status: 'healthy',
  lastCheck: new Date().toISOString(),
  version: '1.0.0'
};

// Task classification endpoint
app.post('/api/classify-task', async (req, res) => {
  try {
    const { text, context } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Task text is required' });
    }
    
    const result = await classifyTask(text, context);
    res.json(result);
  } catch (error) {
    console.error('Classification Error:', error);
    res.status(500).json({ error: 'Failed to classify task' });
  }
});

// Voice transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, language = 'zh-CN' } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }
    
    const transcription = await transcribeAudio(audioData, language);
    res.json({ transcription });
  } catch (error) {
    console.error('Transcription Error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// Priority suggestion endpoint
app.post('/api/suggest-priority', async (req, res) => {
  try {
    const { task, context } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    
    const priority = await suggestPriority(task, context);
    res.json(priority);
  } catch (error) {
    console.error('Priority suggestion Error:', error);
    res.status(500).json({ error: 'Failed to suggest priority' });
  }
});

// Task extraction from natural language
app.post('/api/extract-tasks', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const tasks = await extractTasks(text);
    res.json({ tasks });
  } catch (error) {
    console.error('Task extraction Error:', error);
    res.status(500).json({ error: 'Failed to extract tasks' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  healthStatus.lastCheck = new Date().toISOString();
  res.json(healthStatus);
});

// WebSocket for AI requests (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  const wsPort = parseInt(process.env.PORT || PORT, 10) + 300;
  const wss = new WebSocket.Server({ port: wsPort });

  wss.on('connection', (ws) => {
    console.log('AI WebSocket client connected');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'classify') {
          const result = await classifyTask(data.text, data.context);
          ws.send(JSON.stringify({ type: 'classification', result }));
        } else if (data.type === 'transcribe') {
          const result = await transcribeAudio(data.audioData, data.language);
          ws.send(JSON.stringify({ type: 'transcription', result }));
        }
      } catch (error) {
        console.error('WebSocket Error:', error);
        ws.send(JSON.stringify({ type: 'error', error: error.message }));
      }
    });
    
    ws.on('close', () => {
      console.log('AI WebSocket client disconnected');
    });
  });
}

// AI Functions
async function classifyTask(text, context = {}) {
  const prompt = `
  请将以下任务分类并提供相关信息：

  任务: "${text}"
  上下文: ${JSON.stringify(context)}

  请返回 JSON 格式：
  {
    "category": "任务类别（从以下选择：工作、个人、项目、学习、健康、财务、家庭、社交）",
    "confidence": 0-1之间的置信度,
    "reasoning": "分类理由",
    "suggestedTags": ["相关标签"]
  }
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    });
    
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      category: '个人',
      confidence: 0.5,
      reasoning: 'AI分类失败，使用默认分类',
      suggestedTags: ['默认']
    };
  }
}

async function transcribeAudio(audioData, language) {
  try {
    // Note: This is a placeholder. In a real implementation, you would
    // need to handle the audio data properly and use OpenAI's audio API
    // Note: OpenRouter doesn't support audio transcription directly
    // This would need to be implemented with a different approach
    // For now, we'll use a placeholder response
    return { text: audioData, language };
    
    return { text: response.text, language };
  } catch (error) {
    console.error('Transcription Error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

async function suggestPriority(task, context) {
  const prompt = `
  请为以下任务建议优先级：

  任务: "${task}"
  上下文: ${JSON.stringify(context)}

  请返回 JSON 格式：
  {
    "priority": "优先级（高优先级、中优先级、低优先级、可选）",
    "confidence": 0-1之间的置信度,
    "reasoning": "优先级建议的理由"
  }
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300
    });
    
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Priority suggestion Error:', error);
    return {
      priority: '中优先级',
      confidence: 0.5,
      reasoning: 'AI建议失败，使用默认优先级'
    };
  }
}

async function extractTasks(text) {
  const prompt = `
  请从以下文本中提取所有任务：

  文本: "${text}"

  请返回 JSON 格式：
  {
    "tasks": [
      {
        "text": "任务描述",
        "category": "任务类别",
        "priority": "优先级"
      }
    ]
  }
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    });
    
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Task extraction Error:', error);
    return {
      tasks: [{ text, category: '个人', priority: '中优先级' }]
    };
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`WebSocket running on port ${parseInt(PORT, 10) + 300}`);
  }
});