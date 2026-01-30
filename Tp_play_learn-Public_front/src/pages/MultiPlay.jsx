import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import MultiplayerQuizGame from '../games/multiplayer/MultiplayerQuizGame'
import MultiplayerSpeedMath from '../games/multiplayer/MultiplayerSpeedMath'
import MultiplayerPuzzleGame from '../games/multiplayer/MultiplayerPuzzleGame'
import '../styles/multi-play.css'

export default function MultiPlay() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { gameState, participants, leaveRoom } = useSocket()
  const [roomDetails, setRoomDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const token = localStorage.getItem('token')
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        
        const response = await fetch(`${API_URL}/multiplayer/rooms/${roomCode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!response.ok) throw new Error('Room not found')
        const data = await response.json()
        setRoomDetails(data.room)
      } catch (err) {
        setError(err.message)
      }
    }

    if (roomCode && user) fetchRoomDetails()
  }, [roomCode, user])

  const handleLeaveRoom = async () => {
    if (confirm('Leave game?')) {
      try {
        const token = localStorage.getItem('token')
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        await fetch(`${API_URL}/multiplayer/rooms/${roomCode}/leave`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        leaveRoom()
        navigate('/lobby')
      } catch (err) {
        console.error(err)
      }
    }
  }

  useEffect(() => {
    if (gameState?.status === 'finished') {
      setTimeout(() => navigate('/lobby'), 5000)
    }
  }, [gameState?.status, navigate])

  if (error) {
    return (
      <div className="multi-wrap">
        <div className="error-container">
          <h2> Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/lobby')}>Back to Lobby</button>
        </div>
      </div>
    )
  }

  if (!roomDetails || !gameState) {
    return (
      <div className="multi-wrap">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading game...</p>
        </div>
      </div>
    )
  }

  if (gameState.status === 'finished' && gameState.rankings) {
    return (
      <div className="multi-wrap">
        <div className="results-container">
          <h1> Game Over!</h1>
          <div className="podium">
            {gameState.rankings.slice(0, 3).map((player, index) => (
              <div key={player.userId} className={`podium-place place-${index + 1}`}>
                <div className="rank-badge">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>
                <div className="player-name">{player.username}</div>
                <div className="player-score">{player.score} pts</div>
              </div>
            ))}
          </div>
          <div className="full-rankings">
            <h3>Final Rankings</h3>
            <ul>
              {gameState.rankings.map((player, index) => (
                <li key={player.userId} className={player.userId === user?.id ? 'current-user' : ''}>
                  <span className="rank">#{index + 1}</span>
                  <span className="name">{player.username}</span>
                  <span className="score">{player.score} pts</span>
                </li>
              ))}
            </ul>
          </div>
          <button className="back-to-lobby-btn" onClick={() => navigate('/lobby')}>
            Back to Lobby
          </button>
        </div>
      </div>
    )
  }

  const renderGameComponent = () => {
    const gameMode = roomDetails.gameMode || gameState.gameMode
    const props = { roomCode, roomDetails, gameState, participants, onLeave: handleLeaveRoom }

    switch (gameMode) {
      case 'quiz': return <MultiplayerQuizGame {...props} />
      case 'speed': return <MultiplayerSpeedMath {...props} />
      case 'puzzle':
      case 'memory': return <MultiplayerPuzzleGame {...props} />
      default:
        return (
          <div className="error-container">
            <h2>Unsupported Game Mode</h2>
            <p>Game mode "{gameMode}" not implemented yet.</p>
            <button onClick={handleLeaveRoom}>Leave Room</button>
          </div>
        )
    }
  }

  return <div className="multi-wrap">{renderGameComponent()}</div>
}
