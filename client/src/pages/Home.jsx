import React, { useState, useEffect } from 'react'
import { Grid, Card, CardContent, Typography, Button, Chip, LinearProgress, Box, Alert } from '@mui/material'
import { Add as AddIcon, CheckCircle as CompletedIcon, PendingActions as PendingIcon, Warning as WarningIcon } from '@mui/icons-material'
import taskService from '../services/taskService.js'

export default function Home({ taskProgress, onTaskAction }) {
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await taskService.getStats()
        setStats(statsData)
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }

    const loadRecentTasks = async () => {
      try {
        const tasks = await taskService.getTasks({ limit: 5 })
        setRecentTasks(tasks)
      } catch (error) {
        console.error('Failed to load recent tasks:', error)
      }
    }

    loadStats()
    loadRecentTasks()
    
    const statsInterval = setInterval(loadStats, 10000)
    const tasksInterval = setInterval(loadRecentTasks, 10000)
    
    return () => {
      clearInterval(statsInterval)
      clearInterval(tasksInterval)
    }
  }, [])

  const getPriorityColor = (priority) => {
    switch (priority) {
      case '高优先级': return 'error'
      case '中优先级': return 'warning'
      case '低优先级': return 'info'
      default: return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          欢迎使用 ADHD Task Manager
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          专为 ADHD 用户设计的友好任务管理工具
        </Typography>
      </Box>

      {/* Task Progress Alert */}
      {taskProgress && (
        <Alert severity="info" sx={{ mb: 3 }}>
          当前任务: {taskProgress.currentTask?.title} - {taskProgress.currentTask?.status}
          <LinearProgress 
            variant="determinate" 
            value={taskProgress.currentTask?.progress || 0} 
            sx={{ mt: 1 }} 
          />
        </Alert>
      )}

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>快速添加</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                href="/add"
                fullWidth
              >
                添加任务
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>任务看板</Typography>
              <Button 
                variant="outlined" 
                href="/tasks"
                fullWidth
              >
                查看所有任务
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>语音输入</Typography>
              <Button 
                variant="outlined" 
                href="/add"
                fullWidth
              >
                语音添加任务
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>数据分析</Typography>
              <Button 
                variant="outlined" 
                href="/analytics"
                fullWidth
              >
                查看进度
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Statistics */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6">总任务数</Typography>
                    <Typography variant="h4" color="primary">{stats.totalTasks || 0}</Typography>
                  </Box>
                  <PendingIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6">已完成</Typography>
                    <Typography variant="h4" color="success.main">{stats.byStatus?.completed || 0}</Typography>
                  </Box>
                  <CompletedIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6">完成率</Typography>
                    <Typography variant="h4" color="info.main">{Math.round(stats.completionRate || 0)}%</Typography>
                  </Box>
                  <WarningIcon color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6">进行中</Typography>
                    <Typography variant="h4" color="warning.main">{stats.byStatus?.in_progress || 0}</Typography>
                  </Box>
                  <PendingIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Tasks */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>最近任务</Typography>
          {recentTasks.length === 0 ? (
            <Typography color="text.secondary">暂无任务，快去添加一个吧！</Typography>
          ) : (
            <Grid container spacing={2}>
              {recentTasks.map((task) => (
                <Grid item xs={12}>
                  <Box 
                    key={task.id}
                    sx={{ 
                      p: 2, 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        boxShadow: 1
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">{task.title}</Typography>
                      <Box>
                        <Chip 
                          label={task.priority} 
                          color={getPriorityColor(task.priority)}
                          size="small"
                        />
                        <Button 
                          size="small" 
                          color="success" 
                          variant="outlined"
                          onClick={() => {
                            console.log('✅ Home.jsx: Complete button clicked for task:', task.id);
                            console.log('✅ Task details:', task);
                            onTaskAction(task);
                          }}
                          sx={{ ml: 1 }}
                        >
                          完成
                        </Button>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {task.category && (
                        <Chip label={task.category} size="small" variant="outlined" />
                      )}
                      {task.status && (
                        <Chip label={task.status} size="small" variant="outlined" />
                      )}
                    </Box>
                    {task.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {task.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      创建时间: {new Date(task.createdAt).toLocaleString('zh-CN')}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}