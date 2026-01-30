import React, { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { useAuth } from '../../contexts/AuthContext'
import './MultiplayerPuzzleGame.css'

export default function MultiplayerPuzzleGame({ roomCode, roomDetails, gameState, participants, onLeave }) {
  const { user } = useAuth()
  const { completeGame } = useSocket()
  const [startTime, setStartTime] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [puzzleState, setPuzzleState] = useState(null)

  const scores = gameState?.scores || {}
  const completionData = gameState?.completionData || {}

  // Initialize game data
  useEffect(() => {
    if (gameState?.gameData) {
      setPuzzleState(gameState.gameData)
      setStartTime(Date.now())
    }
  }, [gameState?.gameData])

  // Timer
  useEffect(() => {
    if (!startTime || gameCompleted) return

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 100)

    return () => clearInterval(interval)
  }, [startTime, gameCompleted])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleComplete = () => {
    if (!gameCompleted) {
      const finalTime = Math.floor((Date.now() - startTime) / 1000)
      completeGame(roomCode, finalTime)
      setGameCompleted(true)
    }
  }

  const getPlayerStatus = (participant) => {
    const completion = completionData[participant.userId]
    if (completion?.completed) {
      return {
        status: '✓ Finished',
        time: formatTime(completion.time),
        color: '#4caf50'
      }
    }
    if (completion?.progress !== undefined) {
      return {
        status: `${completion.progress}%`,
        time: '⏳',
        color: '#ff9800'
      }
    }
    return {
      status: 'Playing...',
      time: '⏳',
      color: '#2196f3'
    }
  }

  // Example puzzle: Word unscramble (can be adapted for other puzzle types)
  const renderPuzzleContent = () => {
    if (!puzzleState) {
      return (
        <div className="loading-puzzle">
          <div className="spinner"></div>
          <p>Loading puzzle...</p>
        </div>
      )
    }

    // For demo: Simple word unscramble
    const { scrambledWord, hint, solution } = puzzleState

    return (
      <div className="puzzle-content">
        <div className="puzzle-hint">
          <strong>Hint:</strong> {hint}
        </div>
        <div className="scrambled-letters">
          {scrambledWord?.split('').map((letter, idx) => (
            <div key={idx} className="letter-box">
              {letter}
            </div>
          ))}
        </div>
        <input
          type="text"
          className="puzzle-input"
          placeholder="Type your answer..."
          disabled={gameCompleted}
          autoFocus
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target.value.toLowerCase() === solution.toLowerCase()) {
              handleComplete()
            }
          }}
        />
        {gameCompleted && (
          <div className="completion-message">
            <div className="checkmark">✓</div>
            <h3>Puzzle Completed!</h3>
            <p>Your time: <strong>{formatTime(elapsedTime)}</strong></p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="multiplayer-puzzle-container">
      {/* Header */}
      <header className="game-header">
        <div className="header-left">
          <button className="leave-btn" onClick={onLeave}>
            ← Leave
          </button>
          <h2>{roomDetails?.name}</h2>
        </div>
        <div className="header-center">
          <div className="puzzle-type">🧩 Puzzle Race</div>
        </div>
        <div className="header-right">
          <div className="timer">{formatTime(elapsedTime)}</div>
        </div>
      </header>

      <div className="game-content">
        {/* Live Leaderboard */}
        <div className="live-leaderboard">
          <h3>🏁 Race Status</h3>
          <div className="players-status">
            {participants
              .sort((a, b) => {
                const aTime = completionData[a.userId]?.time || Infinity
                const bTime = completionData[b.userId]?.time || Infinity
                return aTime - bTime
              })
              .map((participant, index) => {
                const status = getPlayerStatus(participant)
                const isFinished = completionData[participant.userId]?.completed
                return (
                  <div 
                    key={participant.userId}
                    className={`player-status-card ${participant.userId === user?.id ? 'current-user' : ''} ${isFinished ? 'finished' : ''}`}
                  >
                    <div className="position">
                      {isFinished ? `#${index + 1}` : '—'}
                    </div>
                    <div className="player-info">
                      <div className="player-name">
                        {participant.username}
                        {!participant.isConnected && <span className="disconnected-badge">🔌</span>}
                      </div>
                      <div 
                        className="player-progress"
                        style={{ color: status.color }}
                      >
                        {status.status}
                      </div>
                    </div>
                    <div className="player-time">
                      {status.time}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Puzzle Panel */}
        <div className="puzzle-panel">
          {renderPuzzleContent()}
        </div>
      </div>
    </div>
  )
}
