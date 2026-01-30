import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GAME_TYPES } from '../gameConfig'
import gamesService from '../../services/gamesService'
import { useGameEngine } from '../useGameEngine'
import { useAuth } from '../../contexts/AuthContext'
import scoresService from '../../services/scoresService'
import { useGameMetadata, formatMetadataByGameType } from '../useGameMetadata'
import QuizGame from '../templates/QuizGame'
import MemoryGame from '../templates/MemoryGame'
import SpeedMath from '../templates/SpeedMath'
import PuzzleGame from '../templates/PuzzleGame'
import CodingGame from '../templates/CodingGame'
import './GameContainer.css'

/**
 * Container principal pour tous les jeux
 * Ce composant gère l'interface commune à tous les jeux
 */
export default function GameContainer({ gameId }) {
  const navigate = useNavigate()
  const { gameId: paramGameId } = useParams()
  const { user, isAuthenticated } = useAuth()
  const currentGameId = gameId || paramGameId
  
  const [gameConfig, setGameConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Charger le jeu depuis l'API
  useEffect(() => {
    const fetchGame = async () => {
      if (!currentGameId) {
        setError('No game ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Essayer de charger depuis l'API
        const response = await gamesService.getGameById(currentGameId)
        
        if (response.success && response.data) {
          // Mapper les données de l'API au format attendu par gameConfig
          const apiGame = response.data
          
          // Parser les questions et leurs options JSON
          let questions = []
          if (apiGame.levels?.[0]?.questions) {
            questions = apiGame.levels[0].questions.map(q => {
              // Parser les options (gère simple et double échappement pour rétrocompatibilité)
              let parsedOptions = q.options
              if (typeof q.options === 'string') {
                // Premier parsing
                parsedOptions = JSON.parse(q.options)
                // Si c'est encore une string, parser une deuxième fois (anciens jeux)
                if (typeof parsedOptions === 'string') {
                  parsedOptions = JSON.parse(parsedOptions)
                }
              }
              
              return {
                ...q,
                // Mapper questionText vers question pour compatibilité avec QuizGame
                question: q.questionText || q.question,
                options: parsedOptions,
                // Convertir correctAnswer en number si nécessaire
                correctAnswer: typeof q.correctAnswer === 'string' ? parseInt(q.correctAnswer, 10) : q.correctAnswer,
                // Ajouter des valeurs par défaut pour les champs manquants
                category: q.category || apiGame.category || 'General',
                points: q.points || 10
              }
            })
          }
          
          // Parser les settings pour extraire les configurations spécifiques
          let gameSettings = {}
          if (apiGame.settings) {
            try {
              gameSettings = typeof apiGame.settings === 'string' 
                ? JSON.parse(apiGame.settings) 
                : apiGame.settings
            } catch (e) {
              console.warn('Failed to parse game settings:', e)
              gameSettings = {}
            }
          }

          const mappedGame = {
            id: apiGame.gameId,
            title: apiGame.title,
            type: apiGame.type,
            category: apiGame.category,
            difficulty: apiGame.difficulty,
            description: apiGame.description,
            icon: apiGame.icon,
            timeLimit: apiGame.timeLimit || 180,
            totalQuestions: gameSettings.totalQuestions || questions.length || 10,
            questions: questions,
            // Ajouter les configurations spécifiques aux types de jeux
            memoryConfig: gameSettings.memoryConfig || null,
            mathConfig: gameSettings.mathConfig || null,
            puzzleConfig: gameSettings.puzzleConfig || null,
            codingConfig: gameSettings.codingConfig || null
          }
          setGameConfig(mappedGame)
        } else {
          throw new Error(response.message || 'Game not found')
        }
      } catch (err) {
        console.error('Error loading game:', err)
        setError('Failed to load game. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [currentGameId])
  
  const { gameState, startGame, pauseGame, resumeGame, resetGame, addScore, recordAnswer, endGame } = useGameEngine(gameConfig)
  const { metadata, updateMultipleMetadata } = useGameMetadata()
  
  const [isSavingScore, setIsSavingScore] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [scoreSaved, setScoreSaved] = useState(false) // Pour éviter la boucle
  
  // Sauvegarder automatiquement quand le jeu se termine
  useEffect(() => {
    const saveScore = async () => {
      // Ne sauvegarder qu'une seule fois
      if (scoreSaved || isSavingScore) return
      if (!gameConfig || !gameState.isFinished || gameState.score === 0) return
      if (!isAuthenticated || !user) {
        console.warn('⚠️ User not authenticated, score not saved')
        return
      }
      
      setIsSavingScore(true)
      setSaveError(null)
      
      const timeSpent = gameConfig.timeLimit - gameState.timeRemaining
      
      // Formater les métadonnées selon le type de jeu
      const formattedMetadata = formatMetadataByGameType(
        gameConfig.type,
        { ...gameState, timeSpent },
        metadata
      )
      
      // Préparer les données du score
      const scoreData = {
        gameId: gameConfig.id,
        gameTitle: gameConfig.title,
        score: gameState.score,
        maxScore: gameConfig.totalQuestions ? gameConfig.totalQuestions * 10 : null,
        difficulty: gameConfig.difficulty || 'medium',
        mode: 'single',
        category: gameConfig.category,
        duration: timeSpent,
        metadata: formattedMetadata
      }
      
      console.log('📤 Sending score data:', scoreData)
      
      try {
        const result = await scoresService.saveScore(scoreData)
        
        if (result.success) {
          console.log('✅ Score saved successfully:', result.data)
          setScoreSaved(true) // Marquer comme sauvegardé
        } else {
          console.error('❌ Failed to save score:', result.message)
          setSaveError(result.message)
        }
      } catch (error) {
        console.error('❌ Error saving score:', error)
        setSaveError('An error occurred while saving the score')
      } finally {
        setIsSavingScore(false)
      }
    }
    
    saveScore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.isFinished, gameState.score])
  
  // Déterminer quel composant de jeu charger
  let GameComponent = null
  if (gameConfig) {
    switch(gameConfig.type) {
      case GAME_TYPES.QUIZ:
        GameComponent = QuizGame
        break
      case GAME_TYPES.MEMORY:
        GameComponent = MemoryGame
        break
      case GAME_TYPES.MATH:
        GameComponent = SpeedMath
        break
      case GAME_TYPES.PUZZLE:
        GameComponent = PuzzleGame
        break
      case GAME_TYPES.CODING:
        GameComponent = CodingGame
        break
      default:
        GameComponent = QuizGame // Par défaut
    }
  }

  if (!gameConfig) {
    if (loading) {
      return (
        <div className="game-container-wrap">
          <div className="game-error">
            <h1>⏳ Chargement...</h1>
            <p>Préparation du jeu en cours...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="game-container-wrap">
          <div className="game-error">
            <h1>❌ Erreur</h1>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-back" style={{marginRight: '10px'}}>
              🔄 Réessayer
            </button>
            <button onClick={() => navigate('/single')} className="btn-back">
              Retour aux jeux
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="game-container-wrap">
        <div className="game-error">
          <h1>❌ Jeu introuvable</h1>
          <p>Le jeu demandé n'existe pas ou n'est plus disponible.</p>
          <p style={{fontSize: '14px', marginTop: '10px', color: '#9aa0b4'}}>
            ID recherché: {currentGameId}
          </p>
          <button onClick={() => navigate('/single')} className="btn-back">
            Retour aux jeux
          </button>
        </div>
      </div>
    )
  }

  if (!GameComponent) {
    return (
      <div className="game-container-wrap">
        <div className="game-error">
          <h1>⚠️ Jeu non disponible</h1>
          <p>Ce type de jeu n'est pas encore implémenté.</p>
          <p style={{fontSize: '14px', marginTop: '10px', color: '#9aa0b4'}}>
            Type: {gameConfig.type}
          </p>
          <button onClick={() => navigate('/single')} className="btn-back">
            Retour aux jeux
          </button>
        </div>
      </div>
    )
  }

  // Formater le temps restant
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="game-container-wrap">
      {/* Header du jeu */}
      <header className="game-header">
        <div className="game-header-left">
          <button onClick={() => navigate('/single')} className="game-back-btn">
            ← Retour
          </button>
          <div className="game-info">
            <span className="game-icon">{gameConfig.icon}</span>
            <div>
              <h1 className="game-title">{gameConfig.title}</h1>
              <p className="game-category">{gameConfig.category} • {gameConfig.difficulty}</p>
            </div>
          </div>
        </div>
        
        <div className="game-header-right">
          <div className="game-stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{gameState.score}</span>
          </div>
          <div className="game-stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{formatTime(gameState.timeRemaining)}</span>
          </div>
          {gameState.isStarted && !gameState.isFinished && (
            <button 
              onClick={gameState.isPaused ? resumeGame : pauseGame}
              className="game-pause-btn"
            >
              {gameState.isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
          )}
        </div>
      </header>

      {/* Zone de jeu principale */}
      <main className="game-main">
        {!gameState.isStarted ? (
          // Écran de démarrage
          <div className="game-start-screen">
            <div className="game-start-card">
              <span className="game-start-icon">{gameConfig.icon}</span>
              <h2>{gameConfig.title}</h2>
              <p className="game-description">{gameConfig.description}</p>
              
              <div className="game-details">
                <div className="detail-item">
                  <span className="detail-icon">🎯</span>
                  <span>Difficulty: {gameConfig.difficulty}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">⏱️</span>
                  <span>Time: {
                    gameConfig.timeLimit >= 60 
                      ? `${Math.floor(gameConfig.timeLimit / 60)} minute${Math.floor(gameConfig.timeLimit / 60) > 1 ? 's' : ''}` 
                      : `${gameConfig.timeLimit} second${gameConfig.timeLimit > 1 ? 's' : ''}`
                  }</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">❓</span>
                  <span>Questions: {gameConfig.totalQuestions}</span>
                </div>
              </div>
              
              <button onClick={startGame} className="game-start-btn">
                🚀 Start Game
              </button>
            </div>
          </div>
        ) : gameState.isPaused ? (
          // Écran de pause
          <div className="game-pause-screen">
            <div className="game-pause-card">
              <h2>⏸️ Game Paused</h2>
              <p>Current Score: <strong>{gameState.score}</strong></p>
              <p>Time Remaining: <strong>{formatTime(gameState.timeRemaining)}</strong></p>
              <div className="pause-actions">
                <button onClick={resumeGame} className="btn-resume">
                  ▶️ Resume
                </button>
                <button onClick={() => navigate('/single')} className="btn-quit">
                  🚪 Quit
                </button>
              </div>
            </div>
          </div>
        ) : gameState.isFinished ? (
          // Écran de fin
          <div className="game-end-screen">
            <div className="game-end-card">
              <h2>🎉 Game Complete!</h2>
              <div className="final-score">
                <span className="score-label">Final Score</span>
                <span className="score-value">{gameState.score}</span>
              </div>
              
              {/* Indicateur de sauvegarde */}
              {isSavingScore && (
                <div className="save-status saving">
                  <span className="save-icon">💾</span>
                  <span>Saving score...</span>
                </div>
              )}
              {!isSavingScore && !saveError && gameState.score > 0 && (
                <div className="save-status success">
                  <span className="save-icon">✅</span>
                  <span>Score saved successfully!</span>
                </div>
              )}
              {saveError && (
                <div className="save-status error">
                  <span className="save-icon">⚠️</span>
                  <span>{saveError}</span>
                </div>
              )}
              
              <div className="game-stats">
                <div className="stat-item">
                  <span className="stat-icon">⏱️</span>
                  <span>Time: {Math.floor((gameConfig.timeLimit - gameState.timeRemaining) / 60)}m {(gameConfig.timeLimit - gameState.timeRemaining) % 60}s</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">✅</span>
                  <span>Correct Answers: {gameState.answers.filter(a => a.isCorrect).length}/{gameState.answers.length}</span>
                </div>
              </div>
              
              <div className="end-actions">
                <button onClick={() => {
                  setScoreSaved(false) // Réinitialiser pour permettre une nouvelle sauvegarde
                  setSaveError(null)
                  resetGame()
                }} className="btn-replay">
                  🔄 Play Again
                </button>
                <button onClick={() => navigate('/history')} className="btn-history">
                  📊 View History
                </button>
                <button onClick={() => navigate('/single')} className="btn-menu">
                  🏠 Main Menu
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Zone de jeu active
          <div className="game-play-area">
            <GameComponent
              gameConfig={gameConfig}
              gameState={gameState}
              onAnswer={recordAnswer}
              addScore={addScore}
              endGame={endGame}
              updateMetadata={updateMultipleMetadata}
            />
          </div>
        )}
      </main>
    </div>
  )
}
