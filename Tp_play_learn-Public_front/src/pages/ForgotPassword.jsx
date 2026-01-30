import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/login.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    // Validation
    if (!email.trim()) {
      setError('L\'email est requis')
      setIsLoading(false)
      return
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer un email valide')
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, this would send an email with reset link
      setMessage('Un email de réinitialisation a été envoyé à votre adresse email.')
      
      // Optionally redirect after showing message
      setTimeout(() => {
        navigate('/login')
      }, 3000)
      
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="login-title">Mot de passe oublié</h1>
        
        <p style={{ 
          color: 'var(--muted)', 
          textAlign: 'center', 
          marginBottom: '24px',
          fontSize: '14px',
          lineHeight: 1.5
        }}>
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: 'rgba(98, 211, 138, 0.1)',
            color: '#62d38a',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(98, 211, 138, 0.3)',
            fontSize: '14px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre adresse email"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
          </button>
        </form>

        <div className="form-footer">
          <Link to="/login" className="form-link">
            ← Retour à la connexion
          </Link>
          <br />
          <span style={{ color: 'var(--muted)' }}>
            Vous n'avez pas de compte ? {' '}
            <Link to="/register" className="form-link">
              S'inscrire
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}