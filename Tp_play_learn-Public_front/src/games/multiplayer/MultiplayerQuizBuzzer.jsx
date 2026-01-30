import React, { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { useAuth } from '../../contexts/AuthContext'
import './MultiplayerGame.css'

export default function MultiplayerQuizBuzzer({ roomCode, roomDetails, gameState, participants, onLeave }) {
  const { user } = useAuth()
  const { socket } = useSocket() || {}
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [hasBuzzed, setHasBuzzed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [scores, setScores] = useState({})

  const currentQuestion = gameState?.currentQuestion || null
  const currentQuestionIndex = gameState?.currentQuestionIndex || 0
  const totalQuestions = roomDetails?.game?.settings?.totalQuestions || 10
  const buzzedPlayer = gameState?.buzzedPlayer || null
  const isHost = roomDetails?.host?.id === user?.id
  const canBuzz = !buzzedPlayer && !hasBuzzed
  const isBuzzedPlayer = buzzedPlayer?.userId === user?.id
  const canAnswer = isBuzzedPlayer && !hasAnswered

  // Timer
  useEffect(() => {
    if (!currentQuestion) return

    const questionTime = currentQuestion.timeLimit || 30
    setTimeLeft(questionTime)

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentQuestion])

  // Reset sur nouvelle question
  useEffect(() => {
    setSelectedAnswer(null)
    setHasAnswered(false)
    setHasBuzzed(false)
  }, [currentQuestionIndex])

  // Écouter les updates
  useEffect(() => {
    if (!socket) return

    const handleQuestionLoaded = (data) => {
      console.log('📥 Question loaded:', data)
      // gameState sera mis à jour automatiquement par le parent (MultiplayerGameContainer)
    }

    const handleBuzz = (data) => {
      console.log('🔔 Player buzzed:', data)
      if (data.userId === user?.id) {
        setHasBuzzed(true)
      }
    }

    const handleScoreUpdate = (data) => {
      console.log('📊 Scores updated:', data)
      setScores(data.scores || {})
    }

    const handleAnswerResult = (data) => {
      console.log('📝 Answer result:', data)
    }

    const handleGameEnded = (data) => {
      console.log('🏁 Game ended:', data)
      alert(`Jeu terminé! Scores finaux: ${JSON.stringify(data.finalScores)}`)
    }

    socket.on('question-loaded', handleQuestionLoaded)
    socket.on('player-buzzed', handleBuzz)
    socket.on('scores-updated', handleScoreUpdate)
    socket.on('answer-result', handleAnswerResult)
    socket.on('game-ended', handleGameEnded)

    return () => {
      socket.off('question-loaded', handleQuestionLoaded)
      socket.off('player-buzzed', handleBuzz)
      socket.off('scores-updated', handleScoreUpdate)
      socket.off('answer-result', handleAnswerResult)
      socket.off('game-ended', handleGameEnded)
    }
  }, [socket, user])

  const handleBuzz = () => {
    if (!canBuzz || !socket) return
    
    console.log('🔔 Buzzing...')
    socket.emit('buzz', { roomCode, userId: user.id, username: user.username })
    setHasBuzzed(true)
  }

  const handleAnswerSelect = (answer) => {
    if (canAnswer) {
      setSelectedAnswer(answer)
    }
  }

  const handleSubmitAnswer = () => {
    if (!canAnswer || !selectedAnswer || !socket) return
    
    console.log('📤 Submitting answer:', selectedAnswer)
    socket.emit('submit-answer', {
      roomCode,
      userId: user.id,
      answer: selectedAnswer
    })
    setHasAnswered(true)
  }

  const handleNextQuestion = () => {
    if (!isHost || !socket) return
    
    console.log('⏭️ Next question')
    socket.emit('next-question', { roomCode })
  }

  // Préparer les options
  let options = []
  if (currentQuestion) {
    const correct = currentQuestion.correctAnswer
    const wrong = currentQuestion.wrongAnswers || []
    options = [correct, ...wrong].sort(() => Math.random() - 0.5)
  }

  return (
    <div className="multiplayer-game-container quiz-buzzer">
      {/* Header avec scores */}
      <header className="game-header">
        <button className="leave-btn" onClick={onLeave}>← Quitter</button>
        <div className="game-info">
          <h2>🔔 Quiz Buzzer</h2>
          <div className="progress">
            Question {currentQuestionIndex + 1} / {totalQuestions}
          </div>
        </div>
        <div className="timer">{timeLeft}s</div>
      </header>

      <div className="game-layout">
        {/* Colonne gauche: Participants et scores */}
        <aside className="participants-sidebar">
          <h3>👥 Joueurs</h3>
          <div className="players-list">
            {participants.map((p, index) => (
              <div 
                key={p.userId} 
                className={`player-card ${p.userId === user?.id ? 'current' : ''} ${p.userId === buzzedPlayer?.userId ? 'buzzed' : ''}`}
              >
                <div className="player-rank">#{index + 1}</div>
                <div className="player-info">
                  <div className="player-name">
                    {p.username}
                    {p.userId === roomDetails?.host?.id && ' 👑'}
                    {p.userId === user?.id && ' (Vous)'}
                  </div>
                  <div className="player-score">{scores[p.userId] || 0} pts</div>
                </div>
                {p.userId === buzzedPlayer?.userId && (
                  <div className="buzz-indicator">🔔</div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Zone centrale: Question et réponses */}
        <main className="game-main">
          {currentQuestion ? (
            <>
              <div className="question-section">
                <h2 className="question-text">{currentQuestion.question || currentQuestion.questionText}</h2>
              </div>

              {/* Buzzer ou réponses */}
              {!buzzedPlayer ? (
                <div className="buzzer-zone">
                  <button
                    className={`buzzer-btn ${!canBuzz ? 'disabled' : ''}`}
                    onClick={handleBuzz}
                    disabled={!canBuzz}
                  >
                    <span className="buzzer-icon">🔔</span>
                    <span className="buzzer-text">BUZZ!</span>
                  </button>
                  <p className="buzzer-hint">
                    {hasBuzzed ? 'En attente...' : 'Cliquez pour répondre en premier!'}
                  </p>
                </div>
              ) : (
                <div className="answer-zone">
                  <div className="buzzed-announcement">
                    🔔 <strong>{buzzedPlayer.username}</strong> a buzzé!
                  </div>

                  {canAnswer ? (
                    <>
                      <div className="answers-grid">
                        {options.map((option, idx) => (
                          <button
                            key={idx}
                            className={`answer-btn ${selectedAnswer === option ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={hasAnswered}
                          >
                            <span className="answer-letter">{String.fromCharCode(65 + idx)}</span>
                            <span className="answer-text">{option}</span>
                          </button>
                        ))}
                      </div>

                      <button
                        className="submit-btn"
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer || hasAnswered}
                      >
                        {hasAnswered ? '✓ Réponse envoyée' : '📤 Valider la réponse'}
                      </button>
                    </>
                  ) : (
                    <div className="waiting-message">
                      ⏳ En attente de la réponse de {buzzedPlayer.username}...
                    </div>
                  )}
                </div>
              )}

              {/* Bouton suivant pour l'hôte */}
              {isHost && hasAnswered && (
                <div className="host-controls">
                  <button className="next-btn" onClick={handleNextQuestion}>
                    ⏭️ Question suivante
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="waiting-start">
              <div className="waiting-icon">⏳</div>
              <h3>En attente du début de la partie...</h3>
              {isHost && (
                <button className="start-btn" onClick={handleNextQuestion}>
                  🚀 Commencer le jeu
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
