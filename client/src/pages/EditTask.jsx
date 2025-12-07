import React, { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Chip, Divider, Alert } from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import taskService from '../services/taskService.js'

export default function EditTask() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    dueDate: '',
    status: 'pending'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadTask()
  }, [id])

  const loadTask = async () => {
    setLoading(true)
    setError('')
    try {
      const taskData = await taskService.getTask(id)
      setTask(taskData)
    } catch (error) {
      console.error('Failed to load task:', error)
      setError('加载任务失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setTask(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await taskService.updateTask(id, task)
      setSuccess('任务更新成功！')
      setTimeout(() => {
        navigate('/tasks')
      }, 1000)
    } catch (error) {
      console.error('Failed to update task:', error)
      setError('更新任务失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('确定要删除这个任务吗？')) {
      setLoading(true)
      setError('')
      try {
        await taskService.deleteTask(id)
        setSuccess('任务删除成功！')
        setTimeout(() => {
          navigate('/tasks')
        }, 1000)
      } catch (error) {
        console.error('Failed to delete task:', error)
        setError('删除任务失败')
      } finally {
        setLoading(false)
      }
    }
  }

  if (!task.id) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          编辑任务
        </Typography>
        {loading && <Alert severity="info">加载中...</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          编辑任务
        </Typography>
        <Button 
          variant="outlined" 
          color="error"
          onClick={handleDelete}
          disabled={loading}
        >
          删除任务
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="任务标题"
                  value={task.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="任务描述"
                  multiline
                  rows={3}
                  value={task.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>分类</InputLabel>
                  <Select
                    value={task.category}
                    label="分类"
                    onChange={(e) => handleChange('category', e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="工作">工作</MenuItem>
                    <MenuItem value="个人">个人</MenuItem>
                    <MenuItem value="项目">项目</MenuItem>
                    <MenuItem value="学习">学习</MenuItem>
                    <MenuItem value="健康">健康</MenuItem>
                    <MenuItem value="财务">财务</MenuItem>
                    <MenuItem value="家庭">家庭</MenuItem>
                    <MenuItem value="社交">社交</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>优先级</InputLabel>
                  <Select
                    value={task.priority}
                    label="优先级"
                    onChange={(e) => handleChange('priority', e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="高优先级">高优先级</MenuItem>
                    <MenuItem value="中优先级">中优先级</MenuItem>
                    <MenuItem value="低优先级">低优先级</MenuItem>
                    <MenuItem value="可选">可选</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="截止时间"
                  type="datetime-local"
                  value={task.dueDate ? task.dueDate.slice(0, 16) : ''}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>状态</InputLabel>
                  <Select
                    value={task.status}
                    label="状态"
                    onChange={(e) => handleChange('status', e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="pending">待处理</MenuItem>
                    <MenuItem value="in_progress">进行中</MenuItem>
                    <MenuItem value="completed">已完成</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/tasks')}
                disabled={loading}
              >
                返回
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
              >
                {loading ? '保存中...' : '保存更改'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}