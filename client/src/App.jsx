import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Badge, Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, TextField } from '@mui/material'
import { Menu as MenuIcon, Home as HomeIcon, Add as AddIcon, List as ListIcon, BarChart as ChartIcon, Notifications as NotificationsIcon, Settings as SettingsIcon, Check as CheckIcon, Schedule as ScheduleIcon } from '@mui/icons-material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Convert date to cron schedule (Beijing timezone)
function getCronSchedule(date) {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1; // Month is 0-indexed
  const dayOfWeek = date.getDay();
  
  return `${minute} ${hour} ${day} ${month} ${dayOfWeek}`;
}

// Import pages
import Home from './pages/Home.jsx'
import TaskBoard from './pages/TaskBoard.jsx'
import AddTask from './pages/AddTask.jsx'
import EditTask from './pages/EditTask.jsx'
import Analytics from './pages/Analytics.jsx'
import Settings from './pages/Settings.jsx'

// Import icons (already imported above)

// Import services
import taskService from './services/taskService.js'
import notificationService from './services/notificationService.js'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [taskProgress, setTaskProgress] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('info')
  const [currentNotification, setCurrentNotification] = useState(null)
  const [deferDialogOpen, setDeferDialogOpen] = useState(false)
  const [deferOption, setDeferOption] = useState('1')
  const [customDeferHours, setCustomDeferHours] = useState('')

  // Confirm defer with selected option
  const confirmDefer = () => {
    console.log('⏰ [confirmDefer] Starting confirm defer function');
    console.log('⏰ [confirmDefer] Current notification:', currentNotification);
    console.log('⏰ [confirmDefer] Current notification type:', typeof currentNotification);
    console.log('⏰ [confirmDefer] Current notification keys:', Object.keys(currentNotification || {}));
    console.log('⏰ [confirmDefer] Defer option:', deferOption);
    console.log('⏰ [confirmDefer] Custom hours:', customDeferHours);
    
    if (!currentNotification) {
      console.error('❌ [confirmDefer] No valid notification object');
      setSnackbarMessage('无效的通知')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }
    
    // If it's a task object (from Home.jsx), use taskId directly
    const taskId = currentNotification.taskId || currentNotification.id;
    console.log('⏰ [confirmDefer] Determined taskId:', taskId);
    console.log('⏰ [confirmDefer] currentNotification.taskId:', currentNotification?.taskId);
    console.log('⏰ [confirmDefer] currentNotification.id:', currentNotification?.id);
    
    if (!taskId) {
      console.error('❌ [confirmDefer] No valid taskId');
      console.error('❌ [confirmDefer] currentNotification:', currentNotification);
      console.error('❌ [confirmDefer] currentNotification.taskId:', currentNotification?.taskId);
      console.error('❌ [confirmDefer] currentNotification.id:', currentNotification?.id);
      setSnackbarMessage('无效的任务ID')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }
    
    try {
      let deferHours;
      
      if (deferOption === 'custom') {
        deferHours = parseInt(customDeferHours);
        console.log('⏰ [confirmDefer] Custom defer hours parsed:', deferHours);
      } else {
        deferHours = parseInt(deferOption);
        console.log('⏰ [confirmDefer] Standard defer hours:', deferHours);
      }
      
      if (isNaN(deferHours) || deferHours <= 0) {
        console.error('❌ [confirmDefer] Invalid defer hours:', deferHours);
        setSnackbarMessage('请输入有效的延期时间')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
        return
      }
      
      console.log('✅ [confirmDefer] Valid defer hours:', deferHours);
      
      const newDueDate = new Date()
      newDueDate.setHours(newDueDate.getHours() + deferHours)
      console.log('⏰ [confirmDefer] New due date:', newDueDate.toISOString());
      
      // Update task due date
      console.log('🔄 [confirmDefer] Updating task due date...');
      taskService.updateTask(taskId, { 
        dueDate: newDueDate.toISOString()
      }).then(async () => {
        console.log('✅ [confirmDefer] Task due date updated successfully');
        
        // Acknowledge notification if it has an id (not a task object)
        if (currentNotification.id) {
          console.log('🔄 [confirmDefer] Acknowledging notification...');
          await notificationService.acknowledgeNotification(currentNotification.id)
          console.log('✅ [confirmDefer] Notification acknowledged successfully');
        } else {
          console.log('✅ [confirmDefer] Task object from Home.jsx, no notification to acknowledge');
        }
        
        // Close dialogs
        setDeferDialogOpen(false)
        setCurrentNotification(null)
        
        // Show success message
        setSnackbarMessage(`任务已延期 ${deferHours} 小时！`)
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
        
        // Refresh notifications
        console.log('🔄 [confirmDefer] Refreshing notifications...');
        notificationService.getUserNotifications('user-1').then(userNotifications => {
          const pendingNotifications = userNotifications.filter(n => n.status === 'pending')
          setNotifications(pendingNotifications)
          console.log('✅ [confirmDefer] Notifications refreshed, count:', pendingNotifications.length);
        }).catch(error => {
          console.error('❌ [confirmDefer] Failed to refresh notifications:', error);
        });
      }).catch(error => {
        console.error('❌ [confirmDefer] Failed to defer task:', error)
        console.error('❌ [confirmDefer] Error details:', error.response || error.message || error);
        setSnackbarMessage('延期任务失败')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      });
    } catch (error) {
      console.error('❌ [confirmDefer] Failed to defer task:', error)
      console.error('❌ [confirmDefer] Error details:', error.response || error.message || error);
      setSnackbarMessage('延期任务失败')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  // Handle task complete
  const handleTaskComplete = (notification) => {
    console.log('✅ [handleTaskComplete] Starting task complete handler');
    console.log('✅ [handleTaskComplete] Input notification:', notification);
    console.log('✅ [handleTaskComplete] Input notification type:', typeof notification);
    console.log('✅ [handleTaskComplete] Input notification keys:', Object.keys(notification || {}));
    
    // Check if this is a task object (from Home.jsx) or notification object (from modal)
    if (!notification) {
      console.error('❌ [handleTaskComplete] No notification object provided');
      setSnackbarMessage('无效的通知')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }
    
    // Handle string taskId (from button click)
    if (typeof notification === 'string') {
      console.log('✅ [handleTaskComplete] Handling string taskId:', notification);
      const taskNotification = {
        id: notification,
        taskId: notification,
        title: notification,
        message: `完成任务: ${notification}`,
        type: 'reminder',
        status: 'pending'
      };
      console.log('✅ [handleTaskComplete] Created taskNotification:', taskNotification);
      setCurrentNotification(taskNotification);
      setSnackbarOpen(true);
      return;
    }
    
    // If it's a task object (has taskId property), handle it directly
    if (notification.taskId) {
      console.log('✅ [handleTaskComplete] Handling task completion from Home.jsx');
      const taskId = notification.taskId;
      const taskTitle = notification.title || notification.id; // Fallback to id if title is not provided
      
      // Update task status to completed
      taskService.updateTask(taskId, { 
        status: 'completed',
        completedAt: new Date().toISOString()
      }).then(async () => {
        console.log('✅ [handleTaskComplete] Task status updated successfully');
        
        // Show success message
        setSnackbarMessage(`任务 "${taskTitle}" 已完成！`)
        setSnackbarSeverity('success')
        setSnackbarOpen(true)
        
        // Refresh notifications
        console.log('🔄 [handleTaskComplete] Refreshing notifications...');
        notificationService.getUserNotifications('user-1').then(userNotifications => {
          const pendingNotifications = userNotifications.filter(n => n.status === 'pending')
          setNotifications(pendingNotifications)
          console.log('✅ [handleTaskComplete] Notifications refreshed, count:', pendingNotifications.length);
        }).catch(error => {
          console.error('❌ [handleTaskComplete] Failed to refresh notifications:', error);
        });
      }).catch(error => {
        console.error('❌ [handleTaskComplete] Failed to complete task:', error)
        console.error('❌ [handleTaskComplete] Error details:', error.response || error.message || error);
        setSnackbarMessage('完成任务失败')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      });
      return;
    }
    
    // If it's a notification object (has id property), handle it as before
    if (!notification.id) {
      console.error('❌ [handleTaskComplete] No valid notification id');
      console.error('❌ [handleTaskComplete] notification:', notification);
      console.error('❌ [handleTaskComplete] notification.id:', notification?.id);
      console.error('❌ [handleTaskComplete] notification.taskId:', notification?.taskId);
      setSnackbarMessage('无效的通知')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }
    
    // Update task status to completed
    taskService.updateTask(notification.taskId, { 
      status: 'completed',
      completedAt: new Date().toISOString()
    }).then(async () => {
      console.log('✅ [handleTaskComplete] Task status updated successfully');
      
      // Acknowledge notification
      await notificationService.acknowledgeNotification(notification.id)
      console.log('✅ [handleTaskComplete] Notification acknowledged successfully');
      
      // Close dialogs
      setSnackbarOpen(false)
      setCurrentNotification(null)
      
      // Show success message
      setSnackbarMessage('任务已完成！')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      
      // Refresh notifications
      console.log('🔄 [handleTaskComplete] Refreshing notifications...');
      notificationService.getUserNotifications('user-1').then(userNotifications => {
        const pendingNotifications = userNotifications.filter(n => n.status === 'pending')
        setNotifications(pendingNotifications)
        console.log('✅ [handleTaskComplete] Notifications refreshed, count:', pendingNotifications.length);
      }).catch(error => {
        console.error('❌ [handleTaskComplete] Failed to refresh notifications:', error);
      });
    }).catch(error => {
      console.error('❌ [handleTaskComplete] Failed to complete task:', error)
      console.error('❌ [handleTaskComplete] Error details:', error.response || error.message || error);
      setSnackbarMessage('完成任务失败')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    });
  }

  // Handle task defer
  const handleTaskDefer = (notification) => {
    console.log('⏰ Starting handleTaskDefer function');
    console.log('Notification:', notification);
    console.log('Notification type:', typeof notification);
    console.log('Notification ID:', notification?.id);
    console.log('Notification Task ID:', notification?.taskId);
    
    if (!notification) {
      console.error('❌ No notification object provided');
      setSnackbarMessage('无效的通知')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }
    
    // If it's a task object (has taskId property), handle it directly
    if (notification.taskId) {
      console.log('✅ Handling task defer from Home.jsx');
      // For Home.jsx, we need to create a notification object
      const taskNotification = {
        id: notification.taskId, // Use taskId as id for modal
        taskId: notification.taskId,
        title: notification.title || notification.id, // Fallback to id if title is not provided
        message: `延期任务: ${notification.title || notification.id}`,
        type: 'reminder',
        status: 'pending'
      };
      setCurrentNotification(taskNotification);
      setDeferDialogOpen(true);
      return;
    }
    
    // If it's a notification object (has id property), handle it as before
    if (!notification.id || !notification.taskId) {
      console.error('❌ No valid notification or taskId');
      setSnackbarMessage('无效的通知')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }
    
    console.log('⏰ [handleTaskDefer] Starting task defer handler');
    console.log('⏰ [handleTaskDefer] Input notification:', notification);
    console.log('⏰ [handleTaskDefer] Input notification type:', typeof notification);
    console.log('⏰ [handleTaskDefer] Input notification keys:', Object.keys(notification || {}));
    console.log('⏰ [handleTaskDefer] Input notification id:', notification?.id);
    console.log('⏰ [handleTaskDefer] Input notification taskId:', notification?.taskId);
    console.log('⏰ [handleTaskDefer] Input notification title:', notification?.title);
    
    // Handle string taskId (from button click)
    if (typeof notification === 'string') {
      console.log('⏰ [handleTaskDefer] Handling string taskId:', notification);
      const taskNotification = {
        id: notification,
        taskId: notification,
        title: notification,
        message: `延期任务: ${notification}`,
        type: 'reminder',
        status: 'pending'
      };
      console.log('⏰ [handleTaskDefer] Created taskNotification:', taskNotification);
      setCurrentNotification(taskNotification);
      setDeferDialogOpen(true);
      return;
    }

    
    // Handle notification object
    if (!notification || !notification.id || !notification.taskId) {
      console.error('❌ [handleTaskDefer] No valid notification or taskId');
      console.error('❌ [handleTaskDefer] notification:', notification);
      console.error('❌ [handleTaskDefer] notification.id:', notification?.id);
      console.error('❌ [handleTaskDefer] notification.taskId:', notification?.taskId);
      setSnackbarMessage('无效的通知')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      return
    }
    
    console.log('⏰ [handleTaskDefer] Valid notification object, setting current notification');
    console.log('⏰ [handleTaskDefer] notification.id:', notification.id);
    console.log('⏰ [handleTaskDefer] notification.taskId:', notification.taskId);
    console.log('⏰ [handleTaskDefer] notification.title:', notification.title);
    setCurrentNotification(notification)
    setDeferDialogOpen(true)
  }

  // Load notifications
  useEffect(() => {
    let isMounted = true;
    
    const loadNotifications = async () => {
      try {
        console.log('📥 Loading notifications...');
        const userNotifications = await notificationService.getUserNotifications('user-1')
        console.log('📥 All notifications from server:', userNotifications);
        console.log('📥 Server response type:', typeof userNotifications);
        console.log('📥 Server response length:', Array.isArray(userNotifications) ? userNotifications.length : 'Not an array');
        
        // Check if response is valid
        if (!userNotifications || !Array.isArray(userNotifications)) {
          console.log('📥 Invalid notifications response, using empty array');
          if (isMounted) setNotifications([]);
          return;
        }
        
        const pendingNotifications = userNotifications.filter(n => n.status === 'pending')
        console.log('📥 Pending notifications count:', pendingNotifications.length);
        console.log('📥 Pending notifications:', pendingNotifications);
        
        // Check for new notifications by comparing with previous state
        const newNotifications = pendingNotifications.filter(n => 
          !notifications.find(existing => existing.id === n.id)
        )
        console.log('📥 New notifications count:', newNotifications.length);
        console.log('📥 New notifications:', newNotifications);
        
        // Only update if there are changes
        if (JSON.stringify(pendingNotifications) !== JSON.stringify(notifications)) {
          console.log('📥 Updating notifications state - changes detected');
          console.log('📥 Old notifications:', notifications);
          console.log('📥 New notifications:', pendingNotifications);
          if (isMounted) setNotifications(pendingNotifications)
        } else {
          console.log('📥 No notification changes detected');
          console.log('📥 Old notifications:', notifications);
          console.log('📥 New notifications:', pendingNotifications);
        }
        
        // Show modal for new reminders
        if (newNotifications.length > 0) {
          console.log('🔔 Found', newNotifications.length, 'new notifications');
          console.log('🔔 New notifications details:', newNotifications);
          // 使用 requestAnimationFrame 优化性能
          if (isMounted) {
            requestAnimationFrame(() => {
              newNotifications.forEach(notification => {
                console.log('🔔 Processing notification:', notification.id, 'type:', notification.type);
                if (notification.type === 'reminder') {
                  console.log('🔔 New reminder detected:', notification.message);
                  console.log('🔔 Setting snackbar message:', notification.message);
                  setSnackbarMessage(notification.message)
                  console.log('🔔 Setting current notification:', notification.id);
                  setCurrentNotification(notification)
                  console.log('🔔 Opening snackbar modal');
                  setSnackbarOpen(true)
                  console.log('🔔 Modal opened for new reminder');
                } else {
                  console.log('🔔 Notification is not a reminder, skipping');
                }
              })
            });
          }
        } else {
          console.log('🔔 No new notifications found');
          console.log('🔔 Pending notifications:', pendingNotifications);
          console.log('🔔 Current notifications:', notifications);
          console.log('🔔 Notifications comparison:', JSON.stringify(pendingNotifications) === JSON.stringify(notifications));
        }
        
        // Show browser notification for new reminders
        newNotifications.forEach(notification => {
          if (notification.type === 'reminder' && 
              'Notification' in window && 
              Notification.permission === 'granted') {
            console.log('🌐 Showing browser notification:', notification.title);
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icons/icon-72x72.png'
            })
          } else if (notification.type === 'reminder') {
            console.log('🌐 Browser notification not shown - permission:', 
              'Notification' in window ? Notification.permission : 'Not supported');
          }
        })
        
        // Debug the current state
        debugNotificationState();
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load notifications:', error)
          console.error('Error details:', error.response || error.message || error);
        }
      }
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      console.log('🌐 Requesting notification permission...');
      Notification.requestPermission()
    }

    loadNotifications()
    // 优化轮询频率，避免性能问题
    const interval = setInterval(async () => {
      if (isMounted) {
        await loadNotifications();
      }
    }, 5000) // 减少到5秒一次
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    }
  }, [])

  // Auto-show modal when notifications change (for cross-page reminders)
  useEffect(() => {
    // 防止重复触发和性能问题
    if (!notifications || notifications.length === 0) {
      return;
    }
    
    console.log('🔄 Notifications changed:', notifications.length);
    console.log('🔄 Snackbar open status:', snackbarOpen);
    
    // 只处理最新的通知
    const latestNotification = notifications[notifications.length - 1];
    console.log('🔄 Latest notification:', latestNotification?.id);
    console.log('🔄 Latest notification type:', latestNotification?.type);
    console.log('🔄 Latest notification status:', latestNotification?.status);
    
    if (latestNotification && latestNotification.type === 'reminder' && latestNotification.status === 'pending') {
      console.log('🔄 Auto-showing reminder modal for:', latestNotification.message);
      console.log('🔄 Setting snackbar message:', latestNotification.message);
      
      // 使用 requestAnimationFrame 优化性能
      requestAnimationFrame(() => {
        setSnackbarMessage(latestNotification.message);
        setCurrentNotification(latestNotification);
        setSnackbarOpen(true);
        console.log('🔄 Modal opened successfully');
      });
    } else {
      console.log('🔄 Latest notification is not a reminder or is null or not pending');
      if (latestNotification) {
        console.log('🔄 Notification type is:', latestNotification.type);
        console.log('🔄 Notification status is:', latestNotification.status);
      }
    }
  }, [notifications, snackbarOpen])

  // Debug function to check notification state
  const debugNotificationState = () => {
    console.log('=== DEBUG NOTIFICATION STATE ===');
    console.log('Current notifications:', notifications);
    console.log('Snackbar open:', snackbarOpen);
    console.log('Current notification:', currentNotification);
    console.log('Pending notifications count:', notifications.filter(n => n.status === 'pending').length);
    console.log('Reminder notifications count:', notifications.filter(n => n.type === 'reminder').length);
    console.log('=== END DEBUG ===');
  }

  // Test function to create a test notification has been removed as the test page is no longer needed

  // Manual refresh function
  const refreshNotifications = async () => {
    try {
      console.log('🔄 Manually refreshing notifications...');
      const userNotifications = await notificationService.getUserNotifications('user-1');
      console.log('🔄 Manual refresh result:', userNotifications);
      
      const pendingNotifications = userNotifications.filter(n => n.status === 'pending');
      setNotifications(pendingNotifications);
      
      setSnackbarMessage('Notifications refreshed manually');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('🔄 Failed to refresh notifications:', error);
      setSnackbarMessage('Failed to refresh notifications');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }

  // Load task progress
  useEffect(() => {
    const loadTaskProgress = async () => {
      try {
        const progress = await taskService.getTaskProgress()
        setTaskProgress(progress)
      } catch (error) {
        console.error('Failed to load task progress:', error)
      }
    }

    loadTaskProgress()
    const interval = setInterval(loadTaskProgress, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const menuItems = [
    { text: '首页', icon: <HomeIcon />, path: '/' },
    { text: '任务看板', icon: <ListIcon />, path: '/tasks' },
    { text: '添加任务', icon: <AddIcon />, path: '/add' },
    { text: '数据分析', icon: <ChartIcon />, path: '/analytics' },
    { text: '设置', icon: <SettingsIcon />, path: '/settings' }
  ]

  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <div style={{ display: 'flex' }}>
        {/* AppBar */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              ADHD Task Manager
            </Typography>

            <Button 
              color="inherit" 
              onClick={refreshNotifications}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>

            <Badge badgeContent={notifications.length} color="secondary">
              <NotificationsIcon 
                onClick={(e) => {
                  console.log('🔔 NotificationsIcon clicked!');
                  console.log('Notifications count:', notifications.length);
                  console.log('Notifications array:', notifications);
                  console.log('Snackbar open status:', snackbarOpen);
                  
                  if (notifications.length > 0) {
                    console.log('🔔 Showing notification:', notifications[0].id);
                    console.log('🔔 Notification message:', notifications[0].message);
                    console.log('🔔 Notification details:', notifications[0]);
                    // 如果有未读通知，显示第一个
                    setSnackbarMessage(notifications[0].message);
                    setCurrentNotification(notifications[0]);
                    setSnackbarOpen(true);
                    console.log('🔔 Snackbar opened with message:', notifications[0].message);
                  } else {
                    console.log('🔔 No notifications to show');
                    setSnackbarMessage('暂无新通知');
                    setSnackbarSeverity('info');
                    setSnackbarOpen(true);
                  }
                }}
                style={{ cursor: 'pointer' }}
                title="点击查看提醒"
              />
            </Badge>
          </Toolbar>
        </AppBar>

        {/* Notification Modal - Always on top */}
        <Dialog
          open={snackbarOpen}
          onClose={() => setSnackbarOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 24,
              p: 2
            }
          }}
        >
          <DialogTitle>
            <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            任务提醒
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {snackbarMessage}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              请选择如何处理这个任务
            </Typography>
            
            <RadioGroup
              value={deferOption}
              onChange={(e) => setDeferOption(e.target.value)}
              sx={{ mb: 2 }}
            >
              <FormControlLabel 
                value="1" 
                control={<Radio />} 
                label="延期 1 小时" 
              />
              <FormControlLabel 
                value="2" 
                control={<Radio />} 
                label="延期 2 小时" 
              />
              <FormControlLabel 
                value="4" 
                control={<Radio />} 
                label="延期 4 小时" 
              />
              <FormControlLabel 
                value="24" 
                control={<Radio />} 
                label="延期 1 天" 
              />
              <FormControlLabel 
                value="custom" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    自定义延期时间
                    <TextField
                      size="small"
                      type="number"
                      value={customDeferHours}
                      onChange={(e) => setCustomDeferHours(e.target.value)}
                      placeholder="小时数"
                      sx={{ width: 120 }}
                    />
                  </Box>
                }
              />
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                console.log('✅ Mark as complete button clicked');
                console.log('Current notification:', currentNotification);
                console.log('Current notification type:', typeof currentNotification);
                console.log('Current notification keys:', Object.keys(currentNotification || {}));
                handleTaskComplete(currentNotification);
                console.log('✅ Complete operation finished');
              }}
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
            >
              标记为已完成
            </Button>
            <Button 
              onClick={() => {
                console.log('⏰ Defer task button clicked');
                console.log('Current notification:', currentNotification);
                console.log('Current notification type:', typeof currentNotification);
                console.log('Current notification keys:', Object.keys(currentNotification || {}));
                handleTaskDefer(currentNotification);
                console.log('⏰ Defer operation started');
              }}
              variant="contained"
              color="warning"
              startIcon={<ScheduleIcon />}
            >
              延期任务
            </Button>
            <Button 
              onClick={() => {
                console.log('⏰ Snooze button clicked');
                setSnackbarOpen(false);
              }}
              variant="outlined"
            >
              稍后提醒
            </Button>
          </DialogActions>
        </Dialog>

        {/* Defer Dialog */}
        <Dialog
          open={deferDialogOpen}
          onClose={() => setDeferDialogOpen(false)}
        >
          <DialogTitle>延期任务</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              请选择延期时间：
            </Typography>
            <RadioGroup
              value={deferOption}
              onChange={(e) => setDeferOption(e.target.value)}
            >
              <FormControlLabel value="1" control={<Radio />} label="1小时后" />
              <FormControlLabel value="2" control={<Radio />} label="2小时后" />
              <FormControlLabel value="4" control={<Radio />} label="4小时后" />
              <FormControlLabel value="24" control={<Radio />} label="1天后" />
              <FormControlLabel value="custom" control={<Radio />} label="自定义小时数：" />
            </RadioGroup>
            {deferOption === 'custom' && (
              <TextField
                autoFocus
                margin="dense"
                label="小时数"
                type="number"
                fullWidth
                value={customDeferHours}
                onChange={(e) => setCustomDeferHours(e.target.value)}
                inputProps={{ min: 1, step: 1 }}
                placeholder="请输入小时数"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                console.log('❌ Cancel button clicked');
                setDeferDialogOpen(false);
              }}
            >
              取消
            </Button>
            <Button 
              onClick={() => {
                console.log('✅ Confirm defer button clicked');
                console.log('Current notification:', currentNotification);
                console.log('Defer option:', deferOption);
                console.log('Custom hours:', customDeferHours);
                
                confirmDefer();
                console.log('✅ Defer operation completed successfully');
              }} 
              variant="contained" 
              color="primary"
            >
              确认延期
            </Button>
          </DialogActions>
        </Dialog>

        {/* Drawer */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }
          }}
        >
          <Toolbar />
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} component="a" href={item.path}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: 8 }}>
          <Container maxWidth="lg">
            <Routes>
              <Route path="/" element={<Home taskProgress={taskProgress} onTaskAction={handleTaskComplete} />} />
              <Route path="/tasks" element={<TaskBoard />} />
              <Route path="/add" element={<AddTask />} />
              <Route path="/edit/:id" element={<EditTask />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>
      </div>
    </ThemeProvider>
  )
}

export default App