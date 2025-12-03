import React, { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, TextField, Button, Grid, Chip, Select, MenuItem, FormControl, InputLabel, Divider, Alert, IconButton, useTheme } from '@mui/material'
import { Add as AddIcon, Mic as MicIcon, Stop as StopIcon, Save as SaveIcon, Clear as ClearIcon } from '@mui/icons-material'
import taskService from '../services/taskService.js'
import aiService from '../services/aiService.js'

export default function AddTask() {
  const theme = useTheme()
  const [task, setTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: '中优先级',
    dueDate: '',
    tags: []
  })
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.lang = 'zh-CN'
      recognitionInstance.interimResults = false
      recognitionInstance.maxAlternatives = 1

      recognitionInstance.onresult = (event) => {
        const transcriptText = event.results[0][0].transcript
        setTranscript(transcriptText)
        setTask(prev => ({ ...prev, title: transcriptText }))
      }

      recognitionInstance.onend = () => {
        setIsRecording(false)
      }

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  const categories = ['工作', '个人', '项目', '学习', '健康', '财务', '家庭', '社交']

  const handleInputChange = (field, value) => {
    setTask(prev => ({ ...prev, [field]: value }))
  }

  const startRecording = () => {
    if (recognition) {
      setTranscript('')
      setIsRecording(true)
      recognition.start()
    }
  }

  const stopRecording = () => {
    if (recognition) {
      setIsRecording(false)
      recognition.stop()
    }
  }

  const getAiSuggestions = async () => {
    if (!task.title) return

    try {
      const suggestions = await aiService.classifyTask(task.title, {})
      setAiSuggestions(suggestions)
      
      // Auto-fill with AI suggestions
      if (suggestions.category) {
        setTask(prev => ({ ...prev, category: suggestions.category }))
      }
      if (suggestions.priority) {
        setTask(prev => ({ ...prev, priority: suggestions.priority }))
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error)
    }
  }

  const extractTasksFromText = async () => {
    if (!task.title) return

    try {
      const result = await aiService.extractTasks(task.title)
      if (result.tasks && result.tasks.length > 1) {
        // Show multiple tasks found
        console.log('Multiple tasks found:', result.tasks)
      }
    } catch (error) {
      console.error('Failed to extract tasks:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const newTask = {
        ...task,
        id: `task_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await taskService.createTask(newTask)
      setSuccess('任务创建成功！')
      setTask({
        title: '',
        description: '',
        category: '',
        priority: '中优先级',
        dueDate: '',
        tags: []
      })
      setTranscript('')
      setAiSuggestions(null)
    } catch (error) {
      setError('创建任务失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setTask({
      title: '',
      description: '',
      category: '',
      priority: '中优先级',
      dueDate: '',
      tags: []
    })
    setTranscript('')
    setAiSuggestions(null)
    setError('')
    setSuccess('')
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        添加新任务
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  {/* Title */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="任务标题"
                      value={task.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                      autoFocus
                    />
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="任务描述"
                      value={task.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      multiline
                      rows={3}
                    />
                  </Grid>

                  {/* Category */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>分类</InputLabel>
                      <Select
                        value={task.category}
                        label="分类"
                        onChange={(e) => handleInputChange('category', e.target.value)}
                      >
                        {categories.map((cat) => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Priority */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>优先级</InputLabel>
                      <Select
                        value={task.priority}
                        label="优先级"
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                      >
                        <MenuItem value="高优先级">🚨 高优先级</MenuItem>
                        <MenuItem value="中优先级">⏫ 中优先级</MenuItem>
                        <MenuItem value="低优先级">🔼 低优先级</MenuItem>
                        <MenuItem value="可选">🔽 可选</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Due Date */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="截止日期"
                      type="datetime-local"
                      value={task.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  {/* Tags */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="标签（逗号分隔）"
                      value={task.tags.join(', ')}
                      onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                    />
                  </Grid>

                  {/* Actions */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant={isRecording ? "contained" : "outlined"}
                        color="primary"
                        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={!recognition}
                      >
                        {isRecording ? '停止录音' : '语音输入'}
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={getAiSuggestions}
                        disabled={!task.title}
                      >
                        AI 智能建议
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={extractTasksFromText}
                        disabled={!task.title}
                      >
                        提取任务
                      </Button>

                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={loading}
                      >
                        {loading ? '保存中...' : '保存任务'}
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={clearForm}
                        color="secondary"
                      >
                        清空
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>

              {/* Messages */}
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Voice Input Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>语音输入</Typography>
              {isRecording ? (
                <Alert severity="info">正在录音...</Alert>
              ) : transcript ? (
                <Alert severity="success">识别结果: {transcript}</Alert>
              ) : (
                <Typography color="text.secondary">点击"语音输入"开始录音</Typography>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {aiSuggestions && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>AI 建议</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {aiSuggestions.category && (
                    <Chip label={`分类: ${aiSuggestions.category}`} color="primary" />
                  )}
                  {aiSuggestions.priority && (
                    <Chip label={`优先级: ${aiSuggestions.priority}`} color="secondary" />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  置信度: {(aiSuggestions.confidence * 100).toFixed(0)}%
                </Typography>
                {aiSuggestions.reasoning && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    理由: {aiSuggestions.reasoning}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}