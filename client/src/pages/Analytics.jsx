import React, { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, Grid, Button, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material'
import { BarChart, DoughnutChart, LineChart } from '../components/Charts.jsx'
import taskService from '../services/taskService.js'

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [tasks, setTasks] = useState([])
  const [timeRange, setTimeRange] = useState('week')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [timeRange])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, tasksData] = await Promise.all([
        taskService.getStats(),
        taskService.getTasks()
      ])
      
      setStats(statsData)
      setTasks(tasksData)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCompletionRate = () => {
    if (!stats || stats.totalTasks === 0) return 0
    return Math.round(stats.completionRate)
  }

  const getTasksByStatus = () => {
    if (!stats) return []
    return [
      { name: '已完成', value: stats.byStatus?.completed || 0, color: '#10b981' },
      { name: '进行中', value: stats.byStatus?.in_progress || 0, color: '#f59e0b' },
      { name: '待处理', value: stats.byStatus?.pending || 0, color: '#64748b' }
    ]
  }

  const getTasksByCategory = () => {
    if (!stats) return []
    return Object.entries(stats.byCategory || {}).map(([category, count]) => ({
      name: category,
      value: count
    }))
  }

  const getRecentCompletionData = () => {
    const now = new Date()
    const labels = []
    const data = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
      
      const completedToday = tasks.filter(task => {
        const completedDate = new Date(task.completedAt)
        return completedDate.getDate() === date.getDate() && 
               completedDate.getMonth() === date.getMonth() &&
               completedDate.getFullYear() === date.getFullYear()
      }).length
      
      data.push(completedToday)
    }
    
    return { labels, data }
  }

  const getPriorityDistribution = () => {
    const priorities = ['高优先级', '中优先级', '低优先级', '可选']
    return priorities.map(priority => ({
      name: priority,
      value: tasks.filter(task => task.priority === priority).length
    }))
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          数据分析
        </Typography>
        <FormControl size="small">
          <InputLabel>时间范围</InputLabel>
          <Select
            value={timeRange}
            label="时间范围"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="day">今天</MenuItem>
            <MenuItem value="week">本周</MenuItem>
            <MenuItem value="month">本月</MenuItem>
            <MenuItem value="year">今年</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          正在加载数据...
        </Typography>
      )}

      {!loading && (
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>完成率</Typography>
                <Typography variant="h2" color="success.main">
                  {getCompletionRate()}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  总体任务完成情况
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>总任务数</Typography>
                <Typography variant="h2" color="primary">
                  {stats?.totalTasks || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  所有任务统计
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>已完成</Typography>
                <Typography variant="h2" color="success.main">
                  {stats?.byStatus?.completed || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  成功完成的任务
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>进行中</Typography>
                <Typography variant="h2" color="warning.main">
                  {stats?.byStatus?.in_progress || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  当前进行的任务
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>任务状态分布</Typography>
                <DoughnutChart data={getTasksByStatus()} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>最近完成情况</Typography>
                <LineChart data={getRecentCompletionData()} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>分类分布</Typography>
                <BarChart data={getTasksByCategory()} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>优先级分布</Typography>
                <BarChart data={getPriorityDistribution()} />
              </CardContent>
            </Card>
          </Grid>

          {/* Task Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>任务详情</Typography>
                <Grid container spacing={2}>
                  {tasks.slice(0, 6).map((task) => (
                    <Grid item xs={12} sm={6} md={4} key={task.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {task.title}
                            </Typography>
                            <Chip 
                              label={task.status} 
                              color={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {task.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {task.category && (
                              <Chip label={task.category} size="small" variant="outlined" />
                            )}
                            <Chip 
                              label={task.priority} 
                              color={task.priority === '高优先级' ? 'error' : task.priority === '中优先级' ? 'warning' : 'info'}
                              size="small"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}