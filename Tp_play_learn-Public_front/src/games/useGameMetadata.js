/**
 * Hook pour gérer les métadonnées des jeux
 * Chaque type de jeu peut avoir des métadonnées spécifiques
 */

import { useState, useCallback } from 'react'

export const useGameMetadata = () => {
  const [metadata, setMetadata] = useState({})

  /**
   * Mise à jour des métadonnées
   */
  const updateMetadata = useCallback((key, value) => {
    setMetadata(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  /**
   * Mise à jour de plusieurs métadonnées à la fois
   */
  const updateMultipleMetadata = useCallback((newMetadata) => {
    setMetadata(prev => ({
      ...prev,
      ...newMetadata
    }))
  }, [])

  /**
   * Réinitialiser les métadonnées
   */
  const resetMetadata = useCallback(() => {
    setMetadata({})
  }, [])

  /**
   * Obtenir toutes les métadonnées
   */
  const getMetadata = useCallback(() => {
    return { ...metadata }
  }, [metadata])

  return {
    metadata,
    updateMetadata,
    updateMultipleMetadata,
    resetMetadata,
    getMetadata
  }
}

/**
 * Formater les métadonnées pour QuizGame
 */
export const formatQuizMetadata = (gameState) => {
  const correctAnswers = gameState.answers?.filter(a => a.isCorrect).length || 0
  const totalQuestions = gameState.answers?.length || 0
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  return {
    correctAnswers,
    totalQuestions,
    incorrectAnswers: totalQuestions - correctAnswers,
    accuracy,
    averageTimePerQuestion: totalQuestions > 0 
      ? Math.round((gameState.timeSpent || 0) / totalQuestions) 
      : 0
  }
}

/**
 * Formater les métadonnées pour SpeedMath
 */
export const formatSpeedMathMetadata = (customMetadata = {}) => {
  return {
    correctAnswers: customMetadata.correctAnswers || 0,
    totalQuestions: customMetadata.totalQuestions || 0,
    accuracy: customMetadata.accuracy || 0,
    streak: customMetadata.streak || 0,
    bestStreak: customMetadata.bestStreak || 0,
    averageTimePerQuestion: customMetadata.averageTimePerQuestion || 0
  }
}

/**
 * Formater les métadonnées pour MemoryGame
 */
export const formatMemoryMetadata = (customMetadata = {}) => {
  return {
    moves: customMetadata.moves || 0,
    pairsFound: customMetadata.pairsFound || 0,
    totalPairs: customMetadata.totalPairs || 0,
    efficiency: customMetadata.efficiency || 0,
    perfectMoves: customMetadata.perfectMoves || 0 // Nombre minimum de coups nécessaires
  }
}

/**
 * Formater les métadonnées pour PuzzleGame
 */
export const formatPuzzleMetadata = (customMetadata = {}) => {
  return {
    moves: customMetadata.moves || 0,
    gridSize: customMetadata.gridSize || 3,
    completed: customMetadata.completed ? true : false,
    efficiency: customMetadata.efficiency || 0,
    // Ajouter des champs compatibles avec les autres types de jeux
    correctAnswers: customMetadata.completed ? 1 : 0,
    totalQuestions: 1,
    accuracy: customMetadata.completed ? 100 : 0
  }
}

/**
 * Formater les métadonnées pour CodingGame
 */
export const formatCodingMetadata = (customMetadata = {}) => {
  return {
    correctAnswers: customMetadata.correctAnswers || 0,
    totalQuestions: customMetadata.totalQuestions || 0,
    attempts: customMetadata.attempts || 0,
    accuracy: customMetadata.accuracy || 0,
    language: customMetadata.language || 'JavaScript'
  }
}

/**
 * Formater les métadonnées selon le type de jeu
 */
export const formatMetadataByGameType = (gameType, gameState, customMetadata = {}) => {
  const baseMetadata = {
    gameType,
    timeSpent: gameState.timeSpent || 0,
    finalScore: gameState.score || 0
  }

  switch (gameType) {
    case 'quiz':
      return {
        ...baseMetadata,
        ...formatQuizMetadata(gameState)
      }
    
    case 'math':
      return {
        ...baseMetadata,
        ...formatSpeedMathMetadata(customMetadata)
      }
    
    case 'memory':
      return {
        ...baseMetadata,
        ...formatMemoryMetadata(customMetadata)
      }
    
    case 'puzzle':
      return {
        ...baseMetadata,
        ...formatPuzzleMetadata(customMetadata)
      }
    
    case 'coding':
      return {
        ...baseMetadata,
        ...formatCodingMetadata(customMetadata)
      }
    
    default:
      return {
        ...baseMetadata,
        ...customMetadata
      }
  }
}
