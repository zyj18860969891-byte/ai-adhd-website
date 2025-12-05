const fetch = require('node-fetch');

async function testReminder() {
  console.log('Testing reminder functionality...');
  
  // Test 1: Create a task with due date
  const taskData = {
    id: `task_${Date.now()}`,
    title: '测试提醒任务',
    description: '这是一个测试任务',
    category: '工作',
    priority: '高优先级',
    dueDate: new Date(Date.now() + 65000).toISOString(), // 1 minute and 5 seconds from now
    tags: ['测试'],
    estimatedTime: 30
  };
  
  console.log('Creating task with due date:', taskData.dueDate);
  
  try {
    const response = await fetch('http://localhost:8280/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    });
    
    const result = await response.json();
    console.log('Task created:', result);
    
    if (response.ok) {
      console.log('✅ Task created successfully');
      console.log('✅ Reminder should be created automatically');
      console.log('Wait for 1 minute to see if reminder appears...');
      
      // Wait and check for reminders
      setTimeout(async () => {
        console.log('Checking for notifications...');
        const notifResponse = await fetch('http://localhost:8380/api/notifications/user-1');
        const notifications = await notifResponse.json();
        console.log('Notifications:', notifications);
        
        if (notifications.length > 0) {
          console.log('✅ Reminder created successfully!');
        } else {
          console.log('❌ No reminders found');
        }
      }, 70000); // Wait 70 seconds
      
    } else {
      console.log('❌ Failed to create task:', result);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testReminder();