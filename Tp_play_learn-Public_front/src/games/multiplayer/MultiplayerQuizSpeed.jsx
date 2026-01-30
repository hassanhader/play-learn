import React, { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { useAuth } from '../../contexts/AuthContext'
import './MultiplayerGame.css'

export default function MultiplayerQuizSpeed({ roomCode, roomDetails, gameState, participants, onLeave }) {
  const { user } = useAuth()
  const { socket } = useSocket() || {}
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [answerTime, setAnswerTime] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [scores, setScores] = useState({})
  const [answeredPlayers, setAnsweredPlayers] = useState([])

  const currentQuestion = gameState?.currentQuestion || null
  const currentQuestionIndex = gameState?.currentQuestionIndex || 0
  const totalQuestions = roomDetails?.game?.settings?.totalQuestions || 10
  const isHost = roomDetails?.host?.id === user?.id
  const canAnswer = currentQuestion && !hasAnswered

  // Timer
  useEffect(() => {
    if (!currentQuestion) return

    const questionTime = currentQuestion.timeLimit || 30
    setTimeLeft(questionTime)
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = questionTime - elapsed
      
      if (remaining <= 0) {
        clearInterval(interval)
        setTimeLeft(0)
      } else {
        setTimeLeft(remaining)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [currentQuestion])

  // Reset sur nouvelle question
  useEffect(() => {
    setSelectedAnswer(null)
    setHasAnswered(false)
    setAnswerTime(null)
    setAnsweredPlayers([])
  }, [currentQuestionIndex])

  // Écouter les updates
  useEffect(() => {
    if (!socket) return

    const handlePlayerAnswered = (data) => {
      console.log('👤 Player answered:', data)
      setAnsweredPlayers(prev => [...prev, data.userId])
    }

    const handleScoreUpdate = (data) => {
      console.log('📊 Scores updated:', data)
      setScores(data.scores || {})
    }

    socket.on('player-answered', handlePlayerAnswered)
    socket.on('scores-updated', handleScoreUpdate)

    return () => {
      socket.off('player-answered', handlePlayerAnswered)
      socket.off('scores-updated', handleScoreUpdate)
    }
  }, [socket])

  const handleAnswerSelect = (answer) => {
    if (!canAnswer) return
    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = () => {
    if (!canAnswer || !selectedAnswer || !socket) return
    
    const responseTime = 30 - timeLeft // Temps pris pour répondre
    setAnswerTime(responseTime)
    
    console.log('📤 Submitting answer:', selectedAnswer, 'Time:', responseTime)
    socket.emit('submit-answer', {
      roomCode,
      userId: user.id,
      answer: selectedAnswer,
      responseTime
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

  // Trier les participants par score
  const sortedParticipants = [...participants].sort((a, b) => 
    (scores[b.userId] || 0) - (scores[a.userId] || 0)
  )

  return (
    <div className="multiplayer-game-container quiz-speed">
      {/* Header */}
      <header className="game-header">
        <button className="leave-btn" onClick={onLeave}>← Quitter</button>
        <div className="game-info">
          <h2>⚡ Quiz Speed</h2>
          <div className="progress">
            Question {currentQuestionIndex + 1} / {totalQuestions}
          </div>
        </div>
        <div className="timer">{timeLeft}s</div>
      </header>

      <div className="game-layout">
        {/* Colonne gauche: Classement */}
        <aside className="participants-sidebar">
          <h3>🏆 Classement</h3>
          <div className="players-list">
            {sortedParticipants.map((p, index) => (
              <div 
                key={p.userId} 
                className={`player-card ${p.userId === user?.id ? 'current' : ''}`}
              >
                <div className={`player-rank rank-${index + 1}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="player-info">
                  <div className="player-name">
                    {p.username}
                    {p.userId === user?.id && ' (Vous)'}
                  </div>
                  <div className="player-score">{scores[p.userId] || 0} pts</div>
                </div>
                {answeredPlayers.includes(p.userId) && (
                  <div className="answered-indicator">✓</div>
                )}
              </div>
            ))}
          </div>

          <div className="answer-progress">
            <p>{answeredPlayers.length} / {participants.length} ont répondu</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${(answeredPlayers.length / participants.length) * 100}%`}}
              />
            </div>
          </div>
        </aside>

        {/* Zone centrale: Question et réponses */}
        <main className="game-main">
          {currentQuestion ? (
            <>
              <div className="question-section">
                <h2 className="question-text">{currentQuestion.question || currentQuestion.questionText}</h2>
              </div>

              <div className="answer-zone">
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

                {canAnswer ? (
                  <button
                    className="submit-btn"
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                  >
                    📤 Valider la réponse
                  </button>
                ) : hasAnswered ? (
                  <div className="answered-message">
                    ✓ Réponse envoyée en {answerTime?.toFixed(1)}s
                    <p>En attente des autres joueurs...</p>
                  </div>
                ) : null}
              </div>

              {/* Bouton suivant pour l'hôte */}
              {isHost && answeredPlayers.length === participants.length && (
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
