import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [isGuest, setIsGuest] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check authentication status on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = authService.isAuthenticated()
        
        if (isAuth) {
          // Récupérer l'utilisateur depuis localStorage ou API
          const storedUser = authService.getUser()
          if (storedUser) {
            setIsAuthenticated(true)
            setUser(storedUser)
            setUsername(storedUser.username)
            setIsGuest(storedUser.isGuest || false)
          } else {
            // Token existe mais pas d'info utilisateur, vérifier avec l'API
            try {
              const response = await authService.getCurrentUser()
              if (response.success) {
                setIsAuthenticated(true)
                setUser(response.user)
                setUsername(response.user.username)
                setIsGuest(response.user.isGuest || false)
              }
            } catch (err) {
              // Token invalide, déconnecter
              logout()
            }
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Register
  const register = async (username, email, password) => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await authService.register(username, email, password)
      
      if (response.success) {
        setIsAuthenticated(true)
        setUser(response.user)
        setUsername(response.user.username)
        setIsGuest(false)
        return { success: true }
      }
      
      return { success: false, message: response.message }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Login
  const login = async (email, password) => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await authService.login(email, password)
      
      if (response.success) {
        setIsAuthenticated(true)
        setUser(response.user)
        setUsername(response.user.username)
        setIsGuest(false)
        return { success: true }
      }
      
      return { success: false, message: response.message }
    } catch (error) {
      const errorMessage = error.message || 'Login failed'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Guest Login
  const loginAsGuest = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      const response = await authService.guestLogin()
      
      if (response.success) {
        setIsAuthenticated(true)
        setUser(response.user)
        setUsername(response.user.username)
        setIsGuest(true)
        return { success: true }
      }
      
      return { success: false, message: response.message }
    } catch (error) {
      const errorMessage = error.message || 'Guest login failed'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout
  const logout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setUser(null)
    setUsername('')
    setIsGuest(false)
    setError(null)
  }

  const value = {
    isAuthenticated,
    user,
    username,
    isGuest,
    isLoading,
    error,
    register,
    login,
    loginAsGuest,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}