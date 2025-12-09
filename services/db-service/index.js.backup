const express = require('express');const express = require('express');const express = require('express');const express = require('express');

const cors = require('cors');

const sqlite3 = require('sqlite3').verbose();const cors = require('cors');

const fs = require('fs');

const path = require('path');const sqlite3 = require('sqlite3').verbose();const cors = require('cors');const cors = require('cors');

const { promisify } = require('util');

const cron = require('node-cron');const fs = require('fs');



const app = express();const path = require('path');const sqlite3 = require('sqlite3').verbose();const sqlite3 = require('sqlite3').verbose();

const PORT = process.env.PORT || 8280;

const { promisify } = require('util');

// Load environment variables

require('dotenv').config();const cron = require('node-cron');const fs = require('fs');const fs = require('fs');



app.use(cors());

app.use(express.json({ limit: '10mb' }));

const app = express();const path = require('path');const path = require('path');

// Database setup

const DB_PATH = process.env.DB_PATH || './data/tasks.db';const PORT = process.env.PORT || 8280;

const dbDir = path.dirname(DB_PATH);

const { promisify } = require('util');const { promisify } = require('util');

// Ensure data directory exists

if (!fs.existsSync(dbDir)) {// Load environment variables

  fs.mkdirSync(dbDir, { recursive: true });

}require('dotenv').config();const cron = require('node-cron');const cron = require('node-cron');



const db = new sqlite3.Database(DB_PATH, (err) => {

  if (err) {

    console.error('Database connection error:', err);app.use(cors());

  } else {

    console.log('Connected to SQLite database');app.use(express.json({ limit: '10mb' }));

    initializeDatabase();

  }const app = express();const app = express();

});

// Database setup

// Database initialization

function initializeDatabase() {const DB_PATH = process.env.DB_PATH || './data/tasks.db';const PORT = process.env.PORT || 8280;const PORT = process.env.PORT || 8280;

  const runAsync = promisify(db.run).bind(db);

  const dbDir = path.dirname(DB_PATH);

  // Create tasks table

  runAsync(`

    CREATE TABLE IF NOT EXISTS tasks (

      id TEXT PRIMARY KEY,// Ensure data directory exists

      title TEXT NOT NULL,

      description TEXT,if (!fs.existsSync(dbDir)) {// Load environment variables// Load environment variables

      category TEXT,

      priority TEXT,  fs.mkdirSync(dbDir, { recursive: true });

      status TEXT DEFAULT 'pending',

      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,}require('dotenv').config();require('dotenv').config();

      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

      dueDate DATETIME,

      estimatedTime INTEGER DEFAULT 0,

      actualTime INTEGER DEFAULT 0,const db = new sqlite3.Database(DB_PATH, (err) => {

      tags TEXT

    )  if (err) {

  `).then(() => {

    console.log('Tasks table created/verified');    console.error('Database connection error:', err);app.use(cors());app.use(cors());

    

    // Create task history table  } else {

    return runAsync(`

      CREATE TABLE IF NOT EXISTS task_history (    console.log('Connected to SQLite database');app.use(express.json({ limit: '10mb' }));app.use(express.json({ limit: '10mb' }));

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        taskId TEXT NOT NULL,    initializeDatabase();

        action TEXT NOT NULL,

        details TEXT,  }

        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (taskId) REFERENCES tasks (id)});

      )

    `);// Database setup// Database setup

  }).then(() => {

    console.log('Task history table created/verified');// Database initialization

    

    // Create indexesfunction initializeDatabase() {const DB_PATH = process.env.DB_PATH || './data/tasks.db';const DB_PATH = process.env.DB_PATH || './data/tasks.db';

    return runAsync('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)');

  }).then(() => {  const runAsync = promisify(db.run).bind(db);

    console.log('Database initialized successfully');

  }).catch(err => {  const dbDir = path.dirname(DB_PATH);const dbDir = path.dirname(DB_PATH);

    console.error('Database initialization error:', err);

  });  // Create tasks table

}

  runAsync(`

// Helper function to add history

function addHistory(taskId, action, details) {    CREATE TABLE IF NOT EXISTS tasks (

  const stmt = db.prepare('INSERT INTO task_history (taskId, action, details) VALUES (?, ?, ?)');

  stmt.run([taskId, action, JSON.stringify(details)]);      id TEXT PRIMARY KEY,// Ensure data directory exists// Ensure data directory exists

  stmt.finalize();

}      title TEXT NOT NULL,



// Helper function to get cron schedule      description TEXT,if (!fs.existsSync(dbDir)) {if (!fs.existsSync(dbDir)) {

function getCronSchedule(date) {

  const minute = date.getMinutes();      category TEXT,

  const hour = date.getHours();

  const day = date.getDate();      priority TEXT,  fs.mkdirSync(dbDir, { recursive: true });  fs.mkdirSync(dbDir, { recursive: true });

  const month = date.getMonth() + 1;

  const dayOfWeek = date.getDay();      status TEXT DEFAULT 'pending',

  return minute + ' ' + hour + ' ' + day + ' ' + month + ' ' + dayOfWeek;

}      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,}}



// API endpoints      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

app.get('/api/services/db/tasks', (req, res) => {

  const stmt = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC');      dueDate DATETIME,

  stmt.all((err, rows) => {

    if (err) {      estimatedTime INTEGER DEFAULT 0,

      console.error('Error fetching tasks:', err);

      return res.status(500).json({ error: 'Failed to fetch tasks' });      actualTime INTEGER DEFAULT 0,const db = new sqlite3.Database(DB_PATH, (err) => {const db = new sqlite3.Database(DB_PATH, (err) => {

    }

    res.json(rows);      tags TEXT

  });

});    )  if (err) {  if (err) {



app.get('/api/services/db/tasks/:id', (req, res) => {  `).then(() => {

  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');

  stmt.get([req.params.id], (err, row) => {    console.log('Tasks table created/verified');    console.error('Database connection error:', err);    console.error('Database connection error:', err);

    if (err) {

      console.error('Error fetching task:', err);    

      return res.status(500).json({ error: 'Failed to fetch task' });

    }    // Create task history table  } else {  } else {

    if (!row) {

      return res.status(404).json({ error: 'Task not found' });    return runAsync(`

    }

    res.json(row);      CREATE TABLE IF NOT EXISTS task_history (    console.log('Connected to SQLite database');    console.log('Connected to SQLite database');

  });

});        id INTEGER PRIMARY KEY AUTOINCREMENT,



app.post('/api/services/db/tasks', (req, res) => {        taskId TEXT NOT NULL,    initializeDatabase();    initializeDatabase();

  const { id, title, description, category, priority, dueDate, estimatedTime, tags } = req.body;

          action TEXT NOT NULL,

  if (!id || !title) {

    return res.status(400).json({ error: 'ID and title are required' });        details TEXT,  }  }

  }

          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

  const stmt = db.prepare(`

    INSERT INTO tasks (id, title, description, category, priority, dueDate, estimatedTime, tags)        FOREIGN KEY (taskId) REFERENCES tasks (id)});});

    VALUES (?, ?, ?, ?, ?, ?, ?, ?)

  `);      )

  

  stmt.run([    `);

    id,

    title,  }).then(() => {

    description || '',

    category || '',    console.log('Task history table created/verified');// Database initialization// Database initialization

    priority || 'medium',

    dueDate || null,    

    estimatedTime || 0,

    tags ? JSON.stringify(tags) : null    // Create indexesfunction initializeDatabase() {function initializeDatabase() {

  ], function(err) {

    if (err) {    return runAsync('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)');

      console.error('Error creating task:', err);

      return res.status(500).json({ error: 'Failed to create task' });  }).then(() => {  const runAsync = promisify(db.run).bind(db);  const runAsync = promisify(db.run).bind(db);

    }

        console.log('Database initialized successfully');

    addHistory(id, 'created', { title, category, priority });

    res.status(201).json({ id, title, message: 'Task created successfully' });  }).catch(err => {    

  });

      console.error('Database initialization error:', err);

  stmt.finalize();

});  });  // Create tasks table  // Create tasks table



app.put('/api/services/db/tasks/:id', (req, res) => {}

  const { title, description, category, priority, status, dueDate, estimatedTime, actualTime, tags } = req.body;

    runAsync(`  runAsync(`

  // First get the current task

  const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');// Helper function to add history

  getStmt.get([req.params.id], (err, task) => {

    if (err) {function addHistory(taskId, action, details) {    CREATE TABLE IF NOT EXISTS tasks (    CREATE TABLE IF NOT EXISTS tasks (

      console.error('Error fetching task:', err);

      return res.status(500).json({ error: 'Failed to fetch task' });  const stmt = db.prepare('INSERT INTO task_history (taskId, action, details) VALUES (?, ?, ?)');

    }

      stmt.run([taskId, action, JSON.stringify(details)]);      id TEXT PRIMARY KEY,      id TEXT PRIMARY KEY,

    if (!task) {

      return res.status(404).json({ error: 'Task not found' });  stmt.finalize();

    }

    }      title TEXT NOT NULL,      title TEXT NOT NULL,

    // Update task

    const updateStmt = db.prepare(`

      UPDATE tasks 

      SET title = ?, description = ?, category = ?, priority = ?, status = ?, // Helper function to get cron schedule      description TEXT,      description TEXT,

          dueDate = ?, estimatedTime = ?, actualTime = ?, tags = ?, updatedAt = ?

      WHERE id = ?function getCronSchedule(date) {

    `);

      const minute = date.getMinutes();      category TEXT,      category TEXT,

    updateStmt.run([

      title || task.title,  const hour = date.getHours();

      description || task.description,

      category || task.category,  const day = date.getDate();      priority TEXT,      priority TEXT,

      priority || task.priority,

      status || task.status,  const month = date.getMonth() + 1;

      dueDate || task.dueDate,

      estimatedTime || task.estimatedTime,  const dayOfWeek = date.getDay();      status TEXT DEFAULT 'pending',      status TEXT DEFAULT 'pending',

      actualTime || task.actualTime,

      tags ? JSON.stringify(tags) : task.tags,  return minute + ' ' + hour + ' ' + day + ' ' + month + ' ' + dayOfWeek;

      new Date().toISOString(),

      req.params.id}      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    ], function(err) {

      if (err) {

        console.error('Error updating task:', err);

        return res.status(500).json({ error: 'Failed to update task' });// API endpoints      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

      }

      app.get('/api/services/db/tasks', (req, res) => {

      addHistory(req.params.id, 'updated', { 

        old: task,   const stmt = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC');      dueDate DATETIME,      dueDate DATETIME,

        new: { title, description, category, priority, status, dueDate, estimatedTime, actualTime, tags }

      });  stmt.all((err, rows) => {

      

      res.json({ id: req.params.id, message: 'Task updated successfully' });    if (err) {      estimatedTime INTEGER DEFAULT 0,      tags TEXT,

    });

          console.error('Error fetching tasks:', err);

    updateStmt.finalize();

  });      return res.status(500).json({ error: 'Failed to fetch tasks' });      actualTime INTEGER DEFAULT 0,      estimatedTime INTEGER,

  

  getStmt.finalize();    }

});

    res.json(rows);      tags TEXT      actualTime INTEGER,

app.delete('/api/services/db/tasks/:id', (req, res) => {

  // First get the task to delete  });

  const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');

  getStmt.get([req.params.id], (err, task) => {});    )      completedAt DATETIME,

    if (err) {

      console.error('Error fetching task:', err);

      return res.status(500).json({ error: 'Failed to fetch task' });

    }app.get('/api/services/db/tasks/:id', (req, res) => {  `).then(() => {      context TEXT

    

    if (!task) {  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');

      return res.status(404).json({ error: 'Task not found' });

    }  stmt.get([req.params.id], (err, row) => {    console.log('Tasks table created/verified');    )

    

    // Delete task    if (err) {

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');

    deleteStmt.run([req.params.id], function(err) {      console.error('Error fetching task:', err);      `).then(() => {

      if (err) {

        console.error('Error deleting task:', err);      return res.status(500).json({ error: 'Failed to fetch task' });

        return res.status(500).json({ error: 'Failed to delete task' });

      }    }    // Create task history table    // Create task history table

      

      addHistory(req.params.id, 'deleted', task);    if (!row) {

      res.json({ id: req.params.id, message: 'Task deleted successfully' });

    });      return res.status(404).json({ error: 'Task not found' });    return runAsync(`    return runAsync(`

    

    deleteStmt.finalize();    }

  });

      res.json(row);      CREATE TABLE IF NOT EXISTS task_history (      CREATE TABLE IF NOT EXISTS task_history (

  getStmt.finalize();

});  });



app.get('/api/services/db/tasks/:id/history', (req, res) => {});        id INTEGER PRIMARY KEY AUTOINCREMENT,        id INTEGER PRIMARY KEY AUTOINCREMENT,

  const stmt = db.prepare('SELECT * FROM task_history WHERE taskId = ? ORDER BY timestamp DESC');

  stmt.all([req.params.id], (err, rows) => {

    if (err) {

      console.error('Error fetching task history:', err);app.post('/api/services/db/tasks', (req, res) => {        taskId TEXT NOT NULL,        taskId TEXT,

      return res.status(500).json({ error: 'Failed to fetch task history' });

    }  const { id, title, description, category, priority, dueDate, estimatedTime, tags } = req.body;

    res.json(rows);

  });          action TEXT NOT NULL,        action TEXT,

});

  if (!id || !title) {

app.get('/api/services/db/stats', (req, res) => {

  const stmt = db.prepare('SELECT COUNT(*) as total, COUNT(CASE WHEN status = "completed" THEN 1 END) as completed, COUNT(CASE WHEN status = "pending" THEN 1 END) as pending, COUNT(CASE WHEN status = "overdue" THEN 1 END) as overdue FROM tasks');    return res.status(400).json({ error: 'ID and title are required' });        details TEXT,        details TEXT,

  stmt.get((err, row) => {

    if (err) {  }

      console.error('Error fetching stats:', err);

      return res.status(500).json({ error: 'Failed to fetch stats' });          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

    }

    res.json(row);  const stmt = db.prepare(`

  });

});    INSERT INTO tasks (id, title, description, category, priority, dueDate, estimatedTime, tags)        FOREIGN KEY (taskId) REFERENCES tasks (id)        FOREIGN KEY (taskId) REFERENCES tasks (id)



app.get('/api/services/db/health', (req, res) => {    VALUES (?, ?, ?, ?, ?, ?, ?, ?)

  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });

});  `);      )      )



app.post('/api/services/db/backup', (req, res) => {  

  const backupPath = path.join(dbDir, `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);

    stmt.run([    `);    `);

  db.serialize(() => {

    db.backup(backupPath, (err) => {    id,

      if (err) {

        console.error('Backup error:', err);    title,  }).then(() => {  }).then(() => {

        return res.status(500).json({ error: 'Failed to create backup' });

      }    description || '',

      res.json({ message: 'Backup created successfully', path: backupPath });

    });    category || '',    console.log('Task history table created/verified');    // Create categories table

  });

});    priority || 'medium',



// Background tasks    dueDate || null,        return runAsync(`

// Check for overdue tasks every minute

cron.schedule('* * * * *', () => {    estimatedTime || 0,

  const now = new Date();

      tags ? JSON.stringify(tags) : null    // Create indexes      CREATE TABLE IF NOT EXISTS categories (

  // Check for tasks that are due but not completed

  const stmt = db.prepare('SELECT * FROM tasks WHERE status != "completed" AND status != "overdue" AND dueDate < ?');  ], function(err) {

  stmt.all([now.toISOString()], (err, tasks) => {

    if (err) {    if (err) {    return runAsync('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)');        id INTEGER PRIMARY KEY AUTOINCREMENT,

      console.error('Error fetching overdue tasks:', err);

      return;      console.error('Error creating task:', err);

    }

          return res.status(500).json({ error: 'Failed to create task' });  }).then(() => {        name TEXT UNIQUE NOT NULL,

    tasks.forEach(task => {

      console.log('Task is overdue:', task.id, task.title);    }

      

      // Update task status to overdue        console.log('Database initialized successfully');        color TEXT,

      const stmt = db.prepare('UPDATE tasks SET status = "overdue", updatedAt = ? WHERE id = ?');

      stmt.run([now.toISOString(), task.id]);    addHistory(id, 'created', { title, category, priority });

      stmt.finalize();

          res.status(201).json({ id, title, message: 'Task created successfully' });  }).catch(err => {        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP

      // Add to history

      addHistory(task.id, 'status_changed', { from: task.status, to: 'overdue' });  });

      

      // Create overdue notification      console.error('Database initialization error:', err);      )

      const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8380';

      const notificationData = {  stmt.finalize();

        userId: 'user-1',

        title: '任务已过期: ' + task.title,});  });    `);

        message: '任务 "' + task.title + '" 已经过期！',

        type: 'reminder',

        priority: 'high',

        taskId: task.idapp.put('/api/services/db/tasks/:id', (req, res) => {}  }).then(() => {

      };

        const { title, description, category, priority, status, dueDate, estimatedTime, actualTime, tags } = req.body;

      // Use fetch with proper error handling

      fetch(notificationServiceUrl + '/api/notifications', {      // Create indexes

        method: 'POST',

        headers: {  // First get the current task

          'Content-Type': 'application/json'

        },  const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');// Helper function to add history    return Promise.all([

        body: JSON.stringify(notificationData)

      }).then(response => {  getStmt.get([req.params.id], (err, task) => {

        if (!response.ok) {

          throw new Error('Notification service responded with status: ' + response.status);    if (err) {function addHistory(taskId, action, details) {      runAsync('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)'),

        }

        return response.json();      console.error('Error fetching task:', err);

      }).then(result => {

        console.log('Overdue notification created successfully:', result);      return res.status(500).json({ error: 'Failed to fetch task' });  const stmt = db.prepare('INSERT INTO task_history (taskId, action, details) VALUES (?, ?, ?)');      runAsync('CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category)'),

      }).catch(err => {

        console.error('Failed to create overdue notification:', err);    }

      });

    });      stmt.run([taskId, action, JSON.stringify(details)]);      runAsync('CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)'),

  });

});    if (!task) {



// Start server      return res.status(404).json({ error: 'Task not found' });  stmt.finalize();      runAsync('CREATE INDEX IF NOT EXISTS idx_task_history_taskId ON task_history(taskId)')

app.listen(PORT, () => {

  console.log('Database Service running on port ' + PORT);    }

  console.log('Database initialized successfully');

  console.log('Available endpoints:');    }    ]);

  console.log('  GET  /api/services/db/tasks');

  console.log('  GET  /api/services/db/tasks/:id');    // Update task

  console.log('  POST /api/services/db/tasks');

  console.log('  PUT  /api/services/db/tasks/:id');    const updateStmt = db.prepare(`  }).then(() => {

  console.log('  DELETE /api/services/db/tasks/:id');

  console.log('  GET  /api/services/db/tasks/:id/history');      UPDATE tasks 

  console.log('  GET  /api/services/db/stats');

  console.log('  GET  /api/services/db/health');      SET title = ?, description = ?, category = ?, priority = ?, status = ?, // Helper function to get cron schedule    console.log('Database initialized successfully');

  console.log('  POST /api/services/db/backup');

            dueDate = ?, estimatedTime = ?, actualTime = ?, tags = ?, updatedAt = ?

  if (process.env.NODE_ENV !== 'production') {

    console.log('WebSocket running on port ' + (parseInt(PORT, 10) + 200));      WHERE id = ?function getCronSchedule(date) {  }).catch((err) => {

  }

});    `);



// Export the database for use in other modules if needed      const minute = date.getMinutes();    console.error('Database initialization error:', err);

module.exports = { db, app };

    updateStmt.run([

// Handle graceful shutdown

process.on('SIGINT', () => {      title || task.title,  const hour = date.getHours();  });

  console.log('Shutting down gracefully...');

  process.exit(0);      description || task.description,

});

      category || task.category,  const day = date.getDate();}

process.on('SIGTERM', () => {

  console.log('Shutting down gracefully...');      priority || task.priority,

  process.exit(0);

});      status || task.status,  const month = date.getMonth() + 1;

      dueDate || task.dueDate,

      estimatedTime || task.estimatedTime,  const dayOfWeek = date.getDay();// Health check

      actualTime || task.actualTime,

      tags ? JSON.stringify(tags) : task.tags,  return minute + ' ' + hour + ' ' + day + ' ' + month + ' ' + dayOfWeek;let healthStatus = {

      new Date().toISOString(),

      req.params.id}  status: 'healthy',

    ], function(err) {

      if (err) {  lastCheck: new Date().toISOString(),

        console.error('Error updating task:', err);

        return res.status(500).json({ error: 'Failed to update task' });// API endpoints  version: '1.0.0',

      }

      app.get('/api/services/db/tasks', (req, res) => {  dbPath: DB_PATH

      addHistory(req.params.id, 'updated', { 

        old: task,   const stmt = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC');};

        new: { title, description, category, priority, status, dueDate, estimatedTime, actualTime, tags }

      });  stmt.all((err, rows) => {

      

      res.json({ id: req.params.id, message: 'Task updated successfully' });    if (err) {// Task endpoints

    });

          console.error('Error fetching tasks:', err);app.get('/api/tasks', (req, res) => {

    updateStmt.finalize();

  });      return res.status(500).json({ error: 'Failed to fetch tasks' });  const { status, category, priority, search } = req.query;

  

  getStmt.finalize();    }  let query = 'SELECT * FROM tasks WHERE 1=1';

});

    res.json(rows);  let params = [];

app.delete('/api/services/db/tasks/:id', (req, res) => {

  // First get the task to delete  });

  const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');

  getStmt.get([req.params.id], (err, task) => {});  if (status) {

    if (err) {

      console.error('Error fetching task:', err);    query += ' AND status = ?';

      return res.status(500).json({ error: 'Failed to fetch task' });

    }app.get('/api/services/db/tasks/:id', (req, res) => {    params.push(status);

    

    if (!task) {  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');  }

      return res.status(404).json({ error: 'Task not found' });

    }  stmt.get([req.params.id], (err, row) => {

    

    // Delete task    if (err) {  if (category) {

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');

    deleteStmt.run([req.params.id], function(err) {      console.error('Error fetching task:', err);    query += ' AND category = ?';

      if (err) {

        console.error('Error deleting task:', err);      return res.status(500).json({ error: 'Failed to fetch task' });    params.push(category);

        return res.status(500).json({ error: 'Failed to delete task' });

      }    }  }

      

      addHistory(req.params.id, 'deleted', task);    if (!row) {

      res.json({ id: req.params.id, message: 'Task deleted successfully' });

    });      return res.status(404).json({ error: 'Task not found' });  if (priority) {

    

    deleteStmt.finalize();    }    query += ' AND priority = ?';

  });

      res.json(row);    params.push(priority);

  getStmt.finalize();

});  });  }



app.get('/api/services/db/tasks/:id/history', (req, res) => {});

  const stmt = db.prepare('SELECT * FROM task_history WHERE taskId = ? ORDER BY timestamp DESC');

  stmt.all([req.params.id], (err, rows) => {  if (search) {

    if (err) {

      console.error('Error fetching task history:', err);app.post('/api/services/db/tasks', (req, res) => {    query += ' AND (title LIKE ? OR description LIKE ?)';

      return res.status(500).json({ error: 'Failed to fetch task history' });

    }  const { id, title, description, category, priority, dueDate, estimatedTime, tags } = req.body;    params.push(`%${search}%`, `%${search}%`);

    res.json(rows);

  });    }

});

  if (!id || !title) {

app.get('/api/services/db/stats', (req, res) => {

  const stmt = db.prepare('SELECT COUNT(*) as total, COUNT(CASE WHEN status = "completed" THEN 1 END) as completed, COUNT(CASE WHEN status = "pending" THEN 1 END) as pending, COUNT(CASE WHEN status = "overdue" THEN 1 END) as overdue FROM tasks');    return res.status(400).json({ error: 'ID and title are required' });  query += ' ORDER BY createdAt DESC';

  stmt.get((err, row) => {

    if (err) {  }

      console.error('Error fetching stats:', err);

      return res.status(500).json({ error: 'Failed to fetch stats' });    db.all(query, params, (err, rows) => {

    }

    res.json(row);  const stmt = db.prepare(`    if (err) {

  });

});    INSERT INTO tasks (id, title, description, category, priority, dueDate, estimatedTime, tags)      console.error('Database query error:', err);



app.get('/api/services/db/health', (req, res) => {    VALUES (?, ?, ?, ?, ?, ?, ?, ?)      return res.status(500).json({ error: 'Database query failed' });

  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });

});  `);    }



app.post('/api/services/db/backup', (req, res) => {      res.json(rows.map(row => ({

  const backupPath = path.join(dbDir, `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);

    stmt.run([      ...row,

  db.serialize(() => {

    db.backup(backupPath, (err) => {    id,      tags: row.tags ? JSON.parse(row.tags) : [],

      if (err) {

        console.error('Backup error:', err);    title,      context: row.context ? JSON.parse(row.context) : {}

        return res.status(500).json({ error: 'Failed to create backup' });

      }    description || '',    })));

      res.json({ message: 'Backup created successfully', path: backupPath });

    });    category || '',  });

  });

});    priority || 'medium',});



