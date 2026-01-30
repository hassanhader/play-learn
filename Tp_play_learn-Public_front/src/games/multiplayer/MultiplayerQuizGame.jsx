import React, { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { useAuth } from '../../contexts/AuthContext'
import './MultiplayerQuizGame.css'

export default function MultiplayerQuizGame({ roomCode, roomDetails, gameState, participants, onLeave }) {
  const { user } = useAuth()
  const { buzz, submitAnswer, nextQuestion } = useSocket()
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)

  const question = gameState?.question
  const buzzedBy = gameState?.buzzedBy
  const canBuzz = !buzzedBy && !hasAnswered
  const canAnswer = buzzedBy?.userId === user?.id && !hasAnswered
  const isHost = roomDetails?.host?.id === user?.id
  const scores = gameState?.scores || {}
  
  // Parse options safely
  let options = []
  try {
    if (question?.options) {
      options = typeof question.options === 'string' 
        ? JSON.parse(question.options) 
        : Array.isArray(question.options) 
          ? question.options 
          : []
    }
  } catch (e) {
    console.error('Failed to parse options:', e)
    options = []
  }

  // Timer countdown
  useEffect(() => {
    if (!question) return

    setTimeLeft(question.timeLimit || 30)
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
  }, [question])

  // Reset state on new question
  useEffect(() => {
    setSelectedAnswer(null)
    setHasAnswered(false)
  }, [gameState?.currentQuestionIndex])

  const handleBuzz = () => {
    if (canBuzz) {
      buzz(roomCode)
    }
  }

  const handleAnswerSelect = (answer) => {
    if (canAnswer) {
      setSelectedAnswer(answer)
    }
  }

  const handleSubmitAnswer = () => {
    if (canAnswer && selectedAnswer) {
      submitAnswer(roomCode, selectedAnswer)
      setHasAnswered(true)
    }
  }

  const handleNextQuestion = () => {
    if (isHost) {
      nextQuestion(roomCode)
    }
  }

  return (
    <div className="multiplayer-quiz-container">
      {/* Header */}
      <header className="game-header">
        <div className="header-left">
          <button className="leave-btn" onClick={onLeave}>
            ← Leave
          </button>
          <h2>{roomDetails?.name}</h2>
        </div>
        <div className="header-center">
          <div className="progress">
            Question {gameState?.currentQuestionIndex + 1} / {gameState?.totalQuestions}
          </div>
        </div>
        <div className="header-right">
          <div className="timer">{timeLeft}s</div>
        </div>
      </header>

      {/* Scoreboard */}
      <div className="scoreboard">
        <h3>🏆 Scores</h3>
        <div className="scores-grid">
          {participants.map((participant) => (
            <div 
              key={participant.userId}
              className={`score-item ${participant.userId === user?.id ? 'current-user' : ''}`}
            >
              <span className="player-name">{participant.username}</span>
              <span className="player-score">{scores[participant.userId] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Question Area */}
      <div className="question-area">
        {question ? (
          <>
            <div className="question-card">
              <h2 className="question-text">{question.questionText}</h2>
            </div>

            {/* Buzzer Section */}
            {!buzzedBy ? (
              <div className="buzzer-section">
                <button 
                  className={`buzzer-btn ${!canBuzz ? 'disabled' : ''}`}
                  onClick={handleBuzz}
                  disabled={!canBuzz}
                >
                  🔔 BUZZ!
                </button>
                <p className="buzzer-hint">
                  {hasAnswered 
                    ? 'Waiting for other players...' 
                    : 'Click to buzz and answer first!'}
                </p>
              </div>
            ) : (
              <div className="buzzed-indicator">
                <div className="buzzed-player">
                  🔔 {buzzedBy.username} buzzed first!
                </div>
                {canAnswer && (
                  <p className="answer-prompt">Select your answer below:</p>
                )}
              </div>
            )}

            {/* Answer Options (only shown to buzzed player) */}
            {canAnswer && options.length > 0 && (
              <div className="options-grid">
                {options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={hasAnswered}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Submit Button */}
            {canAnswer && (
              <button
                className="submit-answer-btn"
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || hasAnswered}
              >
                {hasAnswered ? 'Submitted!' : 'Submit Answer'}
              </button>
            )}

            {/* Answer Result */}
            {gameState?.lastResult && buzzedBy?.userId === user?.id && (
              <div className={`answer-result ${gameState.lastResult.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-icon">
                  {gameState.lastResult.isCorrect ? '✓' : '✗'}
                </div>
                <div className="result-text">
                  {gameState.lastResult.isCorrect 
                    ? `Correct! +${gameState.lastResult.score} points` 
                    : `Incorrect. The answer was: ${gameState.lastResult.correctAnswer}`}
                </div>
              </div>
            )}

            {/* Host Controls */}
            {isHost && buzzedBy && (
              <div className="host-controls">
                <button 
                  className="next-question-btn"
                  onClick={handleNextQuestion}
                >
                  Next Question →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="loading-question">
            <div className="spinner"></div>
            <p>Loading next question...</p>
          </div>
        )}
      </div>

      {/* Players Status */}
      <div className="players-status">
        <h4>Players</h4>
        <div className="players-list">
          {participants.map((participant) => (
            <div 
              key={participant.userId}
              className={`player-status ${!participant.isConnected ? 'disconnected' : ''}`}
            >
              <span className="status-dot"></span>
              <span>{participant.username}</span>
              {participant.userId === roomDetails?.host?.id && <span className="host-badge">👑</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
