const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

console.log('删除所有测试任务和通知...');

// 删除测试任务
db.run('DELETE FROM tasks WHERE title LIKE "%测试任务%"', function(err) {
  if (err) {
    console.error('删除任务失败:', err);
  } else {
    console.log('成功删除', this.changes, '个测试任务');
  }
});

// 删除测试通知
db.run('DELETE FROM notifications WHERE title LIKE "%测试任务%" OR title LIKE "%系统测试%"', function(err) {
  if (err) {
    console.error('删除通知失败:', err);
  } else {
    console.log('成功删除', this.changes, '个测试通知');
  }
});

db.close(() => {
  console.log('数据库连接已关闭');
});