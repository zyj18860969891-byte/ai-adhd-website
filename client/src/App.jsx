import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Badge } from '@mui/material'
import { Menu as MenuIcon, Home as HomeIcon, Add as AddIcon, List as ListIcon, BarChart as ChartIcon, Notifications as NotificationsIcon, Settings as SettingsIcon } from '@mui/icons-material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

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

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const userNotifications = await notificationService.getUserNotifications('user-1')
        setNotifications(userNotifications.filter(n => n.status === 'pending'))
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 30000) // Refresh every 30 seconds
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
              <Route path="/" element={<Home taskProgress={taskProgress} />} />
              <Route path="/tasks" element={<TaskBoard />} />
              <Route path="/add" element={<AddTask />} />
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