// Background tasks    dueDate || null,

// Check for overdue tasks every minute

cron.schedule('* * * * *', () => {    estimatedTime || 0,app.get('/api/tasks/:id', (req, res) => {

  const now = new Date();

      tags ? JSON.stringify(tags) : null  const id = req.params.id;

  // Check for tasks that are due but not completed

  const stmt = db.prepare('SELECT * FROM tasks WHERE status != "completed" AND status != "overdue" AND dueDate < ?');  ], function(err) {  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {

  stmt.all([now.toISOString()], (err, tasks) => {

    if (err) {    if (err) {    if (err) {

      console.error('Error fetching overdue tasks:', err);

      return;      console.error('Error creating task:', err);      console.error('Database query error:', err);

    }

          return res.status(500).json({ error: 'Failed to create task' });      return res.status(500).json({ error: 'Database query failed' });

    tasks.forEach(task => {

      console.log('Task is overdue:', task.id, task.title);    }    }

      

      // Update task status to overdue        if (!row) {

      const stmt = db.prepare('UPDATE tasks SET status = "overdue", updatedAt = ? WHERE id = ?');

      stmt.run([now.toISOString(), task.id]);    addHistory(id, 'created', { title, category, priority });      return res.status(404).json({ error: 'Task not found' });

      stmt.finalize();

          res.status(201).json({ id, title, message: 'Task created successfully' });    }

      // Add to history

      addHistory(task.id, 'status_changed', { from: task.status, to: 'overdue' });  });    res.json({

      

      // Create overdue notification        ...row,

      const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8380';

      const notificationData = {  stmt.finalize();      tags: row.tags ? JSON.parse(row.tags) : [],

        userId: 'user-1',

        title: '任务已过期: ' + task.title,});      context: row.context ? JSON.parse(row.context) : {}

        message: '任务 "' + task.title + '" 已经过期！',

        type: 'reminder',    });

        priority: 'high',

        taskId: task.idapp.put('/api/services/db/tasks/:id', (req, res) => {  });

      };

        const { title, description, category, priority, status, dueDate, estimatedTime, actualTime, tags } = req.body;});

      // Use fetch with proper error handling

      fetch(notificationServiceUrl + '/api/notifications', {  

        method: 'POST',

        headers: {  // First get the current taskapp.post('/api/tasks', (req, res) => {

          'Content-Type': 'application/json'

        },  const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');  const { id, title, description, category, priority, dueDate, tags, estimatedTime, context } = req.body;

        body: JSON.stringify(notificationData)

      }).then(response => {  getStmt.get([req.params.id], (err, task) => {  

        if (!response.ok) {

          throw new Error('Notification service responded with status: ' + response.status);    if (err) {  if (!title) {

        }

        return response.json();      console.error('Error fetching task:', err);    return res.status(400).json({ error: 'Title is required' });

      }).then(result => {

        console.log('Overdue notification created successfully:', result);      return res.status(500).json({ error: 'Failed to fetch task' });  }

      }).catch(err => {

        console.error('Failed to create overdue notification:', err);    }

      });

    });      const createdAt = new Date().toISOString();

  });

});    if (!task) {  const updatedAt = createdAt;



// Start server      return res.status(404).json({ error: 'Task not found' });

app.listen(PORT, () => {

  console.log('Database Service running on port ' + PORT);    }  const stmt = db.prepare(`

  console.log('Database initialized successfully');

  console.log('Available endpoints:');        INSERT INTO tasks (id, title, description, category, priority, createdAt, updatedAt, dueDate, tags, estimatedTime, context)

  console.log('  GET  /api/services/db/tasks');

  console.log('  GET  /api/services/db/tasks/:id');    // Update task    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

  console.log('  POST /api/services/db/tasks');

  console.log('  PUT  /api/services/db/tasks/:id');    const updateStmt = db.prepare(`  `);

  console.log('  DELETE /api/services/db/tasks/:id');

  console.log('  GET  /api/services/db/tasks/:id/history');      UPDATE tasks 

  console.log('  GET  /api/services/db/stats');

  console.log('  GET  /api/services/db/health');      SET title = ?, description = ?, category = ?, priority = ?, status = ?,   stmt.run([id, title, description, category, priority, createdAt, updatedAt, dueDate, JSON.stringify(tags || []), estimatedTime, JSON.stringify(context || {})], function(err) {

  console.log('  POST /api/services/db/backup');

            dueDate = ?, estimatedTime = ?, actualTime = ?, tags = ?, updatedAt = ?    if (err) {

  if (process.env.NODE_ENV !== 'production') {

    console.log('WebSocket running on port ' + (parseInt(PORT, 10) + 200));      WHERE id = ?      console.error('Database insert error:', err);

  }

});    `);      return res.status(500).json({ error: 'Failed to create task' });



// Export the database for use in other modules if needed        }

module.exports = { db, app };

    updateStmt.run([

// Handle graceful shutdown

process.on('SIGINT', () => {      title || task.title,    // Add to history

  console.log('Shutting down gracefully...');

  process.exit(0);      description || task.description,    addHistory(id, 'created', { title, category, priority });

});

      category || task.category,

process.on('SIGTERM', () => {

  console.log('Shutting down gracefully...');      priority || task.priority,    // If due date is set, create a reminder

  process.exit(0);

});      status || task.status,    if (dueDate) {

      dueDate || task.dueDate,      createTaskReminder({

      estimatedTime || task.estimatedTime,        id,

      actualTime || task.actualTime,        title,

      tags ? JSON.stringify(tags) : task.tags,        description,

      new Date().toISOString(),        category,

      req.params.id        priority,

    ], function(err) {        dueDate,

      if (err) {        tags

        console.error('Error updating task:', err);      });

        return res.status(500).json({ error: 'Failed to update task' });    }

      }

      res.json({

      addHistory(req.params.id, 'updated', {       id,

        old: task,       title,

        new: { title, description, category, priority, status, dueDate, estimatedTime, actualTime, tags }      description,

      });      category,

            priority,

      res.json({ id: req.params.id, message: 'Task updated successfully' });      status: 'pending',

    });      createdAt,

          updatedAt,

    updateStmt.finalize();      dueDate,

  });      tags: tags || [],

        estimatedTime,

  getStmt.finalize();      context: context || {}

});    });

  });

