import fetch from 'node-fetch';

async function clearTestNotifications() {
  const NOTIFICATION_SERVICE_URL = 'http://localhost:8380';
  const DB_SERVICE_URL = 'http://localhost:3002'; // db-service port

  try {
    // Step 1: Get all notifications
    console.log('Fetching all notifications...');
    const notificationResponse = await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/user-1`);
    const notifications = await notificationResponse.json();
    
    console.log(`Found ${notifications.length} notifications`);
    
    // Step 2: Filter notifications with null taskId and type 'reminder'
    const testNotifications = notifications.filter(n => n.taskId === null && n.type === 'reminder');
    
    console.log(`Found ${testNotifications.length} test notifications to delete`);
    
    // Step 3: Delete each test notification
    for (const notification of testNotifications) {
      console.log(`Deleting notification ${notification.id}: ${notification.message}`);
      await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/${notification.id}`, {
        method: 'DELETE'
      });
      console.log(`✅ Deleted notification ${notification.id}`);
    }
    
    console.log('✅ All test notifications have been cleared!');
    
    // Step 4: Get all tasks
    console.log('\nFetching all tasks...');
    const taskResponse = await fetch(`${DB_SERVICE_URL}/api/tasks`);
    const tasks = await taskResponse.json();
    
    console.log(`Found ${tasks.length} tasks`);
    
    // Step 5: Filter tasks with title containing '测试任务'
    const testTasks = tasks.filter(t => t.title.includes('测试任务'));
    
    console.log(`Found ${testTasks.length} test tasks to delete`);
    
    // Step 6: Delete each test task
    for (const task of testTasks) {
      console.log(`Deleting task ${task.id}: ${task.title}`);
      await fetch(`${DB_SERVICE_URL}/api/tasks/${task.id}`, {
        method: 'DELETE'
      });
      console.log(`✅ Deleted task ${task.id}`);
    }
    
    console.log('✅ All test tasks have been cleared!');
    
  } catch (error) {
    console.error('❌ Failed to clear test data:', error);
  }
}

clearTestNotifications();