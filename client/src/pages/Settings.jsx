import React, { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, Button, Grid, Switch, FormControlLabel, TextField, Select, MenuItem, FormControl, InputLabel, Alert, Chip } from '@mui/material'
import { Refresh as RefreshIcon, Save as SaveIcon, Cloud as CloudIcon, Storage as StorageIcon, Memory as MemoryIcon } from '@mui/icons-material'
import taskService from '../services/taskService.js'

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    theme: 'light',
    language: 'zh-CN',
    backupFrequency: 'daily'
  })
  const [services, setServices] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadSettings()
    loadServiceStatus()
    
    const interval = setInterval(loadServiceStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }

  const loadServiceStatus = async () => {
    try {
      // Get the correct API base URL
      const getApiBase = () => {
        const base = import.meta.env.VITE_API_BASE_URL
        if (base) {
          const normalized = base.replace(/\/+$/, '')
          if (normalized.endsWith('/api')) {
            return normalized
          }
          return `${normalized}/api`
        }
        return '/api'
      }

      const [health, aiHealth, dbHealth, notificationHealth] = await Promise.all([
        taskService.getHealth(),
        fetch(`${getApiBase()}/services/ai/health`).then(r => r.json()),
        fetch(`${getApiBase()}/services/db/health`).then(r => r.json()),
        fetch(`${getApiBase()}/services/notification/health`).then(r => r.json())
      ])
      
      setServices({
        main: health,
        ai: aiHealth,
        db: dbHealth,
        notification: notificationHealth
      })
    } catch (error) {
      console.error('Failed to load service status:', error)
    }
  }

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const saveSettings = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings))
    setSuccess('设置已保存')
    setTimeout(() => setSuccess(''), 3000)
  }

  const backupData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/services/db/backup`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setSuccess('数据备份成功')
      } else {
        setError('数据备份失败')
      }
    } catch (error) {
      console.error('Backup failed:', error)
      setError('数据备份失败')
    } finally {
      setLoading(false)
      setTimeout(() => setError(''), 3000)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const getServiceStatus = (service) => {
    if (!service) return { status: 'unknown', color: 'default' }
    
    switch (service.status) {
      case 'healthy':
        return { status: '正常', color: 'success' }
      case 'unhealthy':
        return { status: '异常', color: 'error' }
      default:
        return { status: '未知', color: 'default' }
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        设置
      </Typography>

      <Grid container spacing={3}>
        {/* App Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>应用设置</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications}
                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                      />
                    }
                    label="启用通知"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoSave}
                        onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                      />
                    }
                    label="自动保存"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>主题</InputLabel>
                    <Select
                      value={settings.theme}
                      label="主题"
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                    >
                      <MenuItem value="light">浅色</MenuItem>
                      <MenuItem value="dark">深色</MenuItem>
                      <MenuItem value="system">跟随系统</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>语言</InputLabel>
                    <Select
                      value={settings.language}
                      label="语言"
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                      <MenuItem value="zh-CN">中文</MenuItem>
                      <MenuItem value="en-US">English</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>备份频率</InputLabel>
                    <Select
                      value={settings.backupFrequency}
                      label="备份频率"
                      onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                    >
                      <MenuItem value="daily">每日</MenuItem>
                      <MenuItem value="weekly">每周</MenuItem>
                      <MenuItem value="monthly">每月</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<SaveIcon />}
                      onClick={saveSettings}
                    >
                      保存设置
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<CloudIcon />}
                      onClick={backupData}
                      disabled={loading}
                    >
                      {loading ? '备份中...' : '立即备份'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </CardContent>
          </Card>
        </Grid>

        {/* Service Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>服务状态</Typography>
              
              <Grid container spacing={2}>
                {[
                  { name: '主服务器', service: services.main, icon: <MemoryIcon /> },
                  { name: 'AI 服务', service: services.ai, icon: <StorageIcon /> },
                  { name: '数据库服务', service: services.db, icon: <StorageIcon /> },
                  { name: '通知服务', service: services.notification, icon: <CloudIcon /> }
                ].map((item, index) => {
                  const status = getServiceStatus(item.service)
                  return (
                    <Grid item xs={12} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {item.icon}
                              <Typography variant="subtitle1">{item.name}</Typography>
                            </Box>
                            <Chip 
                              label={status.status} 
                              color={status.color}
                              size="small"
                            />
                          </Box>
                          {item.service && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              最后检查: {new Date(item.service.lastCheck).toLocaleString('zh-CN')}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
                
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    startIcon={<RefreshIcon />}
                    onClick={loadServiceStatus}
                  >
                    刷新状态
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* About */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>关于</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                ADHD Task Manager 是一个专为 ADHD 用户设计的任务管理工具，采用微服务架构和 PWA 技术。
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">版本</Typography>
                      <Typography variant="h6">1.0.0</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">架构</Typography>
                      <Typography variant="h6">微服务</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">类型</Typography>
                      <Typography variant="h6">PWA</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">目标用户</Typography>
                      <Typography variant="h6">ADHD 用户</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}