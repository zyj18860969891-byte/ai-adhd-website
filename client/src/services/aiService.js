import axios from 'axios'

const API_BASE = '/api'

const aiService = {
  // Task classification
  async classifyTask(text, context = {}) {
    try {
      const response = await axios.post(`${API_BASE}/services/ai/classify-task`, {
        text,
        context
      })
      return response.data
    } catch (error) {
      console.error('Failed to classify task:', error)
      throw error
    }
  },

  // Voice transcription
  async transcribeAudio(audioData, language = 'zh-CN') {
    try {
      const response = await axios.post(`${API_BASE}/services/ai/transcribe`, {
        audioData,
        language
      })
      return response.data
    } catch (error) {
      console.error('Failed to transcribe audio:', error)
      throw error
    }
  },

  // Priority suggestion
  async suggestPriority(task, context = {}) {
    try {
      const response = await axios.post(`${API_BASE}/services/ai/suggest-priority`, {
        task,
        context
      })
      return response.data
    } catch (error) {
      console.error('Failed to suggest priority:', error)
      throw error
    }
  },

  // Task extraction
  async extractTasks(text) {
    try {
      const response = await axios.post(`${API_BASE}/services/ai/extract-tasks`, {
        text
      })
      return response.data
    } catch (error) {
      console.error('Failed to extract tasks:', error)
      throw error
    }
  },

  // Health check
  async getHealth() {
    try {
      const response = await axios.get(`${API_BASE}/services/ai/health`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch AI service health:', error)
      throw error
    }
  }
}

export default aiService