app.delete('/api/services/db/tasks/:id', (req, res) => {

  // First get the task to delete  stmt.finalize();

  const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');});

  getStmt.get([req.params.id], (err, task) => {

    if (err) {app.put('/api/tasks/:id', (req, res) => {

      console.error('Error fetching task:', err);  const id = req.params.id;

      return res.status(500).json({ error: 'Failed to fetch task' });  const { title, description, category, priority, status, dueDate, tags, actualTime, context } = req.body;

    }  

      // Get current task

    if (!task) {  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {

      return res.status(404).json({ error: 'Task not found' });    if (err) {

    }      console.error('Database query error:', err);

          return res.status(500).json({ error: 'Database query failed' });

    // Delete task    }

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');    if (!row) {

    deleteStmt.run([req.params.id], function(err) {      return res.status(404).json({ error: 'Task not found' });

      if (err) {    }

        console.error('Error deleting task:', err);

        return res.status(500).json({ error: 'Failed to delete task' });    const updatedAt = new Date().toISOString();

      }    const completedAt = status === 'completed' && !row.completedAt ? updatedAt : row.completedAt;

      

      addHistory(req.params.id, 'deleted', task);    const stmt = db.prepare(`

      res.json({ id: req.params.id, message: 'Task deleted successfully' });      UPDATE tasks 

    });      SET title = COALESCE(?, title),

              description = COALESCE(?, description),

    deleteStmt.finalize();          category = COALESCE(?, category),

  });          priority = COALESCE(?, priority),

            status = COALESCE(?, status),

  getStmt.finalize();          updatedAt = ?,

});          dueDate = COALESCE(?, dueDate),

          tags = COALESCE(?, tags),

app.get('/api/services/db/tasks/:id/history', (req, res) => {          actualTime = COALESCE(?, actualTime),

  const stmt = db.prepare('SELECT * FROM task_history WHERE taskId = ? ORDER BY timestamp DESC');          completedAt = COALESCE(?, completedAt),

  stmt.all([req.params.id], (err, rows) => {          context = COALESCE(?, context)

    if (err) {      WHERE id = ?

      console.error('Error fetching task history:', err);    `);

      return res.status(500).json({ error: 'Failed to fetch task history' });

    }    stmt.run([title, description, category, priority, status, updatedAt, dueDate, JSON.stringify(tags || []), actualTime, completedAt, JSON.stringify(context || {}), id], function(err) {

    res.json(rows);      if (err) {

  });        console.error('Database update error:', err);

});        return res.status(500).json({ error: 'Failed to update task' });

      }

app.get('/api/services/db/stats', (req, res) => {

  const stmt = db.prepare('SELECT COUNT(*) as total, COUNT(CASE WHEN status = "completed" THEN 1 END) as completed, COUNT(CASE WHEN status = "pending" THEN 1 END) as pending, COUNT(CASE WHEN status = "overdue" THEN 1 END) as overdue FROM tasks');      // Add to history

  stmt.get((err, row) => {      if (status && status !== row.status) {

    if (err) {        addHistory(id, 'status_changed', { from: row.status, to: status });

      console.error('Error fetching stats:', err);      }

      return res.status(500).json({ error: 'Failed to fetch stats' });

    }      res.json({

    res.json(row);        id,

  });        title,

});        description,

        category,

app.get('/api/services/db/health', (req, res) => {        priority,

  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });        status,

});        createdAt: row.createdAt,

        updatedAt,

app.post('/api/services/db/backup', (req, res) => {        dueDate,

  const backupPath = path.join(dbDir, `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);        tags: tags ? JSON.parse(tags) : [],

          estimatedTime: estimatedTime || null,

  db.serialize(() => {        actualTime: actualTime || null,

    db.backup(backupPath, (err) => {        completedAt,

      if (err) {        context: context ? JSON.parse(context) : {}

        console.error('Backup error:', err);      });

        return res.status(500).json({ error: 'Failed to create backup' });

      }    stmt.finalize();

      res.json({ message: 'Backup created successfully', path: backupPath });  });

    });});

  });

});app.delete('/api/tasks/:id', (req, res) => {

  const id = req.params.id;

// Background tasks  

// Check for overdue tasks every minute  // Check if task exists

cron.schedule('* * * * *', () => {  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {

  const now = new Date();    if (err) {

        console.error('Database query error:', err);

  // Check for tasks that are due but not completed      return res.status(500).json({ error: 'Database query failed' });

  const stmt = db.prepare('SELECT * FROM tasks WHERE status != "completed" AND status != "overdue" AND dueDate < ?');    }

  stmt.all([now.toISOString()], (err, tasks) => {    if (!row) {

    if (err) {      return res.status(404).json({ error: 'Task not found' });

      console.error('Error fetching overdue tasks:', err);    }

      return;

    }    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {

          if (err) {

    tasks.forEach(task => {        console.error('Database delete error:', err);

      console.log('Task is overdue:', task.id, task.title);        return res.status(500).json({ error: 'Failed to delete task' });

            }

      // Update task status to overdue

      const stmt = db.prepare('UPDATE tasks SET status = "overdue", updatedAt = ? WHERE id = ?');      // Add to history

      stmt.run([now.toISOString(), task.id]);      addHistory(id, 'deleted', { title: row.title });

      stmt.finalize();

            res.json({ success: true, changes: this.changes });

      // Add to history    });

      addHistory(task.id, 'status_changed', { from: task.status, to: 'overdue' });  });

      });

      // Create overdue notification

      const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8380';// Task history endpoints

      const notificationData = {app.get('/api/tasks/:id/history', (req, res) => {

        userId: 'user-1',  const id = req.params.id;

        title: '任务已过期: ' + task.title,  db.all('SELECT * FROM task_history WHERE taskId = ? ORDER BY timestamp DESC', [id], (err, rows) => {

        message: '任务 "' + task.title + '" 已经过期！',    if (err) {

        type: 'reminder',      console.error('Database query error:', err);

        priority: 'high',      return res.status(500).json({ error: 'Database query failed' });

        taskId: task.id    }

      };    res.json(rows.map(row => ({

            ...row,

      // Use fetch with proper error handling      details: row.details ? JSON.parse(row.details) : {}

      fetch(notificationServiceUrl + '/api/notifications', {    })));

        method: 'POST',  });

        headers: {});

          'Content-Type': 'application/json'

        },// Statistics endpoints

        body: JSON.stringify(notificationData)app.get('/api/stats', (req, res) => {

      }).then(response => {  const stats = {};

        if (!response.ok) {  

          throw new Error('Notification service responded with status: ' + response.status);  // Get task counts by status

        }  db.all('SELECT status, COUNT(*) as count FROM tasks GROUP BY status', (err, rows) => {

        return response.json();    if (err) {

      }).then(result => {      console.error('Database query error:', err);

        console.log('Overdue notification created successfully:', result);      return res.status(500).json({ error: 'Database query failed' });

      }).catch(err => {    }

        console.error('Failed to create overdue notification:', err);    

      });    stats.byStatus = rows.reduce((acc, row) => {

    });      acc[row.status] = row.count;

  });      return acc;

});    }, {});



// Start server    // Get task counts by category

app.listen(PORT, () => {    db.all('SELECT category, COUNT(*) as count FROM tasks GROUP BY category', (err, rows) => {

  console.log('Database Service running on port ' + PORT);      if (err) {

  console.log('Database initialized successfully');        console.error('Database query error:', err);

  console.log('Available endpoints:');        return res.status(500).json({ error: 'Database query failed' });

  console.log('  GET  /api/services/db/tasks');      }

  console.log('  GET  /api/services/db/tasks/:id');      

  console.log('  POST /api/services/db/tasks');      stats.byCategory = rows.reduce((acc, row) => {

  console.log('  PUT  /api/services/db/tasks/:id');        acc[row.category] = row.count;

  console.log('  DELETE /api/services/db/tasks/:id');        return acc;

  console.log('  GET  /api/services/db/tasks/:id/history');      }, {});

  console.log('  GET  /api/services/db/stats');

  console.log('  GET  /api/services/db/health');      // Get completion rate

  console.log('  POST /api/services/db/backup');      db.get('SELECT COUNT(*) as total, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed FROM tasks', (err, row) => {

          if (err) {

  if (process.env.NODE_ENV !== 'production') {          console.error('Database query error:', err);

    console.log('WebSocket running on port ' + (parseInt(PORT, 10) + 200));          return res.status(500).json({ error: 'Database query failed' });

  }        }

});        

        stats.completionRate = row.total > 0 ? (row.completed / row.total) * 100 : 0;

// Export the database for use in other modules if needed        stats.totalTasks = row.total;

module.exports = { db, app };

        res.json(stats);

// Handle graceful shutdown      });

process.on('SIGINT', () => {    });

  console.log('Shutting down gracefully...');  });

  process.exit(0);});

});

// Health check endpoint

process.on('SIGTERM', () => {app.get('/api/health', (req, res) => {

  console.log('Shutting down gracefully...');  healthStatus.lastCheck = new Date().toISOString();

  process.exit(0);  

});  // Test database connection
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

// Create task reminder
function createTaskReminder(task) {
  try {
    // Parse due date as Beijing time (UTC+8)
    const dueDateStr = task.dueDate;
    let dueDate;
    
    if (dueDateStr.includes('T')) {
      // If it's in format "YYYY-MM-DDTHH:mm", assume it's Beijing time
      const [datePart, timePart] = dueDateStr.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      // Create date in Beijing time (UTC+8)
      dueDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    } else {
      // Fallback to original parsing
      dueDate = new Date(task.dueDate);
    }
    
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    
    // Check if task is overdue and update status
    if (timeDiff < 0 && task.status !== 'completed') {
      console.log('Task is overdue, updating status to overdue');
      const stmt = db.prepare('UPDATE tasks SET status = "overdue", updatedAt = ? WHERE id = ?');
      stmt.run([new Date().toISOString(), task.id]);
      stmt.finalize();
      
      // Add to history
      addHistory(task.id, 'status_changed', { from: task.status, to: 'overdue' });
    }
    
    // Only create reminder if due date is in the future
    if (timeDiff > 0) {
      // Create reminder 1 minute before due date
      const reminderTime = new Date(dueDate.getTime() - 60000); // 1 minute before
      
      // Check if reminder is still in the future
      if (reminderTime.getTime() > now.getTime()) {
        // Send reminder to notification service
        const reminderData = {
          userId: 'user-1', // Default user for demo
          taskId: task.id,
          title: `??????: ${task.title}`,
          message: `??? "${task.title}" ????????,
          schedule: getCronSchedule(reminderTime),
          repeat: false
        };
        
        // Send to notification service
        const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8380';
        console.log('Creating reminder with URL:', notificationServiceUrl);
        console.log('Reminder details:', {
          userId: reminderData.userId,
          taskId: reminderData.taskId,
          title: reminderData.title,
          message: reminderData.message,
          schedule: reminderData.schedule,
          dueDate: task.dueDate,
          reminderTime: reminderTime.toISOString(),
          now: now.toISOString()
        });
        
        // Use fetch with proper error handling
        fetch(notificationServiceUrl + '/api/reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reminderData)
        }).then(response => {
          if (!response.ok) {
            throw new Error('Notification service responded with status: ' + response.status);
          }
          return response.json();
        }).then(result => {
          console.log('Reminder created successfully:', result);
        }).catch(err => {
          console.error('Failed to create reminder:', err);
        });
      }
    } else {
      // Task is already overdue, create immediate notification
      console.log('Task is already overdue, creating immediate notification');
      const reminderData = {
        userId: 'user-1',
        taskId: task.id,
        title: '任务已过期: ' + task.title,
        message: '任务 "' + task.title + '" 已经过期！',
        schedule: getCronSchedule(new Date()),
        repeat: false
      };
      
      const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8380';
      // Use fetch with proper error handling
      fetch(notificationServiceUrl + '/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reminderData)
      }).catch(err => {
        console.error('Failed to create overdue notification:', err);
      });
    }
  } catch (error) {
    console.error('Error creating reminder:', error);
  }
}

// Convert date to cron schedule
function getCronSchedule(date) {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1; // Month is 0-indexed
  const dayOfWeek = date.getDay();
  
  return minute + ' ' + hour + ' ' + day + ' ' + month + ' ' + dayOfWeek;
}

// Background tasks
// Check for overdue tasks every minute
cron.schedule('* * * * *', () => {
  const now = new Date();
  
  // Check for tasks that are overdue
  db.all('SELECT * FROM tasks WHERE status NOT IN ("completed", "overdue") AND dueDate IS NOT NULL', (err, rows) => {
    if (err) {
      console.error('Database query error:', err);
      return;
    }
    
    rows.forEach(task => {
      const dueDate = new Date(task.dueDate);
      if (now.getTime() > dueDate.getTime()) {
        console.log('Task is overdue:', task.id, task.title);
        
        // Update task status to overdue
        const stmt = db.prepare('UPDATE tasks SET status = "overdue", updatedAt = ? WHERE id = ?');
        stmt.run([new Date().toISOString(), task.id]);
        stmt.finalize();
        
        // Add to history
        addHistory(task.id, 'status_changed', { from: task.status, to: 'overdue' });
        
        // Create overdue notification
        const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8380';
        const notificationData = {
          userId: 'user-1',
          title: '任务已过期: ' + task.title,
          message: '任务 "' + task.title + '" 已经过期！',
          type: 'reminder',
          priority: 'high',
          taskId: task.id
        };
        
        // Use fetch with proper error handling
        fetch(notificationServiceUrl + '/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notificationData)
        }).then(response => {
          if (!response.ok) {
            throw new Error('Notification service responded with status: ' + response.status);
          }
          return response.json();
        }).then(result => {
          console.log('Overdue notification created successfully:', result);
        }).catch(err => {
          console.error('Failed to create overdue notification:', err);
        });
      }
    });
  });
  
  console.log('Checking overdue tasks...');
});

// Start server
app.listen(PORT, () => {
  console.log('Database Service running on port ' + PORT);
  console.log('Database initialized successfully');
  console.log('Available endpoints:');
  console.log('  GET  /api/services/db/tasks');
  console.log('  GET  /api/services/db/tasks/:id');
  console.log('  POST /api/services/db/tasks');
  console.log('  PUT  /api/services/db/tasks/:id');
  console.log('  DELETE /api/services/db/tasks/:id');
  console.log('  GET  /api/services/db/tasks/:id/history');
  console.log('  GET  /api/services/db/stats');
  console.log('  GET  /api/services/db/health');
  console.log('  POST /api/services/db/backup');
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('WebSocket running on port ' + (parseInt(PORT, 10) + 200));
  }
});

