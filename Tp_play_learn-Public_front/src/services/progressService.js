import api from './api'

/**
 * Service pour gérer la progression utilisateur depuis l'API backend
 */
const progressService = {
  /**
   * Récupérer toute la progression de l'utilisateur connecté
   * @returns {Promise}
   */
  getUserProgress: async () => {
    try {
      const response = await api.get('/progress')
      
      return {
        success: true,
        data: response.data.data,
        count: response.data.count
      }
    } catch (error) {
      console.error('Error fetching user progress:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user progress',
        error: error.message
      }
    }
  },

  /**
   * Récupérer la progression pour un jeu spécifique
   * @param {string} gameId - Identifiant du jeu
   * @returns {Promise}
   */
  getGameProgress: async (gameId) => {
    try {
      const response = await api.get(`/progress/game/${gameId}`)
      
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Error fetching game progress:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch game progress',
        error: error.message
      }
    }
  },

  /**
   * Récupérer les statistiques globales de progression
   * @returns {Promise}
   */
  getProgressStats: async () => {
    try {
      const response = await api.get('/progress/stats')
      
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Error fetching progress stats:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch progress stats',
        error: error.message
      }
    }
  },

  /**
   * Enregistrer la complétion d'un niveau
   * @param {number} levelId - ID du niveau
   * @param {Object} data - { score, maxScore, timeSpent, metadata }
   * @returns {Promise}
   */
  completeLevel: async (levelId, data) => {
    try {
      const response = await api.post(`/progress/level/${levelId}/complete`, data)
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error completing level:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to complete level',
        error: error.message
      }
    }
  },

  /**
   * Réinitialiser la progression d'un niveau
   * @param {number} levelId - ID du niveau
   * @returns {Promise}
   */
  resetLevelProgress: async (levelId) => {
    try {
      const response = await api.delete(`/progress/level/${levelId}/reset`)
      
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error resetting level progress:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset level progress',
        error: error.message
      }
    }
  }
}

export default progressService
