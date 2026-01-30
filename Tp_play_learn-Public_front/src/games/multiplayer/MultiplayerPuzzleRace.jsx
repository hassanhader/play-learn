import React, { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { useAuth } from '../../contexts/AuthContext'
import './MultiplayerGame.css'

export default function MultiplayerPuzzleRace({ roomCode, roomDetails, gameState, participants, onLeave }) {
  const { user } = useAuth()
  const { socket } = useSocket() || {}
  const [puzzlePieces, setPuzzlePieces] = useState([])
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [completedPieces, setCompletedPieces] = useState([])
  const [progress, setProgress] = useState({})
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const puzzleConfig = roomDetails?.game?.settings?.puzzleConfig || {}
  const gridSize = puzzleConfig.gridSize || 4
  const totalPieces = gridSize * gridSize
  const isHost = roomDetails?.host?.id === user?.id

  // Timer
  useEffect(() => {
    if (isFinished) return

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isFinished])

  // Initialiser le puzzle
  useEffect(() => {
    if (!puzzleConfig.imageUrl) return

    // Créer les pièces du puzzle
    const pieces = []
    for (let i = 0; i < totalPieces; i++) {
      pieces.push({
        id: i,
        correctPosition: i,
        currentPosition: i
      })
    }
    
    // Mélanger
    const shuffled = [...pieces].sort(() => Math.random() - 0.5)
    shuffled.forEach((piece, index) => {
      piece.currentPosition = index
    })
    
    setPuzzlePieces(shuffled)
  }, [puzzleConfig, totalPieces])

  // Écouter les updates
  useEffect(() => {
    if (!socket) return

    const handleProgressUpdate = (data) => {
      console.log('📊 Progress update:', data)
      setProgress(data.progress || {})
    }

    const handlePlayerFinished = (data) => {
      console.log('🏁 Player finished:', data)
      if (data.userId === user?.id) {
        setIsFinished(true)
      }
    }

    socket.on('puzzle-progress', handleProgressUpdate)
    socket.on('player-finished', handlePlayerFinished)

    return () => {
      socket.off('puzzle-progress', handleProgressUpdate)
      socket.off('player-finished', handlePlayerFinished)
    }
  }, [socket, user])

  const handlePieceClick = (piece) => {
    if (isFinished) return

    if (!selectedPiece) {
      setSelectedPiece(piece)
    } else if (selectedPiece.id === piece.id) {
      setSelectedPiece(null)
    } else {
      // Échanger les pièces
      const newPieces = [...puzzlePieces]
      const piece1Index = newPieces.findIndex(p => p.id === selectedPiece.id)
      const piece2Index = newPieces.findIndex(p => p.id === piece.id)
      
      const tempPos = newPieces[piece1Index].currentPosition
      newPieces[piece1Index].currentPosition = newPieces[piece2Index].currentPosition
      newPieces[piece2Index].currentPosition = tempPos
      
      setPuzzlePieces(newPieces)
      setSelectedPiece(null)

      // Vérifier si complet
      const completed = newPieces.filter(p => p.correctPosition === p.currentPosition)
      setCompletedPieces(completed.map(p => p.id))

      // Envoyer la progression
      if (socket) {
        socket.emit('update-puzzle-progress', {
          roomCode,
          userId: user.id,
          progress: (completed.length / totalPieces) * 100
        })

        // Vérifier si terminé
        if (completed.length === totalPieces && !isFinished) {
          socket.emit('puzzle-completed', {
            roomCode,
            userId: user.id,
            time: timeElapsed
          })
          setIsFinished(true)
        }
      }
    }
  }

  // Trier les participants par progression
  const sortedParticipants = [...participants].sort((a, b) => 
    (progress[b.userId] || 0) - (progress[a.userId] || 0)
  )

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="multiplayer-game-container puzzle-race">
      {/* Header */}
      <header className="game-header">
        <button className="leave-btn" onClick={onLeave}>← Quitter</button>
        <div className="game-info">
          <h2>🧩 Puzzle Race</h2>
          <div className="progress">
            {completedPieces.length} / {totalPieces} pièces
          </div>
        </div>
        <div className="timer">{formatTime(timeElapsed)}</div>
      </header>

      <div className="game-layout">
        {/* Colonne gauche: Progression */}
        <aside className="participants-sidebar">
          <h3>🏁 Progression</h3>
          <div className="players-list">
            {sortedParticipants.map((p, index) => {
              const playerProgress = progress[p.userId] || 0
              return (
                <div 
                  key={p.userId} 
                  className={`player-card ${p.userId === user?.id ? 'current' : ''}`}
                >
                  <div className={`player-rank rank-${index + 1}`}>#{index + 1}</div>
                  <div className="player-info">
                    <div className="player-name">
                      {p.username}
                      {p.userId === user?.id && ' (Vous)'}
                    </div>
                    <div className="player-progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${playerProgress}%`}}
                      />
                    </div>
                    <div className="player-progress-text">{playerProgress.toFixed(0)}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Zone centrale: Puzzle */}
        <main className="game-main puzzle-main">
          {puzzleConfig.imageUrl ? (
            <>
              <div 
                className="puzzle-grid" 
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  gridTemplateRows: `repeat(${gridSize}, 1fr)`
                }}
              >
                {puzzlePieces.map((piece) => {
                  const row = Math.floor(piece.correctPosition / gridSize)
                  const col = piece.correctPosition % gridSize
                  const isCorrect = completedPieces.includes(piece.id)
                  const isSelected = selectedPiece?.id === piece.id

                  return (
                    <div
                      key={piece.id}
                      className={`puzzle-piece ${isCorrect ? 'correct' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handlePieceClick(piece)}
                      style={{
                        backgroundImage: `url(${puzzleConfig.imageUrl})`,
                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                        backgroundPosition: `${col * 100 / (gridSize - 1)}% ${row * 100 / (gridSize - 1)}%`
                      }}
                    >
                      {!isCorrect && <div className="piece-number">{piece.id + 1}</div>}
                    </div>
                  )
                })}
              </div>

              {isFinished && (
                <div className="finish-message">
                  🎉 Puzzle terminé en {formatTime(timeElapsed)}!
                </div>
              )}
            </>
          ) : (
            <div className="waiting-start">
              <div className="waiting-icon">⏳</div>
              <h3>Configuration du puzzle...</h3>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
