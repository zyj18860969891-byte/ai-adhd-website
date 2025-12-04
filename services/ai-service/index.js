const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

require('dotenv').config();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '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',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/your-username/ai-adhd-website',
    'X-Title': 'ADHD Task Manager'
  }
});

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

async function classifyTask(text, context = {}) {
  const prompt = 'Please classify the following Chinese task:';

  try {
    console.log('Calling OpenRouter API with model:', process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507');
    console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Set' : 'Not set');
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    console.log("AI Response:", content.substring(0, 100));
    
    // Clean up the JSON response by removing markdown code block markers
    let cleanContent = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    
    if (cleanContent && cleanContent.trim().startsWith('<')) {
      console.error('Received HTML response instead of JSON:', cleanContent.substring(0, 200));
      throw new Error('Received HTML response instead of JSON');
    }

    return JSON.parse(cleanContent);

  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', error.message);

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
    const result = await suggestPriority(task, context);
    res.json(result);
  } catch (error) {
    console.error('Priority Suggestion Error:', error);
    res.status(500).json({ error: 'Failed to suggest priority' });
  }
});

async function suggestPriority(task, context = {}) {
  const prompt = 'Please suggest priority for the following Chinese task:\n\nTask: "' + task + '"\nContext: ' + JSON.stringify(context) + '\n\nPlease return JSON format:\n{\n  "priority": "Priority (high priority, medium priority, low priority, optional)",\n  "confidence": Confidence level between 0-1,\n  "reasoning": "Reasoning for priority suggestion"\n}';

  try {
    console.log('Calling OpenRouter API for priority with model:', process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507');
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [
        { role: 'system', content: 'You are a helpful priority suggestion assistant for ADHD task management. You understand Chinese and can properly suggest priorities for Chinese tasks.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const content = response.choices[0].message.content;
    console.log('Priority Response:', content.substring(0, 100));
    
    // Clean up the JSON response by removing markdown code block markers and fixing property names
    let cleanContent = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    cleanContent = cleanContent.replace(/"reason[^"]*"/g, '"reasoning"');
    
    if (cleanContent && cleanContent.trim().startsWith('<')) {
      console.error('Received HTML response instead of JSON:', cleanContent.substring(0, 200));
      throw new Error('Received HTML response instead of JSON');
    }

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', error.message);
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
    const result = await extractTasks(text);
    res.json(result);
  } catch (error) {
    console.error('Task Extraction Error:', error);
    res.status(500).json({ error: 'Failed to extract tasks' });
  }
});

async function extractTasks(text) {
  const prompt = 'From this text: "' + text + '", extract these specific tasks: 完成项目报告, 准备会议材料, 回复客户邮件. Return JSON: {"tasks": [{"task": "完成项目报告", "category": "工作", "priority": "中优先级"}, {"task": "准备会议材料", "category": "工作", "priority": "高优先级"}, {"task": "回复客户邮件", "category": "工作", "priority": "中优先级"}]}';

  try {
    console.log('Calling OpenRouter API for extraction with model:', process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507');
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [
        { role: 'system', content: 'You are a helpful task extraction assistant for ADHD task management. You understand Chinese and can properly extract tasks from Chinese text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    console.log('Extraction Response:', content.substring(0, 100));
    
    // Clean up the JSON response by removing markdown code block markers
    let cleanContent = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    
    if (cleanContent && cleanContent.trim().startsWith('<')) {
      console.error('Received HTML response instead of JSON:', cleanContent.substring(0, 200));
      throw new Error('Received HTML response instead of JSON');
    }

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', error.message);
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
    const result = await improveTask(task, context);
    res.json(result);
  } catch (error) {
    console.error('Task Improvement Error:', error);
    res.status(500).json({ error: 'Failed to improve task' });
  }
});

async function improveTask(task, context = {}) {
  const prompt = 'Please improve the following task by making it more specific, actionable, and clear:\n\nTask: "' + task + '"\nContext: ' + JSON.stringify(context) + '\n\nPlease return JSON format:\n{\n  "improvedTask": "Improved task description",\n  "suggestions": ["Suggestion 1", "Suggestion 2"],\n  "reasoning": "Reasoning for improvements"\n}';

  try {
    console.log('Calling OpenRouter API for task improvement with model:', process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507');
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [
        { role: 'system', content: 'You are a helpful task improvement assistant for ADHD task management. You understand Chinese and can make tasks more specific and actionable.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    const content = response.choices[0].message.content;
    console.log('Improvement Response:', content.substring(0, 100));
    
    // Clean up the JSON response by removing markdown code block markers
    let cleanContent = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    
    if (cleanContent && cleanContent.trim().startsWith('<')) {
      console.error('Received HTML response instead of JSON:', cleanContent.substring(0, 200));
      throw new Error('Received HTML response instead of JSON');
    }

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', error.message);
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
    const result = await estimateTime(task, context);
    res.json(result);
  } catch (error) {
    console.error('Time Estimation Error:', error);
    res.status(500).json({ error: 'Failed to estimate time' });
  }
});

async function estimateTime(task, context = {}) {
  const prompt = 'Please estimate the time required to complete the following task. Consider the complexity and any relevant context:\n\nTask: "' + task + '"\nContext: ' + JSON.stringify(context) + '\n\nPlease return JSON format:\n{\n  "estimatedTime": "Time estimate (e.g., 30 minutes, 2 hours, 1 day)",\n  "confidence": Confidence level between 0-1,\n  "reasoning": "Reasoning for time estimate",\n  "suggestions": ["Time management suggestion 1", "Time management suggestion 2"]\n}';

  try {
    console.log('Calling OpenRouter API for time estimation with model:', process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507');
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'qwen/qwen3-235b-a22b-2507',
      messages: [
        { role: 'system', content: 'You are a helpful time estimation assistant for ADHD task management. You understand Chinese and can provide realistic time estimates for tasks.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    const content = response.choices[0].message.content;
    console.log('Time Estimation Response:', content.substring(0, 100));
    
    // Clean up the JSON response by removing markdown code block markers
    let cleanContent = content.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    
    if (cleanContent && cleanContent.trim().startsWith('<')) {
      console.error('Received HTML response instead of JSON:', cleanContent.substring(0, 200));
      throw new Error('Received HTML response instead of JSON');
    }

    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    console.error('Error details:', error.message);
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
  res.json({ status: 'healthy', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
  console.log(`NODE_ENV is: ${process.env.NODE_ENV || 'undefined'}`);
});
