import React, { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, Button, Grid, Chip, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Divider, Alert } from '@mui/material'
import { Add as AddIcon, Refresh as RefreshIcon, Search as SearchIcon, FilterList as FilterIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import taskService from '../services/taskService.js'

const columns = [
  { id: 'pending', title: '待处理', color: 'default' },
  { id: 'in_progress', title: '进行中', color: 'warning' },
  { id: 'completed', title: '已完成', color: 'success' }
]

export default function TaskBoard() {
  const [tasks, setTasks] = useState({ pending: [], in_progress: [], completed: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priority: ''
  })

  useEffect(() => {
    loadTasks()
    const interval = setInterval(loadTasks, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [filters])

  const loadTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const allTasks = await taskService.getTasks()
      
      // Apply filters
      const filteredTasks = allTasks.filter(task => {
        const searchMatch = !filters.search || 
          task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase()))
        
        const categoryMatch = !filters.category || task.category === filters.category
        const priorityMatch = !filters.priority || task.priority === filters.priority
        
        return searchMatch && categoryMatch && priorityMatch
      })
      
      // Group by status
      const groupedTasks = {
        pending: filteredTasks.filter(t => t.status === 'pending'),
        in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
        completed: filteredTasks.filter(t => t.status === 'completed')
      }
      
      setTasks(groupedTasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      setError('加载任务失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const taskId = draggableId
    const newStatus = destination.droppableId

    try {
      await taskService.updateTask(taskId, { status: newStatus })
      loadTasks() // Refresh the board
    } catch (error) {
      console.error('Failed to update task status:', error)
      setError('更新任务状态失败')
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId)
      loadTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
      setError('删除任务失败')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case '高优先级': return 'error'
      case '中优先级': return 'warning'
      case '低优先级': return 'info'
      default: return 'default'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          任务看板
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          href="/add"
        >
          添加任务
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="搜索任务"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>分类</InputLabel>
                <Select
                  value={filters.category}
                  label="分类"
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="">全部</MenuItem>
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>优先级</InputLabel>
                <Select
                  value={filters.priority}
                  label="优先级"
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="">全部</MenuItem>
                  <MenuItem value="高优先级">高优先级</MenuItem>
                  <MenuItem value="中优先级">中优先级</MenuItem>
                  <MenuItem value="低优先级">低优先级</MenuItem>
                  <MenuItem value="可选">可选</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={loadTasks}
                disabled={loading}
              >
                {loading ? '刷新中...' : '刷新'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Task Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {columns.map((column) => (
            <Grid item xs={12} md={4} key={column.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color={column.color}>
                      {column.title}
                    </Typography>
                    <Chip 
                      label={tasks[column.id].length} 
                      color={column.color} 
                      size="small" 
                    />
                  </Box>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          minHeight: 200,
                          backgroundColor: snapshot.isDraggingOver ? '#f1f5f9' : 'transparent',
                          borderRadius: 2,
                          p: 1
                        }}
                      >
                        {tasks[column.id].map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 2,
                                  backgroundColor: 'background.paper',
                                  borderRadius: 2,
                                  boxShadow: snapshot.isDragging ? 3 : 1,
                                  '&:hover': {
                                    boxShadow: 3
                                  }
                                }}
                              >
                                <Card variant="outlined" sx={{ m: 1 }}>
                                  <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {task.title}
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton size="small" href={`/edit/${task.id}`}>
                                          <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                                          <DeleteIcon />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                    
                                    {task.description && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {task.description}
                                      </Typography>
                                    )}
                                    
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                      {task.category && (
                                        <Chip label={task.category} size="small" variant="outlined" />
                                      )}
                                      <Chip 
                                        label={task.priority} 
                                        color={getPriorityColor(task.priority)}
                                        size="small"
                                      />
                                      <Chip 
                                        label={task.status} 
                                        color={column.color}
                                        size="small"
                                      />
                                    </Box>
                                    
                                    <Typography variant="caption" color="text.secondary">
                                      创建时间: {formatDate(task.createdAt)}
                                    </Typography>
                                    {task.dueDate && (
                                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                        截止时间: {formatDate(task.dueDate)}
                                      </Typography>
                                    )}
                                  </CardContent>
                                </Card>
                              </Box>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
    </Box>
  )
}