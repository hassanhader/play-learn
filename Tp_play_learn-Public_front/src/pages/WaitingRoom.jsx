import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import '../styles/waiting-room.css'

export default function WaitingRoom() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { 
    socket,
    joinRoom, 
    setReady, 
    startGame, 
    leaveRoom, 
    participants = [], 
    gameState,
    isConnected 
  } = useSocket() || {}
  
  const [roomDetails, setRoomDetails] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [localParticipants, setLocalParticipants] = useState([])
  const countdownIntervalRef = useRef(null)

  useEffect(() => {
    // Charger les détails de la salle et joindre
    const fetchRoomDetails = async () => {
      try {
        const token = localStorage.getItem('token')
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        
        // 1. Charger les détails de la room
        const detailsResponse = await fetch(`${API_URL}/multiplayer/rooms/${roomCode}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!detailsResponse.ok) {
          throw new Error('Room not found')
        }

        const detailsData = await detailsResponse.json()
        console.log('📥 Room details loaded:', detailsData.room)
        setRoomDetails(detailsData.room)
        
        // 2. Vérifier si l'utilisateur est déjà participant
        const isAlreadyParticipant = detailsData.room.participants?.some(
          p => (p.userId || p.user?.id) === user.id
        )
        
        // 3. Si pas encore participant, rejoindre via l'API REST
        if (!isAlreadyParticipant) {
          console.log('🚪 Not a participant yet, joining room via API...')
          const joinResponse = await fetch(`${API_URL}/multiplayer/rooms/${roomCode}/join`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (!joinResponse.ok) {
            const joinData = await joinResponse.json()
            throw new Error(joinData.message || 'Failed to join room')
          }
          
          console.log('✅ Successfully joined room via API')
          
          // Recharger les détails après avoir rejoint
          const updatedResponse = await fetch(`${API_URL}/multiplayer/rooms/${roomCode}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (updatedResponse.ok) {
            const updatedData = await updatedResponse.json()
            setRoomDetails(updatedData.room)
            console.log('🔄 Reloaded room details with updated participants')
          }
        }
        
        // 4. Charger les participants mis à jour
        const finalResponse = await fetch(`${API_URL}/multiplayer/rooms/${roomCode}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (finalResponse.ok) {
          const finalData = await finalResponse.json()
          console.log('👥 Initial participants from API:', finalData.room.participants)
          
          // Initialiser localParticipants avec les données de l'API
          if (finalData.room.participants && Array.isArray(finalData.room.participants)) {
            const formattedParticipants = finalData.room.participants.map(p => ({
              userId: p.userId || p.user?.id,
              username: p.user?.username || 'Unknown',
              isReady: p.isReady || false,
              isConnected: p.isConnected !== false, // true par défaut
              joinedAt: p.createdAt
            }))
            console.log('🎯 Setting local participants:', formattedParticipants)
            setLocalParticipants(formattedParticipants)
          }
        }
        
        // 5. Rejoindre la room Socket.io après avoir rejoint via l'API
        if (isConnected && user) {
          console.log('🔌 Joining Socket.io room:', roomCode)
          joinRoom(roomCode)
        }
      } catch (err) {
        setError(err.message)
        console.error('Error fetching room:', err)
      }
    }

    if (roomCode && user) {
      fetchRoomDetails()
    }

    return () => {
      // Cleanup: quitter la room à la sortie du composant
      if (roomCode) {
        console.log('👋 Leaving room:', roomCode)
        leaveRoom()
      }
    }
  }, [roomCode, user, isConnected])
  
  // Sync Socket participants to local state
  useEffect(() => {
    if (participants && Array.isArray(participants) && participants.length > 0) {
      console.log('👥 Socket participants updated, syncing to local:', participants)
      setLocalParticipants(participants)
      
      // Sync isReady state with current user's participant status
      const currentUserParticipant = participants.find(p => p.userId === user?.id)
      if (currentUserParticipant) {
        setIsReady(currentUserParticipant.isReady)
        console.log('✅ Synced isReady state:', currentUserParticipant.isReady)
      }
    }
  }, [participants, user])
  
  // Sync isReady from localParticipants on initial load
  useEffect(() => {
    if (localParticipants && localParticipants.length > 0 && user) {
      const currentUserParticipant = localParticipants.find(p => p.userId === user.id)
      if (currentUserParticipant) {
        setIsReady(currentUserParticipant.isReady)
        console.log('🎯 Initial isReady state from API:', currentUserParticipant.isReady)
      }
    }
  }, [localParticipants, user])
  
  // Use either Socket participants or local participants (fallback)
  const displayParticipants = participants?.length > 0 ? participants : localParticipants

  // Écouter les événements de démarrage du jeu (pour les non-hôtes)
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleGameStarted = (data) => {
      console.log('🚀 Game started event received, redirecting...', data)
      navigate(`/multiplayer-game/${roomCode}`)
    }

    const handleRoomUpdated = (data) => {
      if (data.room?.status === 'in-progress' || data.status === 'in-progress') {
        console.log('🎮 Room status changed to in-progress, redirecting...')
        navigate(`/multiplayer-game/${roomCode}`)
      }
    }

    socket.on('game-started', handleGameStarted)
    socket.on('start-game-broadcast', handleGameStarted)
    socket.on('room-updated', handleRoomUpdated)
    socket.on('gameStarted', handleGameStarted) // Legacy

    return () => {
      socket.off('game-started', handleGameStarted)
      socket.off('start-game-broadcast', handleGameStarted)
      socket.off('room-updated', handleRoomUpdated)
      socket.off('gameStarted', handleGameStarted)
    }
  }, [socket, isConnected, roomCode, navigate])

  // Rediriger vers le jeu quand il démarre (legacy gameState)
  useEffect(() => {
    console.log('🎮 Game state changed:', gameState)
    if (gameState?.status === 'playing' || gameState?.status === 'in-progress') {
      console.log('✅ Game is playing! Navigating to multiplayer game...')
      navigate(`/multiplayer-game/${roomCode}`)
    }
  }, [gameState, roomCode, navigate])

  // Vérifier si tous les joueurs sont prêts et démarrer/annuler le compte à rebours
  useEffect(() => {
    if (!displayParticipants || !roomDetails) return

    const readyCount = displayParticipants.filter(p => p.isReady).length
    const totalCount = displayParticipants.length
    const minPlayers = roomDetails?.game?.minPlayers || roomDetails?.minPlayers || 2
    const allReady = totalCount >= minPlayers && displayParticipants.every(p => p.isReady)
    
    console.log(`🎮 Game start check: ${readyCount}/${totalCount} ready, minPlayers=${minPlayers}, allReady=${allReady}`)

    if (allReady && countdown === null) {
      console.log('🚀 Starting countdown from 5!')
      setCountdown(5)
    } else if (!allReady && countdown !== null) {
      console.log('⏸️ Countdown cancelled, not all ready')
      setCountdown(null)
    }
  }, [displayParticipants, roomDetails, countdown])

  // Gérer le décompte du compte à rebours
  useEffect(() => {
    // Si pas de countdown actif, ne rien faire
    if (countdown === null || countdown < 0) {
      return
    }

    console.log(`⏱️ Countdown at: ${countdown}`)

    // Si countdown atteint 0, lancer le jeu directement pour TOUS les participants
    if (countdown === 0) {
      console.log('🎮 Countdown finished! Starting game for all participants...')
      setCountdown(-1) // Empêcher de redémarrer
      
      // Si on est l'hôte, émettre l'événement de démarrage
      if (isHost && socket && isConnected) {
        console.log('🚀 Host broadcasting start-game event to all participants')
        socket.emit('start-game', { 
          roomCode, 
          hostId: user.id,
          timestamp: Date.now()
        })
        
        // Aussi émettre le format legacy
        socket.emit('startGame', { roomCode, userId: user.id })
      }
      
      // Rediriger DIRECTEMENT vers le jeu (tous les participants)
      console.log('🎮 Redirecting to multiplayer game:', `/multiplayer-game/${roomCode}`)
      navigate(`/multiplayer-game/${roomCode}`)
      return
    }

    // Créer un timer pour décrémenter après 1 seconde
    const timer = setTimeout(() => {
      console.log(`⬇️ Decrementing countdown from ${countdown} to ${countdown - 1}`)
      setCountdown(countdown - 1)
    }, 1000)

    // Cleanup : annuler le timer si le composant se démonte ou si countdown change
    return () => {
      clearTimeout(timer)
    }
  }, [countdown, roomCode, startGame])

  const handleReadyToggle = () => {
    const newReadyState = !isReady
    setIsReady(newReadyState)
    setReady(roomCode, newReadyState)
  }

  const handleStartGame = () => {
    startGame(roomCode)
  }

  const handleLeaveRoom = async () => {
    try {
      const token = localStorage.getItem('token')
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      await fetch(`${API_URL}/multiplayer/rooms/${roomCode}/leave`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      leaveRoom()
      navigate('/')
    } catch (err) {
      console.error('Error leaving room:', err)
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    alert('Room code copied to clipboard!')
  }

  if (error) {
    return (
      <div className="waiting-room-wrap">
        <div className="error-message">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/lobby')}>Back to Lobby</button>
        </div>
      </div>
    )
  }

  if (!roomDetails) {
    return (
      <div className="waiting-room-wrap">
        <div className="loading">Loading room...</div>
      </div>
    )
  }

  const isHost = roomDetails.host?.id === user?.id
  const allReady = displayParticipants?.length >= 2 && displayParticipants?.every(p => p.isReady)

  return (
    <div className="waiting-room-wrap">
      <header className="topbar">
        <button className="back" onClick={handleLeaveRoom}>← Leave Room</button>
        <h1 className="brand">Waiting Room</h1>
        <div className="connection-status">
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          <span style={{marginLeft: '10px', fontSize: '12px'}}>
            ({displayParticipants?.length || 0} players)
          </span>
        </div>
      </header>

      <main className="waiting-room-content">
        {/* Room Info */}
        <section className="room-info-card">
          <div className="room-header">
            <h2>{roomDetails.name}</h2>
            {isHost && <span className="host-badge">👑 Host</span>}
          </div>
          
          <div className="room-code-section">
            <div className="room-code-display">
              <span className="label">Room Code:</span>
              <span className="code">{roomCode}</span>
            </div>
            <button className="copy-btn" onClick={copyRoomCode}>
              📋 Copy
            </button>
          </div>

          <div className="room-meta">
            <div className="meta-item">
              <span className="icon">🎮</span>
              <span>{roomDetails.game?.name}</span>
            </div>
            <div className="meta-item">
              <span className="icon">📊</span>
              <span>{roomDetails.difficulty}</span>
            </div>
            <div className="meta-item">
              <span className="icon">🏷️</span>
              <span>{roomDetails.category}</span>
            </div>
            <div className="meta-item">
              <span className="icon">👥</span>
              <span>{displayParticipants?.length || roomDetails.currentPlayers}/{roomDetails.maxPlayers} players</span>
            </div>
          </div>
        </section>

        {/* Players List */}
        <section className="players-section">
          <h3>Players ({displayParticipants?.length || 0}/{roomDetails.maxPlayers})</h3>
          <div className="ready-status">
            {displayParticipants?.filter(p => p.isReady).length || 0} / {displayParticipants?.length || 0} Ready
          </div>
          
          <ul className="players-list">
            {displayParticipants?.map((participant) => (
              <li 
                key={participant.userId} 
                className={`player-item ${participant.isReady ? 'ready' : 'not-ready'} ${!participant.isConnected ? 'disconnected' : ''}`}
              >
                <div className="player-info">
                  <span className="player-name">
                    {participant.username}
                    {participant.userId === roomDetails.host?.id && ' 👑'}
                  </span>
                  {!participant.isConnected && <span className="status-text">(Disconnected)</span>}
                </div>
                <div className="player-status">
                  {participant.isReady ? (
                    <span className="ready-badge">✓ Ready</span>
                  ) : (
                    <span className="waiting-badge">⏳ Waiting...</span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {(displayParticipants?.length || 0) < roomDetails.maxPlayers && (
            <div className="waiting-for-players">
              Waiting for more players to join...
            </div>
          )}
        </section>

        {/* Countdown */}
        {countdown !== null && (
          <section className="countdown-section">
            <div className="countdown-circle">
              <span className="countdown-number">{countdown}</span>
            </div>
            <p className="countdown-text">La partie commence dans...</p>
          </section>
        )}

        {/* Actions */}
        <section className="actions-section">
          <button 
            className={`ready-btn ${isReady ? 'ready-active' : ''}`}
            onClick={handleReadyToggle}
            disabled={countdown !== null}
          >
            {countdown !== null ? '⏱️ Démarrage...' : isReady ? '✓ Prêt!' : 'Je suis prêt'}
          </button>
          
          {isHost && (
            <div className="host-actions">
              <button 
                className="start-game-btn"
                onClick={handleStartGame}
                disabled={!allReady || countdown !== null}
              >
                {countdown !== null ? '⏱️ Démarrage...' : allReady ? '🚀 Lancer le jeu' : '⏳ En attente des joueurs...'}
              </button>
              {!allReady && countdown === null && (
                <p className="hint">Tous les joueurs doivent être prêts</p>
              )}
            </div>
          )}
        </section>

        {/* Instructions */}
        <section className="instructions">
          <h4>How to Play</h4>
          <ul>
            <li>Share the room code with your friends</li>
            <li>Wait for all players to join</li>
            <li>Click "Ready" when you're prepared</li>
            <li>Host will start the game when everyone is ready</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
