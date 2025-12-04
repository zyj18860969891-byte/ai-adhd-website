const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const app = express();
const PORT = process.env.PORT || 3002;

// Load environment variables
require('dotenv').config();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database setup
const DB_PATH = process.env.DB_PATH || './data/tasks.db';
const dbDir = path.dirname(DB_PATH);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Database initialization
function initializeDatabase() {
  const runAsync = promisify(db.run).bind(db);
  
  // Create tasks table
  runAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      priority TEXT,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      dueDate DATETIME,
      tags TEXT,
      estimatedTime INTEGER,
      actualTime INTEGER,
      completedAt DATETIME,
      context TEXT
    )
  `).then(() => {
    // Create task history table
    return runAsync(`
      CREATE TABLE IF NOT EXISTS task_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId TEXT,
        action TEXT,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES tasks (id)
      )
    `);
  }).then(() => {
    // Create categories table
    return runAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }).then(() => {
    // Create indexes
    return Promise.all([
      runAsync('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)'),
      runAsync('CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category)'),
      runAsync('CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)'),
      runAsync('CREATE INDEX IF NOT EXISTS idx_task_history_taskId ON task_history(taskId)')
    ]);
  }).then(() => {
    console.log('Database initialized successfully');
  }).catch((err) => {
    console.error('Database initialization error:', err);
  });
}

// Health check
let healthStatus = {
  status: 'healthy',
  lastCheck: new Date().toISOString(),
  version: '1.0.0',
  dbPath: DB_PATH
};

// Task endpoints
app.get('/api/tasks', (req, res) => {
  const { status, category, priority, search } = req.query;
  let query = 'SELECT * FROM tasks WHERE 1=1';
  let params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY createdAt DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(rows);
  });
});

app.get('/api/tasks/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(row);
  });
});

app.post('/api/tasks', (req, res) => {
  const { id, title, description, category, priority, dueDate, tags, estimatedTime, context } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, category, priority, createdAt, updatedAt, dueDate, tags, estimatedTime, context)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([id, title, description, category, priority, createdAt, updatedAt, dueDate, JSON.stringify(tags || []), estimatedTime, JSON.stringify(context || {})], function(err) {
    if (err) {
      console.error('Database insert error:', err);
      return res.status(500).json({ error: 'Failed to create task' });
    }

    // Add to history
    addHistory(id, 'created', { title, category, priority });

    res.status(201).json({
      id,
      title,
      description,
      category,
      priority,
      status: 'pending',
      createdAt,
      updatedAt,
      dueDate,
      tags,
      estimatedTime,
      context
    });
  });

  stmt.finalize();
});

app.put('/api/tasks/:id', (req, res) => {
  const id = req.params.id;
  const { title, description, category, priority, status, dueDate, tags, actualTime, context } = req.body;
  
  // Get current task
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedAt = new Date().toISOString();
    const completedAt = status === 'completed' && !row.completedAt ? updatedAt : row.completedAt;

    const stmt = db.prepare(`
      UPDATE tasks 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          priority = COALESCE(?, priority),
          status = COALESCE(?, status),
          updatedAt = ?,
          dueDate = COALESCE(?, dueDate),
          tags = COALESCE(?, tags),
          actualTime = COALESCE(?, actualTime),
          completedAt = COALESCE(?, completedAt),
          context = COALESCE(?, context)
      WHERE id = ?
    `);

    stmt.run([title, description, category, priority, status, updatedAt, dueDate, JSON.stringify(tags || []), actualTime, completedAt, JSON.stringify(context || {}), id], function(err) {
      if (err) {
        console.error('Database update error:', err);
        return res.status(500).json({ error: 'Failed to update task' });
      }

      // Add to history
      if (status && status !== row.status) {
        addHistory(id, 'status_changed', { from: row.status, to: status });
      }

      res.json({ success: true, changes: this.changes });
    });

    stmt.finalize();
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = req.params.id;
  
  // Check if task exists
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database delete error:', err);
        return res.status(500).json({ error: 'Failed to delete task' });
      }

      // Add to history
      addHistory(id, 'deleted', { title: row.title });

      res.json({ success: true, changes: this.changes });
    });
  });
});

// Task history endpoints
app.get('/api/tasks/:id/history', (req, res) => {
  const id = req.params.id;
  db.all('SELECT * FROM task_history WHERE taskId = ? ORDER BY timestamp DESC', [id], (err, rows) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(rows);
  });
});

// Statistics endpoints
app.get('/api/stats', (req, res) => {
  const stats = {};
  
  // Get task counts by status
  db.all('SELECT status, COUNT(*) as count FROM tasks GROUP BY status', (err, rows) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    
    stats.byStatus = rows.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    // Get task counts by category
    db.all('SELECT category, COUNT(*) as count FROM tasks GROUP BY category', (err, rows) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }
      
      stats.byCategory = rows.reduce((acc, row) => {
        acc[row.category] = row.count;
        return acc;
      }, {});

      // Get completion rate
      db.get('SELECT COUNT(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed FROM tasks', (err, row) => {
        if (err) {
          console.error('Database query error:', err);
          return res.status(500).json({ error: 'Database query failed' });
        }
        
        stats.completionRate = row.total > 0 ? (row.completed / row.total) * 100 : 0;
        stats.totalTasks = row.total;

        res.json(stats);
      });
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  healthStatus.lastCheck = new Date().toISOString();
  
  // Test database connection
  db.get('SELECT 1 as test', (err) => {
    if (err) {
      healthStatus.status = 'unhealthy';
      healthStatus.error = 'Database connection failed';
    } else {
      healthStatus.status = 'healthy';
      healthStatus.error = null;
    }
    
    res.json(healthStatus);
  });
});

// Database backup endpoint
app.post('/api/backup', (req, res) => {
  const backupPath = path.join(dbDir, `backup_${Date.now()}.db`);
  
  db.serialize(() => {
    const backup = new sqlite3.Database(backupPath);
    
    db.backup(backupPath, (err) => {
      if (err) {
        console.error('Backup failed:', err);
        return res.status(500).json({ error: 'Backup failed' });
      }
      
      res.json({ success: true, backupPath });
    });
  });
});

// Helper functions
function addHistory(taskId, action, details) {
  const stmt = db.prepare('INSERT INTO task_history (taskId, action, details) VALUES (?, ?, ?)');
  stmt.run([taskId, action, JSON.stringify(details)]);
  stmt.finalize();
}

// Start server
app.listen(PORT, () => {
  console.log(`Database Service running on port ${PORT}`);
  console.log(`Database initialized successfully`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/services/db/tasks`);
  console.log(`  GET  /api/services/db/tasks/:id`);
  console.log(`  POST /api/services/db/tasks`);
  console.log(`  PUT  /api/services/db/tasks/:id`);
  console.log(`  DELETE /api/services/db/tasks/:id`);
  console.log(`  GET  /api/services/db/tasks/:id/history`);
  console.log(`  GET  /api/services/db/stats`);
  console.log(`  GET  /api/services/db/health`);
  console.log(`  POST /api/services/db/backup`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`WebSocket running on port ${parseInt(PORT, 10) + 200}`);
  }
});