// Schedule overdue task check
cron.schedule('*/5 * * * *', () => {
  console.log('Checking overdue tasks...');
  const stmt = db.prepare('SELECT * FROM tasks WHERE status != "completed" AND status != "overdue" AND dueDate < ?');
  stmt.all([new Date().toISOString()], (err, tasks) => {
    if (err) {
      console.error('Error fetching overdue tasks:', err);
      return;
    }
    
    tasks.forEach(task => {
      console.log('Task is overdue:', task.id, task.title);
      
      // Update task status to overdue
      const stmt = db.prepare('UPDATE tasks SET status = "overdue", updatedAt = ? WHERE id = ?');
      stmt.run([new Date().toISOString(), task.id]);
      stmt.finalize();
      
      // Add to history
      addHistory(task.id, 'status_changed', { from: task.status, to: 'overdue' });
      
      // Create overdue notification
      const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8380';
      const notificationData = {
        userId: 'user-1',
        title: '任务已过期: ' + task.title,
        message: '任务 "' + task.title + '" 已经过期！',
        type: 'reminder',
        priority: 'high',
        taskId: task.id
      };
      
      // Use fetch with proper error handling
      fetch(notificationServiceUrl + '/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      }).then(response => {
        if (!response.ok) {
          throw new Error('Notification service responded with status: ' + response.status);
        }
        return response.json();
      }).then(result => {
        console.log('Overdue notification created successfully:', result);
      }).catch(err => {
        console.error('Failed to create overdue notification:', err);
      });
    });
  });
});

// Add a simple health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Add a simple stats endpoint
app.get('/api/stats', (req, res) => {
  const stmt = db.prepare('SELECT COUNT(*) as total, COUNT(CASE WHEN status = "completed" THEN 1 END) as completed, COUNT(CASE WHEN status = "pending" THEN 1 END) as pending, COUNT(CASE WHEN status = "overdue" THEN 1 END) as overdue FROM tasks');
  stmt.get((err, row) => {
    if (err) {
      console.error('Error fetching stats:', err);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
    res.json(row);
  });
});

// Export the database for use in other modules if needed
module.exports = { db, app };

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

