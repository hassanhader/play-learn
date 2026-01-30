import api from './api'

/**
 * Service pour gérer les niveaux depuis l'API backend
 */
const levelsService = {
  /**
   * Récupérer un niveau spécifique par son ID
   * @param {number} levelId - ID du niveau
   * @returns {Promise}
   */
  getLevelById: async (levelId) => {
    try {
      const response = await api.get(`/levels/${levelId}`)
      
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Error fetching level:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch level',
        error: error.message
      }
    }
  },

  /**
   * Récupérer toutes les questions d'un niveau
   * @param {number} levelId - ID du niveau
   * @param {boolean} includeAnswers - Inclure les réponses ?
   * @returns {Promise}
   */
  getLevelQuestions: async (levelId, includeAnswers = false) => {
    try {
      const url = `/levels/${levelId}/questions${includeAnswers ? '?includeAnswers=true' : ''}`
      const response = await api.get(url)
      
      return {
        success: true,
        data: response.data.data,
        count: response.data.count
      }
    } catch (error) {
      console.error('Error fetching level questions:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch level questions',
        error: error.message
      }
    }
  },

  /**
   * Débloquer un niveau pour l'utilisateur connecté
   * @param {number} levelId - ID du niveau
   * @returns {Promise}
   */
  unlockLevel: async (levelId) => {
    try {
      const response = await api.post(`/levels/${levelId}/unlock`)
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error unlocking level:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to unlock level',
        error: error.message
      }
    }
  }
}

export default levelsService
