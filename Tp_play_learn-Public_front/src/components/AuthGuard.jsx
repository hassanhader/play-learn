import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AuthGuard = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0f1020 0%, #1b1f3b 100%)',
        color: '#e8eaf6',
        fontSize: '18px'
      }}>
        Chargement...
      </div>
    )
  }

  // If not authenticated, redirect to login with the current location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If authenticated, render the protected component
  return children
}

export default AuthGuard