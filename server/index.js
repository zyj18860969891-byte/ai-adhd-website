const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables
require('dotenv').config();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../client/dist')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Task progress tracking
let taskProgress = loadTaskProgress();

function loadTaskProgress() {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../task-progress.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load task progress:', error);
    return {
      project: { name: 'ADHD Task Manager PWA', version: '1.0.0', status: 'error' },
      currentTask: { id: 'error', title: 'Failed to load', status: 'error' },
      services: {},
      deployment: { status: 'error' }
    };
  }
}

function saveTaskProgress() {
  try {
    fs.writeFileSync(path.join(__dirname, '../task-progress.json'), JSON.stringify(taskProgress, null, 2));
  } catch (error) {
    console.error('Failed to save task progress:', error);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: taskProgress.services,
    version: taskProgress.project.version
  });
});

// Task progress endpoint
app.get('/api/task-progress', (req, res) => {
  res.json(taskProgress);
});

app.post('/api/task-progress', (req, res) => {
  taskProgress = { ...taskProgress, ...req.body, lastUpdated: new Date().toISOString() };
  saveTaskProgress();
  res.json({ success: true, taskProgress });
});

// Service status endpoint
app.get('/api/services/:serviceId/status', (req, res) => {
  const serviceId = req.params.serviceId;
  const service = taskProgress.services[serviceId];
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  res.json(service);
});

app.post('/api/services/:serviceId/status', (req, res) => {
  const serviceId = req.params.serviceId;
  const { status, health, lastCheck } = req.body;
  
  if (!taskProgress.services[serviceId]) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  taskProgress.services[serviceId] = {
    ...taskProgress.services[serviceId],
    status,
    health,
    lastCheck: lastCheck || new Date().toISOString()
  };
  
  saveTaskProgress();
  res.json({ success: true, service: taskProgress.services[serviceId] });
});

// Microservices proxy endpoints
app.get('/api/services/ai/*', (req, res) => {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3001';
  const targetUrl = `${aiServiceUrl}${req.originalUrl.replace('/api/services/ai', '')}`;
  
  fetch(targetUrl)
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(error => {
      console.error('AI Service Error:', error);
      res.status(503).json({ error: 'AI Service unavailable' });
    });
});

app.get('/api/services/db/*', (req, res) => {
  const dbServiceUrl = process.env.DB_SERVICE_URL || 'http://localhost:3002';
  const path = req.originalUrl.replace('/api/services/db', '/api');
  const targetUrl = `${dbServiceUrl}${path}`;
  
  fetch(targetUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => res.json(data))
    .catch(error => {
      console.error('Database Service Error:', error);
      res.status(503).json({ error: 'Database Service unavailable' });
    });
});

app.get('/api/services/notification/*', (req, res) => {
  const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';
  const path = req.originalUrl.replace('/api/services/notification', '/api');
  const targetUrl = `${notificationServiceUrl}${path}`;
  
  fetch(targetUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => res.json(data))
    .catch(error => {
      console.error('Notification Service Error:', error);
      res.status(503).json({ error: 'Notification Service unavailable' });
    });
});

// WebSocket for real-time updates (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  const wsPort = parseInt(process.env.PORT || '3000') + 100;
  const wss = new WebSocket.Server({ port: wsPort });
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send current task progress
    ws.send(JSON.stringify({ type: 'taskProgress', data: taskProgress }));
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  console.log(`WebSocket running on port ${wsPort}`);
} else {
  console.log('WebSocket disabled in production');
}

// Background tasks
cron.schedule('*/5 * * * * *', () => {
  // Update health status every 5 seconds
  Object.keys(taskProgress.services).forEach(serviceId => {
    taskProgress.services[serviceId].lastCheck = new Date().toISOString();
  });
  taskProgress.lastUpdated = new Date().toISOString();
  saveTaskProgress();
  
  // Broadcast to WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'taskProgress', data: taskProgress }));
    }
  });
});

// Serve PWA (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  // In development, let Vite handle the frontend
  app.get('/', (req, res) => {
    res.json({ message: 'API Server is running. Frontend is served by Vite on port 5173' });
  });
}

// Error handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`WebSocket running on port ${PORT + 100}`);
  }
  
  // Update task progress
  taskProgress.deployment.status = 'running';
  taskProgress.deployment.lastUpdated = new Date().toISOString();
  saveTaskProgress();
});