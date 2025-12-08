import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

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

const taskService = {
  // Task operations
  async getTasks(params = {}) {
    try {
      const response = await axios.get(`${getApiBase()}/services/db/tasks`, { params })
      return response.data
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      throw error
    }
  },

  async getTask(id) {
    try {
      const response = await axios.get(`${getApiBase()}/services/db/tasks/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch task:', error)
      throw error
    }
  },

  async createTask(task) {
    try {
      const response = await axios.post(`${getApiBase()}/services/db/tasks`, task)
      return response.data
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  },

  async updateTask(id, updates) {
    console.log('🔄 updateTask called with id:', id);
    console.log('🔄 Updates:', updates);
    console.log('🔄 API Base URL:', getApiBase());
    console.log('🔄 Full URL:', `${getApiBase()}/services/db/tasks/${id}`);
    
    try {
      const response = await axios.put(`${getApiBase()}/services/db/tasks/${id}`, updates)
      console.log('🔄 updateTask response:', response);
      return response.data
    } catch (error) {
      console.error('❌ Failed to update task:', error)
      console.error('❌ Error details:', error.response || error.message || error);
      throw error
    }
  },

  async deleteTask(id) {
    try {
      const response = await axios.delete(`${getApiBase()}/services/db/tasks/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  },

  async getTaskHistory(id) {
    try {
      const response = await axios.get(`${getApiBase()}/services/db/tasks/${id}/history`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch task history:', error)
      throw error
    }
  },

  // Statistics
  async getStats() {
    try {
      const response = await axios.get(`${getApiBase()}/services/db/stats`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      throw error
    }
  },

  // Task progress tracking
  async getTaskProgress() {
    try {
      const response = await axios.get(`${getApiBase()}/task-progress`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch task progress:', error)
      throw error
    }
  },

  async updateTaskProgress(progress) {
    try {
      const response = await axios.post(`${getApiBase()}/task-progress`, progress)
      return response.data
    } catch (error) {
      console.error('Failed to update task progress:', error)
      throw error
    }
  },

  // Service status
  async getServiceStatus(serviceId) {
    try {
      const response = await axios.get(`${getApiBase()}/services/${serviceId}/status`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch service status:', error)
      throw error
    }
  },

  async updateServiceStatus(serviceId, status) {
    try {
      const response = await axios.post(`${getApiBase()}/services/${serviceId}/status`, status)
      return response.data
    } catch (error) {
      console.error('Failed to update service status:', error)
      throw error
    }
  },

  // Health check
  async getHealth() {
    try {
      const response = await axios.get(`${getApiBase()}/health`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch health status:', error)
      throw error
    }
  }
}

export default taskService