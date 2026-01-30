import api from './api'

/**
 * Service pour gérer les jeux depuis l'API backend
 */
const gamesService = {
  /**
   * Récupérer tous les jeux avec filtres optionnels
   * @param {Object} filters - { category, type, difficulty, search }
   * @returns {Promise}
   */
  getAllGames: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.type) params.append('type', filters.type)
      if (filters.difficulty) params.append('difficulty', filters.difficulty)
      if (filters.search) params.append('search', filters.search)
      if (filters.isEnabled !== undefined) params.append('isEnabled', filters.isEnabled)
      
      const queryString = params.toString()
      const url = queryString ? `/games?${queryString}` : '/games'
      
      const response = await api.get(url)
      
      return {
        success: true,
        data: response.data.data,
        count: response.data.count
      }
    } catch (error) {
      console.error('Error fetching games:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch games',
        error: error.message
      }
    }
  },

  /**
   * Récupérer un jeu spécifique par son gameId
   * @param {string} gameId - Identifiant du jeu
   * @returns {Promise}
   */
  getGameById: async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}`)
      
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Error fetching game:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch game',
        error: error.message
      }
    }
  },

  /**
   * Récupérer tous les niveaux d'un jeu
   * @param {string} gameId - Identifiant du jeu
   * @returns {Promise}
   */
  getGameLevels: async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}/levels`)
      
      return {
        success: true,
        data: response.data.data,
        count: response.data.count
      }
    } catch (error) {
      console.error('Error fetching game levels:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch game levels',
        error: error.message
      }
    }
  },

  /**
   * Récupérer les catégories disponibles
   * @returns {Promise}
   */
  getCategories: async () => {
    try {
      const response = await api.get('/games/categories')
      
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch categories',
        error: error.message
      }
    }
  },

  /**
   * Incrémenter le compteur de jeu
   * @param {string} gameId - Identifiant du jeu
   * @returns {Promise}
   */
  incrementPlayCount: async (gameId) => {
    try {
      const response = await api.post(`/games/${gameId}/play`)
      
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      console.error('Error incrementing play count:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to increment play count',
        error: error.message
      }
    }
  },

  /**
   * Créer un nouveau jeu (admin/creator)
   * @param {Object} gameData - Données du jeu
   * @returns {Promise}
   */
  createGame: async (gameData) => {
    try {
      const response = await api.post('/games', gameData)
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error creating game:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create game',
        error: error.message
      }
    }
  },

  /**
   * Mettre à jour un jeu existant (admin/creator)
   * @param {number} gameId - ID du jeu à modifier
   * @param {Object} gameData - Nouvelles données du jeu
   * @returns {Promise}
   */
  updateGame: async (gameId, gameData) => {
    try {
      const response = await api.put(`/games/${gameId}`, gameData)
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (error) {
      console.error('Error updating game:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update game',
        error: error.message
      }
    }
  },

  /**
   * Récupérer un jeu par son ID (pour édition admin)
   * @param {number} id - ID du jeu (pas gameId)
   * @returns {Promise}
   */
  getGameByIdAdmin: async (id) => {
    try {
      const response = await api.get(`/admin/games/${id}`)
      
      return {
        success: true,
        data: response.data.game
      }
    } catch (error) {
      console.error('Error fetching game for admin:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch game',
        error: error.message
      }
    }
  }
}

export default gamesService
