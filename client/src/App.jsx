import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Badge, Snackbar, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, TextField } from '@mui/material'
import { Menu as MenuIcon, Home as HomeIcon, Add as AddIcon, List as ListIcon, BarChart as ChartIcon, Notifications as NotificationsIcon, Settings as SettingsIcon } from '@mui/icons-material'
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
import Analytics from './pages/Analytics.jsx'
import Settings from './pages/Settings.jsx'

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

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const userNotifications = await notificationService.getUserNotifications('user-1')
        const pendingNotifications = userNotifications.filter(n => n.status === 'pending')
        
        // Check for new notifications
        const newNotifications = pendingNotifications.filter(n => 
          !notifications.find(existing => existing.id === n.id)
        )
        
        setNotifications(pendingNotifications)
        
        // Show snackbar for new reminders
        newNotifications.forEach(notification => {
          if (notification.type === 'reminder') {
            setSnackbarMessage(notification.message)
            setSnackbarSeverity('warning')
            setCurrentNotification(notification)
            setSnackbarOpen(true)
          }
        })
        
        // Show browser notification for new reminders
        newNotifications.forEach(notification => {
          if (notification.type === 'reminder' && 
              'Notification' in window && 
              Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icons/icon-72x72.png'
            })
          }
        })
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 5000) // Refresh every 5 seconds for better real-time experience
    return () => clearInterval(interval)
  }, [])

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
    const interval = setInterval(loadTaskProgress, 5000) // Refresh every 5 seconds
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

            <Badge badgeContent={notifications.length} color="secondary">
              <NotificationsIcon />
            </Badge>
          </Toolbar>
        </AppBar>

        {/* Notification Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={null} // 不自动隐藏，让用户操作
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity} 
            sx={{ width: '100%' }}
            action={
              <React.Fragment>
                <Button 
                  color="success" 
                  size="small"
                  onClick={() => handleTaskComplete(currentNotification)}
                >
                  已完成
                </Button>
                <Button 
                  color="warning" 
                  size="small"
                  onClick={() => handleTaskDefer(currentNotification)}
                >
                  延期
                </Button>
              </React.Fragment>
            }
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

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

// Main content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: 8 }}>
          <Container maxWidth="lg">
            <Routes>
              <Route path="/" element={<Home taskProgress={taskProgress} />} />
              <Route path="/tasks" element={<TaskBoard />} />
              <Route path="/add" element={<AddTask />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>

        {/* Defer Dialog */}
        {DeferDialog}
      </div>
    </ThemeProvider>
  )
}

export default App

  // Defer dialog component
  const DeferDialog = (
    <Dialog open={deferDialogOpen} onClose={() => setDeferDialogOpen(false)}>
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
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeferDialogOpen(false)}>取消</Button>
        <Button onClick={confirmDefer} variant="contained" color="primary">
          确认延期
        </Button>
      </DialogActions>
    </Dialog>
  )

  // Handle task completion
  const handleTaskComplete = async (notification) => {
    if (!notification || !notification.taskId) return
    
    try {
      // Update task status to completed
      await taskService.updateTask(notification.taskId, { 
        status: 'completed',
        completedAt: new Date().toISOString()
      })
      
      // Acknowledge notification
      await notificationService.acknowledgeNotification(notification.id)
      
      setSnackbarOpen(false)
      setCurrentNotification(null)
      
      // Show success message
      setSnackbarMessage('任务已完成！')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      
      // Refresh notifications
      const userNotifications = await notificationService.getUserNotifications('user-1')
      setNotifications(userNotifications.filter(n => n.status === 'pending'))
    } catch (error) {
      console.error('Failed to complete task:', error)
      setSnackbarMessage('完成任务失败')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  // Handle task defer
  const handleTaskDefer = async (notification) => {
    if (!notification || !notification.taskId) return
    
    setCurrentNotification(notification)
    setDeferDialogOpen(true)
  }

  // Confirm defer with selected option
  const confirmDefer = async () => {
    if (!currentNotification) return
    
    try {
      const deferHours = deferOption === 'custom' ? parseInt(customDeferHours) : parseInt(deferOption)
      
      if (isNaN(deferHours) || deferHours <= 0) {
        setSnackbarMessage('请输入有效的延期时间')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
        return
      }
      
      const newDueDate = new Date()
      newDueDate.setHours(newDueDate.getHours() + deferHours)
      
      // Update task due date
      await taskService.updateTask(currentNotification.taskId, { 
        dueDate: newDueDate.toISOString()
      })
      
      // Create new deferred reminder
      const newReminderTime = new Date(newDueDate.getTime() - 60000) // 1 minute before new due date
      
      const deferredReminder = {
        userId: 'user-1',
        taskId: currentNotification.taskId,
        title: currentNotification.title,
        message: currentNotification.message,
        newSchedule: getCronSchedule(newReminderTime),
        deferHours: deferHours
      }
      
      await notificationService.deferReminder(deferredReminder)
      
      // Acknowledge current notification
      await notificationService.acknowledgeNotification(currentNotification.id)
      
      setDeferDialogOpen(false)
      setCurrentNotification(null)
      
      // Show success message
      setSnackbarMessage(`任务已延期至 ${newDueDate.toLocaleString()}，新提醒将在 ${newReminderTime.toLocaleString()} 触发`)
      setSnackbarSeverity('info')
      setSnackbarOpen(true)
      
      // Refresh notifications
      const userNotifications = await notificationService.getUserNotifications('user-1')
      setNotifications(userNotifications.filter(n => n.status === 'pending'))
    } catch (error) {
      console.error('Failed to defer task:', error)
      setSnackbarMessage('延期任务失败')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  // Handle task defer
  const handleTaskDefer = async (notification) => {
    if (!notification || !notification.taskId) return
    
    setCurrentNotification(notification)
    setDeferDialogOpen(true)
  }

  // Confirm defer with selected option
  const confirmDefer = async () => {
    if (!currentNotification) return
    
    try {
      const deferHours = deferOption === 'custom' ? parseInt(customDeferHours) : parseInt(deferOption)
      
      if (isNaN(deferHours) || deferHours <= 0) {
        setSnackbarMessage('请输入有效的延期时间')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
        return
      }
      
      const newDueDate = new Date()
      newDueDate.setHours(newDueDate.getHours() + deferHours)
      
      // Update task due date
      await taskService.updateTask(currentNotification.taskId, { 
        dueDate: newDueDate.toISOString()
      })
      
      // Create new deferred reminder
      const newReminderTime = new Date(newDueDate.getTime() - 60000) // 1 minute before new due date
      
      const deferredReminder = {
        userId: 'user-1',
        taskId: currentNotification.taskId,
        title: currentNotification.title,
        message: currentNotification.message,
        newSchedule: getCronSchedule(newReminderTime),
        deferHours: deferHours
      }
      
      await notificationService.deferReminder(deferredReminder)
      
      // Acknowledge current notification
      await notificationService.acknowledgeNotification(currentNotification.id)
      
      setDeferDialogOpen(false)
      setCurrentNotification(null)
      
      // Show success message
      setSnackbarMessage(`任务已延期至 ${newDueDate.toLocaleString()}，新提醒将在 ${newReminderTime.toLocaleString()} 触发`)
      setSnackbarSeverity('info')
      setSnackbarOpen(true)
      
      // Refresh notifications
      const userNotifications = await notificationService.getUserNotifications('user-1')
      setNotifications(userNotifications.filter(n => n.status === 'pending'))
    } catch (error) {
      console.error('Failed to defer task:', error)
      setSnackbarMessage('延期任务失败')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }