import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/login.css'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, loginAsGuest, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location.state])

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
    if (!formData.email.trim()) {
      setError('Email is required')
      setIsLoading(false)
      return
    }

    if (!formData.password) {
      setError('Password is required')
      setIsLoading(false)
      return
    }

    try {
      // Call API via AuthContext
      const result = await login(formData.email.trim(), formData.password)
      
      if (result.success) {
        // Navigate to intended page or home
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      } else {
        setError(result.message || 'Invalid email or password')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    loginAsGuest()
    const from = location.state?.from?.pathname || '/'
    navigate(from, { replace: true })
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="form" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password" className="form-link">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ margin: '16px 0', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '16px 0',
            color: 'var(--muted)',
            fontSize: '14px'
          }}>
            <hr style={{ flex: 1, border: 'none', height: '1px', background: 'var(--border)' }} />
            <span style={{ margin: '0 16px' }}>ou</span>
            <hr style={{ flex: 1, border: 'none', height: '1px', background: 'var(--border)' }} />
          </div>
          
          <button 
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: 'transparent',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'var(--border)'
              e.target.style.color = 'var(--fg)'
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = 'var(--muted)'
            }}
          >
            🎮 Continuer en tant qu'invité
          </button>
        </div>

        <div className="form-footer">
          Vous n'avez pas de compte ? {' '}
          <Link to="/register" className="form-link">
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  )
}