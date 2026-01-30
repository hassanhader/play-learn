import api from './api'

// Service d'authentification
const authService = {
  // Inscription
  register: async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      })
      
      if (response.data.success) {
        // Sauvegarder le token et les infos utilisateur
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' }
    }
  },

  // Connexion
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      })
      
      if (response.data.success) {
        // Sauvegarder le token et les infos utilisateur
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' }
    }
  },

  // Connexion invité
  guestLogin: async () => {
    try {
      const response = await api.post('/auth/guest')
      
      if (response.data.success) {
        // Sauvegarder le token et les infos utilisateur
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' }
    }
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' }
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = localStorage.getItem('token')
    return !!token
  },

  // Obtenir l'utilisateur depuis localStorage
  getUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
}

export default authService
