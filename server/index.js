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
const dotenv = require('dotenv');

// Try to load .env file if it exists
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
} else {
  // In production environments like Railway, environment variables are set directly
  console.log('No .env file found, using environment variables from process.env');
}

// Debug environment variables
console.log('Environment variables loaded:');
console.log('  AI_SERVICE_URL:', process.env.AI_SERVICE_URL || 'Not set');
console.log('  DB_SERVICE_URL:', process.env.DB_SERVICE_URL || 'Not set');
console.log('  NOTIFICATION_SERVICE_URL:', process.env.NOTIFICATION_SERVICE_URL || 'Not set');

// Log all environment variables for debugging
console.log('All environment variables:');
Object.keys(process.env).filter(key => key.includes('SERVICE') || key.includes('PORT') || key.includes('NODE_ENV')).forEach(key => {
  console.log(`  ${key}: ${process.env[key] || 'Not set'}`);
});

// Trust proxy (required for Railway and other cloud platforms)
app.set('trust proxy', 1);

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
      project: { name: 'ADHD Task Manager PWA', version: '1.0.0', status: 'running' },
      currentTask: { id: 'startup', title: 'System initializing', status: 'in-progress' },
      services: {
        ai: { status: 'unknown', health: 'unknown', lastCheck: new Date().toISOString() },
        db: { status: 'unknown', health: 'unknown', lastCheck: new Date().toISOString() },
        notification: { status: 'unknown', health: 'unknown', lastCheck: new Date().toISOString() }
      },
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
    version: taskProgress.project.version,
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || PORT,
      AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'Not set',
      DB_SERVICE_URL: process.env.DB_SERVICE_URL || 'Not set',
      NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL || 'Not set'
    }
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
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8190';
  const targetUrl = `${aiServiceUrl}/api${req.originalUrl.replace('/api/services/ai', '')}`;
  
  console.log('Proxying AI request to:', targetUrl);
  console.log('AI Service URL:', aiServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetch(targetUrl)
    .then(response => {
      console.log('AI Service response status:', response.status);
      if (!response.ok) {
        throw new Error(`AI Service responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('AI Service response data:', JSON.stringify(data, null, 2));
      res.json(data);
    })
    .catch(error => {
      console.error('AI Service Error:', error);
      res.status(503).json({ error: 'AI Service unavailable', details: error.message });
    });
});

app.post('/api/services/ai/*', (req, res) => {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8190';
  const targetUrl = `${aiServiceUrl}/api${req.originalUrl.replace('/api/services/ai', '')}`;
  
  console.log('Proxying AI request to:', targetUrl);
  console.log('AI Service URL:', aiServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  })
    .then(response => {
      console.log('AI Service response status:', response.status);
      if (!response.ok) {
        throw new Error(`AI Service responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('AI Service response data:', JSON.stringify(data, null, 2));
      res.json(data);
    })
    .catch(error => {
      console.error('AI Service Error:', error);
      res.status(503).json({ error: 'AI Service unavailable', details: error.message });
    });
});

app.get('/api/services/ai/*', (req, res) => {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8190';
  const targetUrl = `${aiServiceUrl}/api${req.originalUrl.replace('/api/services/ai', '')}`;
  
  console.log('Proxying AI request to:', targetUrl);
  console.log('AI Service URL:', aiServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetch(targetUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  })
    .then(response => {
      console.log('AI Service response status:', response.status);
      if (!response.ok) {
        throw new Error(`AI Service responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('AI Service response data:', JSON.stringify(data, null, 2));
      res.json(data);
    })
    .catch(error => {
      console.error('AI Service Error:', error);
      res.status(503).json({ error: 'AI Service unavailable', details: error.message });
    });
});

app.get('/api/services/ai/*', (req, res) => {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8190';
  const targetUrl = `${aiServiceUrl}/api${req.originalUrl.replace('/api/services/ai', '')}`;
  
  console.log('Proxying AI request to:', targetUrl);
  console.log('AI Service URL:', aiServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetch(targetUrl, {
    method: 'DELETE'
  })
    .then(response => {
      console.log('AI Service response status:', response.status);
      if (!response.ok) {
        throw new Error(`AI Service responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('AI Service response data:', JSON.stringify(data, null, 2));
      res.json(data);
    })
    .catch(error => {
      console.error('AI Service Error:', error);
      res.status(503).json({ error: 'AI Service unavailable', details: error.message });
    });
});

app.get('/api/services/db/*', (req, res) => {
  const dbServiceUrl = process.env.DB_SERVICE_URL || 'http://db-service:8280';
  const path = req.originalUrl.replace('/api/services/db', '/api');
  const targetUrl = `${dbServiceUrl}${path}`;
  
  console.log('Proxying DB request to:', targetUrl);
  console.log('DB Service URL:', dbServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetch(targetUrl)
    .then(response => {
      console.log('DB Service response status:', response.status);
      if (!response.ok) {
        throw new Error(`DB Service responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('DB Service response data:', JSON.stringify(data, null, 2));
      res.json(data);
    })
    .catch(error => {
      console.error('Database Service Error:', error);
      res.status(503).json({ error: 'Database Service unavailable', details: error.message });
    });
});

app.post('/api/services/db/*', (req, res) => {
  const dbServiceUrl = process.env.DB_SERVICE_URL || 'http://db-service:8280';
  const path = req.originalUrl.replace('/api/services/db', '/api');
  const targetUrl = `${dbServiceUrl}${path}`;
  
  console.log('Proxying DB request to:', targetUrl);
  console.log('DB Service URL:', dbServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  })
    .then(response => {
      console.log('DB Service response status:', response.status);
      if (!response.ok) {
        throw new Error(`DB Service responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('DB Service response data:', JSON.stringify(data, null, 2));
      res.json(data);
    })
    .catch(error => {
      console.error('Database Service Error:', error);
      res.status(503).json({ error: 'Database Service unavailable', details: error.message });
    });
});

app.put('/api/services/db/*', (req, res) => {
  const dbServiceUrl = process.env.DB_SERVICE_URL || 'http://db-service:8280';
  const path = req.originalUrl.replace('/api/services/db', '/api');
  const targetUrl = `${dbServiceUrl}${path}`;
  
  console.log('Proxying DB request to:', targetUrl);
  console.log('DB Service URL:', dbServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetch(targetUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  })
    .then(response => {
      console.log('DB Service response status:', response.status);
      if (!response.ok) {
        throw new Error(`DB Service responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('DB Service response data:', JSON.stringify(data, null, 2));
      res.json(data);
    })
    .catch(error => {
      console.error('Database Service Error:', error);
      res.status(503).json({ error: 'Database Service unavailable', details: error.message });
    });
});

app.delete('/api/services/db/*', (req, res) => {
  const dbServiceUrl = process.env.DB_SERVICE_URL || 'http://db-service:8280';
  const path = req.originalUrl.replace('/api/services/db', '/api');
  const targetUrl = `${dbServiceUrl}${path}`;
  
  console.log('Proxying DB request to:', targetUrl);
  console.log('DB Service URL:', dbServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetch(targetUrl, {
    method: 'DELETE'
  })
    .then(response => {
      console.log('DB Service response status:', response.status);
      if (!response.ok) {
        throw new Error(`DB Service responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('DB Service response data:', JSON.stringify(data, null, 2));
      res.json(data);
    })
    .catch(error => {
      console.error('Database Service Error:', error);
      res.status(503).json({ error: 'Database Service unavailable', details: error.message });
    });
});

app.get('/api/services/notification/*', (req, res) => {
  const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8380';
  const path = req.originalUrl.replace('/api/services/notification', '/api');
  const targetUrl = `${notificationServiceUrl}${path}`;
  
  console.log('Proxying Notification request to:', targetUrl);
  console.log('Notification Service URL:', notificationServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetch(targetUrl)
    .then(response => {
      console.log('Notification Service response status:', response.status);
      if (!response.ok) {
        throw new Error(`Notification Service responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Notification Service response data:', JSON.stringify(data, null, 2));
      res.json(data);
    })
    .catch(error => {
      console.error('Notification Service Error:', error);
      res.status(503).json({ error: 'Notification Service unavailable', details: error.message });
    });
});

// WebSocket for real-time updates (disabled in production)
let wss;
if (process.env.NODE_ENV !== 'production') {
  const wsPort = parseInt(process.env.PORT || PORT, 10) + 100;
  wss = new WebSocket.Server({ port: wsPort });
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
  
  // Broadcast to WebSocket clients (only if WebSocket is enabled)
  if (wss && wss.clients) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'taskProgress', data: taskProgress }));
      }
    });
  }
});

// Serve PWA (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  // In development, let Vite handle the frontend
  app.get('/', (req, res) => {
    res.json({ 
      message: 'API Server is running. Frontend is served by Vite on port 5173',
      environment: process.env.NODE_ENV || 'development',
      services: {
        ai: process.env.AI_SERVICE_URL || 'http://ai-service:8190',
        db: process.env.DB_SERVICE_URL || 'http://db-service:8280',
        notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8380'
      }
    });
  });
}

// Error handling
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  console.error('Error stack:', error.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`WebSocket enabled: ${process.env.NODE_ENV !== 'production'}`);
  console.log('Environment variables:');
  console.log('  AI_SERVICE_URL:', process.env.AI_SERVICE_URL || 'Not set');
  console.log('  DB_SERVICE_URL:', process.env.DB_SERVICE_URL || 'Not set');
  console.log('  NOTIFICATION_SERVICE_URL:', process.env.NOTIFICATION_SERVICE_URL || 'Not set');
  
  // Update task progress
  taskProgress.deployment.status = 'running';
  taskProgress.deployment.lastUpdated = new Date().toISOString();
  saveTaskProgress();
});