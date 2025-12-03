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

const notificationService = {
  // Send notification
  async sendNotification(notification) {
    try {
      const response = await axios.post(`${getApiBase()}/services/notification/notifications`, notification)
      return response.data
    } catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  },

  // Get user notifications
  async getUserNotifications(userId) {
    try {
      const response = await axios.get(`${getApiBase()}/services/notification/notifications/${userId}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      throw error
    }
  },

  // Acknowledge notification
  async acknowledgeNotification(id) {
    try {
      const response = await axios.put(`${getApiBase()}/services/notification/notifications/${id}/acknowledge`)
      return response.data
    } catch (error) {
      console.error('Failed to acknowledge notification:', error)
      throw error
    }
  },

  // Delete notification
  async deleteNotification(id) {
    try {
      const response = await axios.delete(`${getApiBase()}/services/notification/notifications/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete notification:', error)
      throw error
    }
  },

  // Create reminder
  async createReminder(reminder) {
    try {
      const response = await axios.post(`${getApiBase()}/services/notification/reminders`, reminder)
      return response.data
    } catch (error) {
      console.error('Failed to create reminder:', error)
      throw error
    }
  },

  // Health check
  async getHealth() {
    try {
      const response = await axios.get(`${getApiBase()}/services/notification/health`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch notification service health:', error)
      throw error
    }
  }
}

export default notificationService