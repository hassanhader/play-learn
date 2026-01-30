import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import '../styles/game-ready.css'

export default function GameReady() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket, isConnected } = useSocket() || {}
  const [roomDetails, setRoomDetails] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = localStorage.getItem('token')
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        
        // Charger les détails de la room
        const response = await fetch(`${API_URL}/multiplayer/rooms/${roomCode}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Room not found')
        }

        const data = await response.json()
        setRoomDetails(data.room)
        setParticipants(data.room.participants || [])
        setLoading(false)
      } catch (err) {
        console.error('Error loading room data:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [roomCode])

  // Écouter l'événement de lancement du jeu via Socket.io
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log('⚠️ Socket not ready:', { socket: !!socket, isConnected })
      return
    }

    // Rejoindre la room Socket.io
    console.log('🔌 Joining Socket.io room for game launch:', roomCode)
    socket.emit('join-room', { roomCode, userId: user.id, username: user.username })

    // Écouter le lancement du jeu
    const handleGameStart = (data) => {
      console.log('🚀 Game started by host, redirecting all participants...', data)
      // Rediriger tous les participants vers le jeu
      navigate(`/multiplayer-game/${roomCode}`)
    }

    // Écouter les mises à jour de la room (status change)
    const handleRoomUpdate = (data) => {
      console.log('📡 Room updated:', data)
      if (data.room?.status === 'in-progress' || data.status === 'in-progress') {
        console.log('🎮 Game status changed to in-progress, redirecting...')
        navigate(`/multiplayer-game/${roomCode}`)
      }
    }

    // Écouter l'événement custom de démarrage
    const handleStartGameBroadcast = (data) => {
      console.log('📢 Start game broadcast received:', data)
      if (data.roomCode === roomCode) {
        navigate(`/multiplayer-game/${roomCode}`)
      }
    }

    socket.on('game-started', handleGameStart)
    socket.on('room-updated', handleRoomUpdate)
    socket.on('start-game-broadcast', handleStartGameBroadcast)

    return () => {
      socket.off('game-started', handleGameStart)
      socket.off('room-updated', handleRoomUpdate)
      socket.off('start-game-broadcast', handleStartGameBroadcast)
      console.log('👋 Leaving game-ready room:', roomCode)
    }
  }, [socket, isConnected, roomCode, user, navigate])

  const handleBackHome = () => {
    navigate('/')
  }

  const handleStartGame = async () => {
    if (!isHost) {
      console.log('⚠️ Only host can start the game')
      return
    }

    console.log('🚀 Host starting game, broadcasting to all participants...')
    
    // Méthode 1: Émettre start-game (nouveau format)
    if (socket && isConnected) {
      console.log('📤 Method 1: Emitting start-game event')
      socket.emit('start-game', { 
        roomCode, 
        hostId: user.id,
        timestamp: Date.now()
      })
    }

    // Méthode 2: Émettre startGame (ancien format - backward compatibility)
    if (socket && isConnected) {
      console.log('📤 Method 2: Emitting startGame (legacy)')
      socket.emit('startGame', { 
        roomCode, 
        userId: user.id
      })
    }

    // Méthode 3: API REST (backup si Socket échoue)
    try {
      const token = localStorage.getItem('token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      console.log('📤 Method 3: Updating room status via API...')
      const response = await fetch(`${API_URL}/multiplayer/rooms/${roomCode}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hostId: user.id })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ API call successful:', data)
      } else {
        console.warn('⚠️ API call failed:', response.status)
      }
    } catch (err) {
      console.warn('⚠️ Failed to update room status via API:', err)
    }

    // Attendre 500ms pour propagation
    await new Promise(resolve => setTimeout(resolve, 500))

    // Rediriger l'hôte
    console.log('🚀 Redirecting host to game...')
    navigate(`/multiplayer-game/${roomCode}`)
  }

  if (loading) {
    return (
      <div className="game-ready-wrap">
        <div className="loading">Chargement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="game-ready-wrap">
        <div className="error-message">
          <h2>❌ Erreur</h2>
          <p>{error}</p>
          <button onClick={handleBackHome}>Retour à l'accueil</button>
        </div>
      </div>
    )
  }

  const minPlayers = roomDetails?.game?.minPlayers || roomDetails?.minPlayers || 2
  const isHost = roomDetails?.host?.id === user?.id

  return (
    <div className="game-ready-wrap">
      <header className="topbar">
        <button className="back" onClick={handleBackHome}>← Accueil</button>
        <h1 className="brand">Partie Prête!</h1>
        <div className="status-badge">
          {isHost && <span className="host-indicator">👑 Hôte</span>}
        </div>
      </header>

      <main className="game-ready-content">
        <section className="ready-header">
          <div className="ready-icon">🎮</div>
          <h2>La partie est prête à commencer!</h2>
          <p className="room-code-display">Code de la room: <strong>{roomCode}</strong></p>
        </section>

        <section className="game-info-card">
          <h3>📋 Informations de la partie</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Jeu:</span>
              <span className="value">{roomDetails?.game?.title || roomDetails?.game?.name || roomDetails?.gameName || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="label">Difficulté:</span>
              <span className="value">{roomDetails?.game?.difficulty || roomDetails?.difficulty || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="label">Catégorie:</span>
              <span className="value">{roomDetails?.game?.category || roomDetails?.category || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="label">Joueurs requis:</span>
              <span className="value">{minPlayers} minimum</span>
            </div>
            <div className="info-item">
              <span className="label">Joueurs actuels:</span>
              <span className="value">{participants.length}</span>
            </div>
            <div className="info-item">
              <span className="label">Maximum:</span>
              <span className="value">{roomDetails?.maxPlayers || 'N/A'}</span>
            </div>
          </div>
        </section>

        <section className="participants-section">
          <h3>👥 Participants ({participants.length})</h3>
          <div className="participants-list">
            {participants.map((participant, index) => (
              <div key={participant.userId || index} className="participant-card">
                <div className="participant-number">{index + 1}</div>
                <div className="participant-info">
                  <span className="participant-name">{participant.username || participant.user?.username || 'Joueur inconnu'}</span>
                  {participant.userId === roomDetails?.host?.id && (
                    <span className="crown-badge">👑</span>
                  )}
                </div>
                <div className="participant-status">
                  {participant.isReady ? (
                    <span className="ready-badge">✓ Prêt</span>
                  ) : (
                    <span className="waiting-badge">⏳</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="info-message">
          <div className="info-box">
            <p>
              <strong>ℹ️ Note:</strong> La logique complète du jeu sera ajoutée ultérieurement.
              Pour le moment, vous pouvez voir tous les participants qui sont prêts à jouer.
            </p>
          </div>
        </section>

        <section className="actions-section">
          {isHost ? (
            <button 
              className="start-game-btn"
              onClick={handleStartGame}
            >
              🚀 Lancer le Jeu pour Tous
            </button>
          ) : (
            <div className="waiting-host-message">
              <p>⏳ En attente que l'hôte lance la partie...</p>
            </div>
          )}
          <button className="home-btn secondary" onClick={handleBackHome}>
            🏠 Retour à l'accueil
          </button>
        </section>
      </main>
    </div>
  )
}
