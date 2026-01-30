/**
 * Hook personnalisé pour gérer l'état et la logique d'un jeu
 */
import { useState, useEffect, useCallback } from 'react'

export const useGameEngine = (gameConfig) => {
  const [gameState, setGameState] = useState({
    isStarted: false,
    isPaused: false,
    isFinished: false,
    score: 0,
    timeRemaining: gameConfig?.timeLimit || 0,
    currentQuestion: 0,
    answers: [],
    startTime: null,
    endTime: null
  })

  // Timer
  useEffect(() => {
    if (!gameState.isStarted || gameState.isPaused || gameState.isFinished) {
      return
    }

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 0) {
          return {
            ...prev,
            isFinished: true,
            endTime: new Date()
          }
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isStarted, gameState.isPaused, gameState.isFinished])

  // Démarrer le jeu
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isStarted: true,
      isPaused: false,
      startTime: new Date(),
      timeRemaining: gameConfig?.timeLimit || 300
    }))
  }, [gameConfig])

  // Mettre en pause
  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: true
    }))
  }, [])

  // Reprendre
  const resumeGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: false
    }))
  }, [])

  // Terminer le jeu
  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isFinished: true,
      endTime: new Date()
    }))
  }, [])

  // Ajouter des points
  const addScore = useCallback((points) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points
    }))
  }, [])

  // Enregistrer une réponse
  const recordAnswer = useCallback((questionId, answer, isCorrect) => {
    setGameState(prev => ({
      ...prev,
      answers: [...prev.answers, { questionId, answer, isCorrect, timestamp: new Date() }],
      currentQuestion: prev.currentQuestion + 1
    }))
  }, [])

  // Réinitialiser le jeu
  const resetGame = useCallback(() => {
    setGameState({
      isStarted: false,
      isPaused: false,
      isFinished: false,
      score: 0,
      timeRemaining: gameConfig?.timeLimit || 0,
      currentQuestion: 0,
      answers: [],
      startTime: null,
      endTime: null
    })
  }, [gameConfig])

  return {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    addScore,
    recordAnswer,
    resetGame
  }
}
