const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8380;

// Load environment variables
require('dotenv').config();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Notification storage
const notifications = new Map();
let notificationIdCounter = 1;

// WebSocket server for real-time notifications
const clients = new Set();

// WebSocket for notifications (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  const wsPort = parseInt(process.env.PORT || PORT, 10) + 100;
  const wss = new WebSocket.Server({ port: wsPort });
  wss.on('connection', (ws) => {
    console.log('Notification WebSocket client connected');
    clients.add(ws);
    
    // Send pending notifications
    const pendingNotifications = Array.from(notifications.values())
      .filter(n => n.status === 'pending' && n.userId === ws.userId)
      .slice(0, 10);
    
    pendingNotifications.forEach(notification => {
      ws.send(JSON.stringify({ type: 'notification', data: notification }));
    });
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'subscribe') {
          ws.userId = data.userId;
          ws.send(JSON.stringify({ type: 'subscribed', userId: data.userId }));
        } else if (data.type === 'acknowledge') {
          acknowledgeNotification(data.notificationId);
          ws.send(JSON.stringify({ type: 'acknowledged', notificationId: data.notificationId }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });
}

// Health check
let healthStatus = {
  status: 'healthy',
  lastCheck: new Date().toISOString(),
  version: '1.0.0',
  activeClients: 0
};

// Notification endpoints
app.post('/api/notifications', (req, res) => {
  const { userId, title, message, type, priority, taskId, expiresAt } = req.body;
  
  if (!userId || !title || !message) {
    return res.status(400).json({ error: 'userId, title, and message are required' });
  }
  
  const notification = {
    id: notificationIdCounter++,
    userId,
    title,
    message,
    type: type || 'info',
    priority: priority || 'normal',
    taskId,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
    status: 'pending',
    acknowledgedAt: null
  };
  
  notifications.set(notification.id, notification);
  
  // Send to WebSocket clients
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.userId === userId) {
      client.send(JSON.stringify({ type: 'notification', data: notification }));
    }
  });
  
  res.status(201).json(notification);
});

app.get('/api/notifications/:userId', (req, res) => {
  const userId = req.params.userId;
  const userNotifications = Array.from(notifications.values())
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json(userNotifications);
});

app.put('/api/notifications/:id/acknowledge', (req, res) => {
  const id = parseInt(req.params.id);
  const notification = notifications.get(id);
  
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  acknowledgeNotification(id);
  res.json({ success: true, notification });
});

app.delete('/api/notifications/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const notification = notifications.get(id);
  
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  notifications.delete(id);
  res.json({ success: true });
});

// Reminder system
app.post('/api/reminders', (req, res) => {
  const { userId, taskId, title, message, schedule, repeat } = req.body;
  
  if (!userId || !taskId || !title || !schedule) {
    return res.status(400).json({ error: 'userId, taskId, title, and schedule are required' });
  }
  
  const reminder = {
    id: `reminder_${Date.now()}`,
    userId,
    taskId,
    title,
    message,
    schedule,
    repeat: repeat || false,
    active: true,
    createdAt: new Date().toISOString()
  };
  
  // Schedule the reminder
  scheduleReminder(reminder);
  
  res.status(201).json(reminder);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  healthStatus.lastCheck = new Date().toISOString();
  healthStatus.activeClients = clients.size;
  res.json(healthStatus);
});

// Background tasks
// Clean up expired notifications every hour
cron.schedule('0 * * * *', () => {
  const now = new Date();
  notifications.forEach((notification, id) => {
    if (notification.expiresAt && new Date(notification.expiresAt) < now) {
      notifications.delete(id);
    }
  });
});

// Send scheduled reminders every minute
cron.schedule('* * * * *', () => {
  // Check for reminders that should be sent now
  // This is handled by the individual cron schedules in scheduleReminder function
  console.log('Checking scheduled reminders...');
});

// Helper functions
function acknowledgeNotification(id) {
  const notification = notifications.get(id);
  if (notification) {
    notification.status = 'acknowledged';
    notification.acknowledgedAt = new Date().toISOString();
  }
}

function scheduleReminder(reminder) {
  // Schedule using cron syntax
  cron.schedule(reminder.schedule, () => {
    if (reminder.active) {
      const notification = {
        id: notificationIdCounter++,
        userId: reminder.userId,
        title: reminder.title,
        message: reminder.message,
        type: 'reminder',
        priority: 'high',
        taskId: reminder.taskId,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      
      notifications.set(notification.id, notification);
      
      // Send to WebSocket clients
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.userId === reminder.userId) {
          client.send(JSON.stringify({ type: 'notification', data: notification }));
        }
      });
      
      // If not repeating, deactivate
      if (!reminder.repeat) {
        reminder.active = false;
      }
    }
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  POST /api/notifications`);
  console.log(`  GET  /api/notifications/:userId`);
  console.log(`  PUT  /api/notifications/:id/acknowledge`);
  console.log(`  DELETE /api/notifications/:id`);
  console.log(`  POST /api/reminders`);
  console.log(`  GET  /api/health`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`WebSocket running on port ${parseInt(PORT, 10) + 100}`);
  }
});