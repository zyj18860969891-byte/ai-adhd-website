import axios from 'axios'

const API_BASE = '/api'

const taskService = {
  // Task operations
  async getTasks(params = {}) {
    try {
      const response = await axios.get(`${API_BASE}/services/db/tasks`, { params })
      return response.data
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      throw error
    }
  },

  async getTask(id) {
    try {
      const response = await axios.get(`${API_BASE}/services/db/tasks/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch task:', error)
      throw error
    }
  },

  async createTask(task) {
    try {
      const response = await axios.post(`${API_BASE}/services/db/tasks`, task)
      return response.data
    } catch (error) {
      console.error('Failed to create task:', error)
      throw error
    }
  },

  async updateTask(id, updates) {
    try {
      const response = await axios.put(`${API_BASE}/services/db/tasks/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  },

  async deleteTask(id) {
    try {
      const response = await axios.delete(`${API_BASE}/services/db/tasks/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  },

  async getTaskHistory(id) {
    try {
      const response = await axios.get(`${API_BASE}/services/db/tasks/${id}/history`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch task history:', error)
      throw error
    }
  },

  // Statistics
  async getStats() {
    try {
      const response = await axios.get(`${API_BASE}/services/db/stats`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      throw error
    }
  },

  // Task progress tracking
  async getTaskProgress() {
    try {
      const response = await axios.get(`${API_BASE}/task-progress`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch task progress:', error)
      throw error
    }
  },

  async updateTaskProgress(progress) {
    try {
      const response = await axios.post(`${API_BASE}/task-progress`, progress)
      return response.data
    } catch (error) {
      console.error('Failed to update task progress:', error)
      throw error
    }
  },

  // Service status
  async getServiceStatus(serviceId) {
    try {
      const response = await axios.get(`${API_BASE}/services/${serviceId}/status`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch service status:', error)
      throw error
    }
  },

  async updateServiceStatus(serviceId, status) {
    try {
      const response = await axios.post(`${API_BASE}/services/${serviceId}/status`, status)
      return response.data
    } catch (error) {
      console.error('Failed to update service status:', error)
      throw error
    }
  },

  // Health check
  async getHealth() {
    try {
      const response = await axios.get(`${API_BASE}/health`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch health status:', error)
      throw error
    }
  }
}

export default taskService