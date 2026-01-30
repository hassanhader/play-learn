import api from './api'

/**
 * Scores Service
 * Handles all score-related API calls
 */

const scoresService = {
  /**
   * Save a new score
   * @param {Object} scoreData - Score data
   * @param {string} scoreData.gameId - Game identifier
   * @param {string} scoreData.gameTitle - Game title
   * @param {number} scoreData.score - Score value
   * @param {number} scoreData.maxScore - Maximum possible score (optional)
   * @param {string} scoreData.difficulty - Difficulty level (easy/medium/hard)
   * @param {string} scoreData.mode - Game mode (single/multiplayer)
   * @param {string} scoreData.category - Game category
   * @param {number} scoreData.duration - Game duration in seconds (optional)
   * @param {Object} scoreData.metadata - Additional data (optional)
   * @returns {Promise<Object>} Saved score with user info
   */
  async saveScore(scoreData) {
    try {
      console.log('📤 scoresService: Sending score data:', scoreData)
      const response = await api.post('/scores', scoreData)
      console.log('✅ scoresService: Response received:', response.data)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error('❌ scoresService: Error saving score:', error)
      console.error('❌ Response data:', error.response?.data)
      console.error('❌ Response status:', error.response?.status)
      
      // Extraire les erreurs de validation si elles existent
      const validationErrors = error.response?.data?.errors
      let errorMessage = error.response?.data?.message || 'Failed to save score'
      
      if (validationErrors && validationErrors.length > 0) {
        errorMessage = validationErrors.map(err => err.msg).join(', ')
      }
      
      return {
        success: false,
        message: errorMessage,
        errors: validationErrors
      }
    }
  },

  /**
   * Get user's score history
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @param {string} options.gameId - Filter by game ID (optional)
   * @param {string} options.category - Filter by category (optional)
   * @param {number} options.limit - Number of scores to fetch (default: 50)
   * @param {number} options.offset - Offset for pagination (default: 0)
   * @returns {Promise<Object>} User's scores with pagination info
   */
  async getUserScores(userId, options = {}) {
    try {
      const { gameId, category, limit = 50, offset = 0 } = options
      
      const params = new URLSearchParams({ limit, offset })
      if (gameId) params.append('gameId', gameId)
      if (category) params.append('category', category)

      const response = await api.get(`/scores/user/${userId}?${params}`)
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      console.error('Error fetching user scores:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch scores',
        data: []
      }
    }
  },

  /**
   * Get scores for a specific game (leaderboard)
   * @param {string} gameId - Game identifier
   * @param {Object} options - Query options
   * @param {string} options.difficulty - Filter by difficulty (optional)
   * @param {string} options.mode - Filter by mode (optional)
   * @param {number} options.limit - Number of scores to fetch (default: 100)
   * @returns {Promise<Object>} Game leaderboard scores
   */
  async getGameScores(gameId, options = {}) {
    try {
      const { difficulty, mode, limit = 100 } = options
      
      const params = new URLSearchParams({ limit })
      if (difficulty) params.append('difficulty', difficulty)
      if (mode) params.append('mode', mode)

      const response = await api.get(`/scores/game/${gameId}?${params}`)
      return {
        success: true,
        data: response.data.data,
        total: response.data.total
      }
    } catch (error) {
      console.error('Error fetching game scores:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch game scores',
        data: []
      }
    }
  },

  /**
   * Get user's best score for a specific game
   * @param {number} userId - User ID
   * @param {string} gameId - Game identifier
   * @param {string} difficulty - Filter by difficulty (optional)
   * @returns {Promise<Object>} Best score for the game
   */
  async getUserBestScore(userId, gameId, difficulty = null) {
    try {
      const params = difficulty ? `?difficulty=${difficulty}` : ''
      const response = await api.get(`/scores/user/${userId}/game/${gameId}/best${params}`)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      // 404 means no scores yet - not an error
      if (error.response?.status === 404) {
        return {
          success: true,
          data: null
        }
      }
      console.error('Error fetching best score:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch best score',
        data: null
      }
    }
  },

  /**
   * Get user's statistics
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User's game statistics
   */
  async getUserStats(userId) {
    try {
      const response = await api.get(`/scores/user/${userId}/stats`)
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch statistics',
        data: {
          totalGames: 0,
          totalScore: 0,
          averageScore: 0,
          gamesByCategory: [],
          gamesByDifficulty: [],
          recentGames: []
        }
      }
    }
  },

  /**
   * Delete a score
   * @param {number} scoreId - Score ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteScore(scoreId) {
    try {
      const response = await api.delete(`/scores/${scoreId}`)
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error deleting score:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete score'
      }
    }
  }
}

export default scoresService
