import React, { useState, useEffect } from 'react'
import { useSocket } from '../../contexts/SocketContext'
import { useAuth } from '../../contexts/AuthContext'
import './MultiplayerSpeedMath.css'

export default function MultiplayerSpeedMath({ roomCode, roomDetails, gameState, participants, onLeave }) {
  const { user } = useAuth()
  const { submitAnswer } = useSocket()
  const [answer, setAnswer] = useState('')
  const [hasAnswered, setHasAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)

  const question = gameState?.question
  const scores = gameState?.scores || {}
  const responses = gameState?.responses || {}

  // Timer countdown
  useEffect(() => {
    if (!question) return

    setTimeLeft(question.timeLimit || 30)
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          // Auto-submit empty answer if time runs out
          if (!hasAnswered) {
            handleSubmitAnswer()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [question])

  // Reset state on new question
  useEffect(() => {
    setAnswer('')
    setHasAnswered(false)
  }, [gameState?.currentQuestionIndex])

  const handleSubmitAnswer = () => {
    if (!hasAnswered) {
      submitAnswer(roomCode, answer)
      setHasAnswered(true)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && answer && !hasAnswered) {
      handleSubmitAnswer()
    }
  }

  const getAnswerStatus = (userId) => {
    if (responses[userId]) {
      return responses[userId].isCorrect ? '✓' : '✗'
    }
    return '⏳'
  }

  return (
    <div className="multiplayer-speedmath-container">
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

      <div className="game-content">
        {/* Live Scoreboard */}
        <div className="live-scoreboard">
          <h3>🏆 Live Scores</h3>
          <div className="scores-table">
            {participants
              .sort((a, b) => (scores[b.userId] || 0) - (scores[a.userId] || 0))
              .map((participant, index) => (
                <div 
                  key={participant.userId}
                  className={`score-row ${participant.userId === user?.id ? 'current-user' : ''}`}
                >
                  <span className="rank">#{index + 1}</span>
                  <span className="player-name">
                    {participant.username}
                    {!participant.isConnected && <span className="disconnected-badge">🔌</span>}
                  </span>
                  <span className="status">{getAnswerStatus(participant.userId)}</span>
                  <span className="score">{scores[participant.userId] || 0}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Question Panel */}
        <div className="question-panel">
          {question ? (
            <>
              <div className="math-question">
                <h2 className="question-text">{question.questionText}</h2>
              </div>

              {/* Answer Input */}
              {!hasAnswered ? (
                <div className="answer-input-section">
                  <input
                    type="text"
                    className="answer-input"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your answer..."
                    autoFocus
                    disabled={hasAnswered}
                  />
                  <button
                    className="submit-btn"
                    onClick={handleSubmitAnswer}
                    disabled={!answer || hasAnswered}
                  >
                    Submit
                  </button>
                </div>
              ) : (
                <div className="waiting-message">
                  <div className="spinner-small"></div>
                  <p>Waiting for other players...</p>
                </div>
              )}

              {/* Show result after answering */}
              {hasAnswered && gameState?.lastResult && (
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

              {/* All answers revealed */}
              {gameState?.questionComplete && (
                <div className="results-reveal">
                  <h3>Question Results</h3>
                  <div className="correct-answer">
                    Correct Answer: <strong>{gameState.correctAnswer}</strong>
                  </div>
                  <div className="players-answers">
                    {participants.map((participant) => {
                      const response = responses[participant.userId]
                      if (!response) return null
                      return (
                        <div 
                          key={participant.userId}
                          className={`player-answer ${response.isCorrect ? 'correct' : 'incorrect'}`}
                        >
                          <span className="player-name">{participant.username}</span>
                          <span className="answer-given">{response.answer}</span>
                          <span className="result-icon">
                            {response.isCorrect ? '✓' : '✗'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
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
      </div>
    </div>
  )
}
