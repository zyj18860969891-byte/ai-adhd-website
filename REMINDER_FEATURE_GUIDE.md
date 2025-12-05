# ADHD Task Manager - 实时提醒功能说明

## 🎯 功能概述

ADHD Task Manager PWA 提供了**实时提醒功能**，帮助用户及时完成任务，特别适合 ADHD 用户的时间管理和任务提醒需求。

## ✅ 已实现的提醒功能

### 1. **自动任务提醒**
- ✅ **触发条件**: 创建任务时设置了截止日期
- ✅ **提醒时间**: 截止日期前 1 分钟
- ✅ **自动创建**: 无需手动设置，系统自动创建提醒

### 2. **通知系统**
- ✅ **WebSocket 实时通信**: 实时推送通知
- ✅ **通知角标**: 页面顶部显示未读通知数量
- ✅ **通知列表**: 可查看所有待处理通知
- ✅ **通知确认**: 可以标记通知为已读

### 3. **提醒管理**
- ✅ **提醒调度**: 基于 cron 的定时提醒
- ✅ **提醒存储**: 通知服务管理所有提醒
- ✅ **状态跟踪**: 通知状态实时更新

## 🔧 技术实现

### 1. **任务创建时自动添加提醒**
```javascript
// services/db-service/index.js
app.post('/api/tasks', (req, res) => {
  // ... 创建任务 ...
  
  // 如果设置了截止日期，创建提醒
  if (dueDate) {
    createTaskReminder(task);
  }
});
```

### 2. **提醒创建逻辑**
```javascript
// services/db-service/index.js
function createTaskReminder(task) {
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const timeDiff = dueDate.getTime() - now.getTime();
  
  // 提前 1 分钟提醒
  const reminderTime = new Date(dueDate.getTime() - 60000);
  
  if (reminderTime.getTime() > now.getTime()) {
    // 发送到通知服务
    fetch(`${NOTIFICATION_SERVICE_URL}/api/reminders`, {
      method: 'POST',
      body: JSON.stringify(reminderData)
    });
  }
}
```

### 3. **提醒调度**
```javascript
// services/notification-service/index.js
function scheduleReminder(reminder) {
  // 使用 cron 语法调度
  cron.schedule(reminder.schedule, () => {
    if (reminder.active) {
      // 发送通知
      const notification = {
        userId: reminder.userId,
        title: `任务提醒: ${reminder.title}`,
        message: `任务 "${reminder.title}" 即将到期！`,
        type: 'reminder',
        priority: 'high'
      };
      
      // 通过 WebSocket 发送
      clients.forEach(client => {
        if (client.userId === reminder.userId) {
          client.send(JSON.stringify({ type: 'notification', data: notification }));
        }
      });
    }
  });
}
```

### 4. **前端通知显示**
```javascript
// client/src/App.jsx
useEffect(() => {
  const loadNotifications = async () => {
    const userNotifications = await notificationService.getUserNotifications('user-1')
    setNotifications(userNotifications.filter(n => n.status === 'pending'))
  }

  loadNotifications()
  const interval = setInterval(loadNotifications, 30000) // 30秒刷新
  return () => clearInterval(interval)
}, [])

// 显示通知角标
<Badge badgeContent={notifications.length} color="secondary">
  <NotificationsIcon />
</Badge>
```

## 📱 用户界面

### 1. **任务创建界面**
- ✅ **截止日期字段**: 可设置任务截止时间
- ✅ **自动提醒**: 设置截止日期后自动创建提醒

### 2. **通知角标**
- ✅ **红色数字**: 显示未读通知数量
- ✅ **实时更新**: 30秒自动刷新

### 3. **通知列表**
- ✅ **待处理通知**: 显示所有未确认的通知
- ✅ **通知详情**: 显示通知标题和消息
- ✅ **确认功能**: 可以标记为已读

## 🧪 测试提醒功能

### 方法 1: 手动测试
1. 打开应用
2. 点击"添加任务"
3. 填写任务信息
4. 设置截止日期为 **1-2 分钟后**
5. 保存任务
6. 等待 1 分钟
7. 查看通知角标

### 方法 2: 使用测试脚本
```bash
# 运行快速测试
chmod +x scripts/quick-reminder-test.sh
./scripts/quick-reminder-test.sh
```

## 🎯 预期行为

### ✅ **应该看到的**
1. **任务创建成功**
2. **1 分钟后通知角标出现红色数字**
3. **点击通知图标可以看到提醒**
4. **提醒内容**: "任务提醒: [任务标题] - 任务即将到期！"

### ❌ **如果没看到**
1. 检查截止日期是否设置正确
2. 检查通知服务是否正常运行
3. 检查 WebSocket 连接
4. 查看浏览器控制台错误

## 🔍 故障排除

### 1. **没有收到提醒**
- ✅ 检查任务是否设置了截止日期
- ✅ 检查截止日期是否在未来
- ✅ 检查通知服务健康状态
- ✅ 查看服务日志

### 2. **通知角标不显示**
- ✅ 检查前端是否正确加载
- ✅ 检查 API 调用是否成功
- ✅ 查看浏览器网络请求

### 3. **WebSocket 连接问题**
- ✅ WebSocket 仅在开发环境启用
- ✅ 生产环境使用轮询（30秒间隔）
- ✅ 检查服务端口是否正确

## 📊 服务状态检查

### 通知服务健康检查
```bash
# 检查通知服务
curl https://ai-adhd-website-production.up.railway.app/api/services/notification/health

# 检查所有服务
curl https://ai-adhd-website-production.up.railway.app/api/services/notification/notifications/user-1
```

### 预期响应
```json
{
  "status": "healthy",
  "lastCheck": "2025-12-05T10:48:12.174Z",
  "version": "1.0.0",
  "activeClients": 0
}
```

## 🎉 总结

实时提醒功能已经**完全实现并可以正常使用**！

### ✅ **功能特点**
- 自动提醒（截止日期前1分钟）
- 实时通知（WebSocket + 轮询）
- 通知管理（查看、确认）
- 用户友好（红色角标提醒）

### 🎯 **使用场景**
- 任务即将到期提醒
- 重要任务及时处理
- ADHD 用户时间管理
- 减少任务遗漏

现在你可以测试这个功能了！创建一个设置截止日期的任务，等待提醒出现。⏰✨