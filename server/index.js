const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const WebSocket = require('ws');

// Use dynamic import for node-fetch (ES Module)
let fetch;
async function loadFetch() {
  if (!fetch) {
    const fetchModule = await import('node-fetch');
    fetch = fetchModule.default || fetchModule;
  }
  return fetch;
}

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

// Enhanced fetch with retry and fallback support
async function fetchWithRetry(url, options = {}, fallbackUrls = []) {
  const urls = [url, ...fallbackUrls];
  
  // Load fetch dynamically
  const fetch = await loadFetch();
  
  for (let i = 0; i < urls.length; i++) {
    const currentUrl = urls[i];
    try {
      const response = await fetch(currentUrl, options);
      if (response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response;
        } else {
          // If not JSON, read as text and throw error
          const text = await response.text();
          throw new Error(`Service responded with non-JSON content: ${text.substring(0, 200)}`);
        }
      } else {
        // For non-2xx responses, try fallback URLs first
        if (i < urls.length - 1) {
          console.log(`Service responded with status ${response.status}, trying fallback...`);
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        } else {
          // Last attempt failed, throw error
          throw new Error(`Service responded with status: ${response.status}`);
        }
      }
    } catch (error) {
      console.log(`Attempt ${i + 1}/${urls.length} failed for ${currentUrl}:`, error.message);
      if (i === urls.length - 1) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Railway service discovery
function getServiceUrl(serviceName, defaultPort) {
  // Check if we're in Railway environment
  const isRailway = process.env.RAILWAY_SERVICE_ID || process.env.RAILWAY_ENVIRONMENT;
  
  if (isRailway) {
    // In Railway with concurrently, all services run in same container on localhost
    // Use localhost with different ports
    const attempts = [
      `http://localhost:${defaultPort}`,                      // Localhost (same container)
      `http://${serviceName}:${defaultPort}`,                  // Direct service name
      `http://${serviceName}.railway.internal:${defaultPort}`, // Railway internal DNS
    ];
    
    console.log(`Railway service discovery for ${serviceName}:`, attempts);
    return attempts[0]; // Start with localhost
  }
  
  // For local development or other environments, use the provided URL or default
  return process.env[`${serviceName.toUpperCase()}_SERVICE_URL`] || `http://localhost:${defaultPort}`;
}

// Get service URLs
const aiServiceUrl = getServiceUrl('ai-service', 8190);
const dbServiceUrl = getServiceUrl('db-service', 8280);
const notificationServiceUrl = getServiceUrl('notification-service', 8380);

console.log('Resolved service URLs:');
console.log('  AI Service URL:', aiServiceUrl);
console.log('  DB Service URL:', dbServiceUrl);
console.log('  Notification Service URL:', notificationServiceUrl);

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
  max: 1000, // limit each IP to 1000 requests per windowMs
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
  const targetUrl = `${aiServiceUrl}/api${req.originalUrl.replace('/api/services/ai', '')}`;
  
  console.log('Proxying AI request to:', targetUrl);
  console.log('AI Service URL:', aiServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'GET'
  }, [
    `http://ai-service:8190/api${req.originalUrl.replace('/api/services/ai', '')}`,  // Fallback 1: Direct service name with correct port
    `http://localhost:8190/api${req.originalUrl.replace('/api/services/ai', '')}`   // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('AI Service response status:', response.status);
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
  const targetUrl = `${aiServiceUrl}/api${req.originalUrl.replace('/api/services/ai', '')}`;
  
  console.log('Proxying AI request to:', targetUrl);
  console.log('AI Service URL:', aiServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  }, [
    `http://ai-service:8190/api${req.originalUrl.replace('/api/services/ai', '')}`,  // Fallback 1: Direct service name with correct port
    `http://localhost:8190/api${req.originalUrl.replace('/api/services/ai', '')}`   // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('AI Service response status:', response.status);
      if (!response.status.toString().startsWith('2')) {
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

app.put('/api/services/ai/*', (req, res) => {
  const targetUrl = `${aiServiceUrl}/api${req.originalUrl.replace('/api/services/ai', '')}`;
  
  console.log('Proxying AI request to:', targetUrl);
  console.log('AI Service URL:', aiServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  }, [
    `http://ai-service:8190/api${req.originalUrl.replace('/api/services/ai', '')}`,  // Fallback 1: Direct service name with correct port
    `http://localhost:8190/api${req.originalUrl.replace('/api/services/ai', '')}`   // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('AI Service response status:', response.status);
      if (!response.status.toString().startsWith('2')) {
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

app.delete('/api/services/ai/*', (req, res) => {
  const targetUrl = `${aiServiceUrl}/api${req.originalUrl.replace('/api/services/ai', '')}`;
  
  console.log('Proxying AI request to:', targetUrl);
  console.log('AI Service URL:', aiServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'DELETE'
  }, [
    `http://ai-service:8190/api${req.originalUrl.replace('/api/services/ai', '')}`,  // Fallback 1: Direct service name with correct port
    `http://localhost:8190/api${req.originalUrl.replace('/api/services/ai', '')}`   // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('AI Service response status:', response.status);
      if (!response.status.toString().startsWith('2')) {
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
  const path = req.originalUrl.replace('/api/services/db', '/api');
  const targetUrl = `${dbServiceUrl}${path}`;
  
  console.log('Proxying DB request to:', targetUrl);
  console.log('DB Service URL:', dbServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'GET'
  }, [
    `http://db-service:8280${path}`,       // Fallback 1: Direct service name with correct port
    `http://localhost:8280${path}`        // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('DB Service response status:', response.status);
      if (!response.status.toString().startsWith('2')) {
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
  const path = req.originalUrl.replace('/api/services/db', '/api');
  const targetUrl = `${dbServiceUrl}${path}`;
  
  console.log('Proxying DB request to:', targetUrl);
  console.log('DB Service URL:', dbServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  }, [
    `http://db-service:8280${path}`,       // Fallback 1: Direct service name with correct port
    `http://localhost:8280${path}`        // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('DB Service response status:', response.status);
      if (!response.status.toString().startsWith('2')) {
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
  const path = req.originalUrl.replace('/api/services/db', '/api');
  const targetUrl = `${dbServiceUrl}${path}`;
  
  console.log('Proxying DB request to:', targetUrl);
  console.log('DB Service URL:', dbServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  }, [
    `http://db-service:8280${path}`,       // Fallback 1: Direct service name with correct port
    `http://localhost:8280${path}`        // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('DB Service response status:', response.status);
      if (!response.status.toString().startsWith('2')) {
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
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        url: targetUrl,
        method: 'PUT',
        body: req.body
      });
      res.status(503).json({ 
        error: 'Database Service unavailable', 
        details: error.message,
        url: targetUrl,
        method: 'PUT'
      });
    });
});

app.delete('/api/services/db/*', (req, res) => {
  const path = req.originalUrl.replace('/api/services/db', '/api');
  const targetUrl = `${dbServiceUrl}${path}`;
  
  console.log('Proxying DB request to:', targetUrl);
  console.log('DB Service URL:', dbServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'DELETE'
  }, [
    `http://db-service:8280${path}`,       // Fallback 1: Direct service name with correct port
    `http://localhost:8280${path}`        // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('DB Service response status:', response.status);
      if (!response.status.toString().startsWith('2')) {
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
  const path = req.originalUrl.replace('/api/services/notification', '/api');
  const targetUrl = `${notificationServiceUrl}${path}`;
  
  console.log('Proxying Notification request to:', targetUrl);
  console.log('Notification Service URL:', notificationServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'GET'
  }, [
    `http://notification-service:8380${path}`,  // Fallback 1: Direct service name with correct port
    `http://localhost:8380${path}`            // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('Notification Service response status:', response.status);
      if (!response.status.toString().startsWith('2')) {
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

app.post('/api/services/notification/*', (req, res) => {
  const path = req.originalUrl.replace('/api/services/notification', '/api');
  const targetUrl = `${notificationServiceUrl}${path}`;
  
  console.log('Proxying Notification request to:', targetUrl);
  console.log('Notification Service URL:', notificationServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  }, [
    `http://notification-service:8380${path}`,  // Fallback 1: Direct service name with correct port
    `http://localhost:8380${path}`            // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('Notification Service response status:', response.status);
      if (!response.status.toString().startsWith('2')) {
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

app.put('/api/services/notification/*', (req, res) => {
  const path = req.originalUrl.replace('/api/services/notification', '/api');
  const targetUrl = `${notificationServiceUrl}${path}`;
  
  console.log('Proxying Notification request to:', targetUrl);
  console.log('Notification Service URL:', notificationServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  }, [
    `http://notification-service:8380${path}`,  // Fallback 1: Direct service name with correct port
    `http://localhost:8380${path}`            // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('Notification Service response status:', response.status);
      if (!response.status.toString().startsWith('2')) {
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

app.delete('/api/services/notification/*', (req, res) => {
  const path = req.originalUrl.replace('/api/services/notification', '/api');
  const targetUrl = `${notificationServiceUrl}${path}`;
  
  console.log('Proxying Notification request to:', targetUrl);
  console.log('Notification Service URL:', notificationServiceUrl);
  console.log('Request path:', req.originalUrl);
  
  fetchWithRetry(targetUrl, {
    method: 'DELETE'
  }, [
    `http://notification-service:8380${path}`,  // Fallback 1: Direct service name with correct port
    `http://localhost:8380${path}`            // Fallback 2: Localhost with correct port
  ])
    .then(response => {
      console.log('Notification Service response status:', response.status);
      if (!response.status.toString().startsWith('2')) {
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
        ai: aiServiceUrl,
        db: dbServiceUrl,
        notification: notificationServiceUrl
      }
    });
  });
}

// Root endpoint for Railway
app.get('/', (req, res) => {
  res.json({ 
    message: 'ADHD Task Manager API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Test service connectivity
async function testServiceConnectivity() {
  console.log('Testing service connectivity...');
  
  // Load fetch dynamically
  const fetch = await loadFetch();
  
  const services = [
    { name: 'AI Service', url: aiServiceUrl },
    { name: 'Database Service', url: dbServiceUrl },
    { name: 'Notification Service', url: notificationServiceUrl }
  ];
  
  for (const service of services) {
    try {
      console.log(`Testing ${service.name} at ${service.url}`);
      const response = await fetch(`${service.url}/api/health`, { 
        timeout: 5000 
      });
      
      if (response.ok) {
        console.log(`✓ ${service.name} is reachable`);
      } else {
        console.log(`✗ ${service.name} returned status ${response.status}`);
      }
    } catch (error) {
      console.log(`✗ ${service.name} is not reachable: ${error.message}`);
    }
  }
}

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: taskProgress.services
  });
});

// Health check for all services
app.get('/api/services/health', async (req, res) => {
  const services = ['ai', 'db', 'notification'];
  const results = {};
  
  for (const service of services) {
    const serviceUrl = service === 'ai' ? aiServiceUrl :
                     service === 'db' ? dbServiceUrl :
                     notificationServiceUrl;
    
    try {
      const response = await fetch(`${serviceUrl}/api/health`, { timeout: 5000 });
      results[service] = {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        url: serviceUrl
      };
    } catch (error) {
      results[service] = {
        status: 'error',
        error: error.message,
        url: serviceUrl
      };
    }
  }
  
  res.json(results);
});

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// 初始化测试数据
async function initializeTestData() {
  try {
    console.log('Initializing test data...');
    
    // 加载 fetch
    const fetch = await loadFetch();
    
    // 创建一个测试任务 - 2分钟后到期，用于测试真实通知功能
    const testTask = {
      title: '测试任务 - 2分钟到期',
      description: 'This task will expire in 2 minutes to test the notification system',
      category: 'test',
      priority: '高优先级',
      dueDate: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2分钟后
      status: 'pending',
      tags: ['test', 'notification'],
      estimatedTime: 30,
      context: {}
    };
    
    const response = await fetch(`${dbServiceUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testTask)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test task created successfully:', result);
      console.log('⏰ This task will expire in 2 minutes and trigger a notification!');
      
      // 创建一个测试通知
      const testNotification = {
        userId: 'user-1',
        title: '系统测试通知',
        message: '您的任务管理系统已准备就绪。一个测试任务将在2分钟后到期并触发通知。',
        type: 'reminder',
        priority: 'high',
        taskId: result.id,
        status: 'pending'
      };
      
      const notifResponse = await fetch(`${notificationServiceUrl}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testNotification)
      });
      
      if (notifResponse.ok) {
        const notifResult = await notifResponse.json();
        console.log('✅ Test notification created successfully:', notifResult);
      } else {
        console.log('❌ Failed to create test notification:', notifResponse.status);
      }
    } else {
      console.log('❌ Failed to create test task:', response.status);
    }
  } catch (error) {
    console.log('⚠️  Failed to initialize test data:', error.message);
  }
}

// Start server
app.listen(PORT, async () => {
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
  
  console.log('Server ready to handle requests');
  
  // Test service connectivity
  console.log('Testing service connectivity...');
  testServiceConnectivity();
  
  // 初始化测试数据
  await initializeTestData();
});