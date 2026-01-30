import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/login.css'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required')
      setIsLoading(false)
      return
    }

    if (formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters')
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError('Email is required')
      setIsLoading(false)
      return
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    if (!formData.password) {
      setError('Password is required')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      // Call API via AuthContext
      const result = await register(
        formData.username.trim(),
        formData.email.trim(),
        formData.password
      )
      
      if (result.success) {
        // Navigate to main app
        navigate('/', { replace: true })
      } else {
        setError(result.message || 'Registration failed')
      }
      
    } catch (err) {
      setError('Erreur lors de l\'inscription. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="login-title">Create an Account</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Choose a password"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="form-footer">
          Already have an account? {' '}
          <Link to="/login" className="form-link">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}