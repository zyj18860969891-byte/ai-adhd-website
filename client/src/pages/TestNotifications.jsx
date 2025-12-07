import React, { useState } from 'react'
import { Container, Box, Typography, Button, TextField, Alert, Stack } from '@mui/material'
import { Schedule as ScheduleIcon, Notifications as NotificationsIcon, Check as CheckIcon } from '@mui/icons-material'
import taskService from '../services/taskService.js'
import notificationService from '../services/notificationService.js'
import axios from 'axios'

// Ensure API_BASE ends with /api for backward compatibility
const getApiBase = () => {
  const base = import.meta.env.VITE_API_BASE_URL
  if (base) {
    // If VITE_API_BASE_URL is set, ensure it ends with /api
    const normalized = base.replace(/\/+$/, '') // Remove trailing slashes
    if (normalized.endsWith('/api')) {
      return normalized
    }
    return `${normalized}/api`
  }
  // For development, use relative path
  return '/api'
}

function TestNotifications() {
  const [testTask, setTestTask] = useState({
    title: 'Test Task for Notifications',
    description: 'This is a test task to verify notification system works',
    priority: 'high',
    dueDate: new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16), // 5 minutes from now
    estimatedTime: 30,
    category: 'test'
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  // Create test task with notification
  const createTestTask = async () => {
    try {
      setMessage('Creating test task...')
      setMessageType('info')

      const task = await taskService.createTask(testTask)
      console.log('Test task created:', task)

      // Create notification for the task
      const notification = {
        userId: 'user-1',
        type: 'reminder',
        title: 'Test Task Reminder',
        message: `Time to work on: ${task.title}`,
        taskId: task.id,
        schedule: '*/1 * * * *', // Every minute
        repeat: false
      }

      const result = await notificationService.sendNotification(notification)
      console.log('Test notification created:', result)

      setMessage('Test task and notification created successfully!')
      setMessageType('success')
    } catch (error) {
      console.error('Failed to create test task:', error)
      setMessage('Failed to create test task')
      setMessageType('error')
    }
  }

  // Create immediate notification
  const createImmediateNotification = async () => {
    try {
      setMessage('Creating immediate notification...')
      setMessageType('info')

      const notification = {
        userId: 'user-1',
        type: 'reminder',
        title: 'Immediate Test Reminder',
        message: 'This is an immediate test notification!',
        taskId: 'immediate-test',
        schedule: '* * * * *', // Every minute
        repeat: false
      }

      const result = await notificationService.sendNotification(notification)
      console.log('Immediate notification created:', result)

      setMessage('Immediate notification created successfully!')
      setMessageType('success')
    } catch (error) {
      console.error('Failed to create immediate notification:', error)
      setMessage('Failed to create immediate notification')
      setMessageType('error')
    }
  }

  // Clear all notifications
  const clearNotifications = async () => {
    try {
      setMessage('Clearing notifications...')
      setMessageType('info')

      const userNotifications = await notificationService.getUserNotifications('user-1')
      console.log('All notifications:', userNotifications)

      // Delete all notifications
      for (const notification of userNotifications) {
        await axios.delete(`${getApiBase()}/services/notification/notifications/${notification.id}`)
      }

      setMessage('All notifications cleared!')
      setMessageType('success')
    } catch (error) {
      console.error('Failed to clear notifications:', error)
      setMessage('Failed to clear notifications')
      setMessageType('error')
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Test Notifications
        </Typography>
        
        <Typography variant="body1" paragraph>
          This page allows you to test the notification system by creating test tasks and notifications.
        </Typography>

        {message && (
          <Alert severity={messageType} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Create Test Task
            </Typography>
            <Typography variant="body2" paragraph>
              Creates a test task with a due date 5 minutes from now, which should trigger a notification.
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Task Title"
                value={testTask.title}
                onChange={(e) => setTestTask({ ...testTask, title: e.target.value })}
              />
              <TextField
                fullWidth
                label="Task Description"
                value={testTask.description}
                onChange={(e) => setTestTask({ ...testTask, description: e.target.value })}
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Due Date"
                type="datetime-local"
                value={testTask.dueDate}
                onChange={(e) => setTestTask({ ...testTask, dueDate: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={createTestTask}
                sx={{ mt: 2 }}
              >
                Create Test Task with Notification
              </Button>
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Create Immediate Notification
            </Typography>
            <Typography variant="body2" paragraph>
              Creates an immediate notification that should appear right away.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<NotificationsIcon />}
              onClick={createImmediateNotification}
            >
              Create Immediate Notification
            </Button>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Clear Notifications
            </Typography>
            <Typography variant="body2" paragraph>
              Deletes all existing notifications for testing purposes.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={clearNotifications}
            >
              Clear All Notifications
            </Button>
          </Box>
        </Stack>
      </Box>
    </Container>
  )
}

export default TestNotifications