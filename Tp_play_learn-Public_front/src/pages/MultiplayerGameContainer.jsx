import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import MultiplayerQuizBuzzer from '../games/multiplayer/MultiplayerQuizBuzzer'
import MultiplayerQuizSpeed from '../games/multiplayer/MultiplayerQuizSpeed'
import MultiplayerPuzzleRace from '../games/multiplayer/MultiplayerPuzzleRace'
import MultiplayerMathDuel from '../games/multiplayer/MultiplayerMathDuel'
import MultiplayerMemoryMatch from '../games/multiplayer/MultiplayerMemoryMatch'
import '../games/multiplayer/MultiplayerGame.css'

export default function MultiplayerGameContainer() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket, isConnected } = useSocket() || {}
  
  const [roomDetails, setRoomDetails] = useState(null)
  const [participants, setParticipants] = useState([])
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charger les détails de la room et du jeu
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const token = localStorage.getItem('token')
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        
        const response = await fetch(`${API_URL}/multiplayer/rooms/${roomCode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!response.ok) throw new Error('Room not found')

        const data = await response.json()
        console.log('🎮 Room data loaded:', data.room)
        
        setRoomDetails(data.room)
        setParticipants(data.room.participants || [])
        
        // Charger les détails complets du jeu
        if (data.room.gameId) {
          const gameResponse = await fetch(`${API_URL}/multiplayer/games/${data.room.gameId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          if (gameResponse.ok) {
            const gameData = await gameResponse.json()
            console.log('🎲 Game data loaded:', gameData)
            setRoomDetails(prev => ({
              ...prev,
              game: gameData.data || gameData.game
            }))
          }
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Error loading room data:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [roomCode])

  // Écouter les mises à jour du jeu via Socket
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleQuestionLoaded = (data) => {
      console.log('📥 Question loaded from server:', data)
      setGameState({
        currentQuestion: data.question,
        currentQuestionIndex: data.currentQuestionIndex,
        totalQuestions: data.totalQuestions,
        gameMode: data.gameMode
      })
    }

    const handleGameUpdate = (data) => {
      console.log('🔄 Game state update:', data)
      setGameState(data)
    }

    const handleParticipantsUpdate = (data) => {
      console.log('👥 Participants update:', data)
      setParticipants(data.participants || [])
    }

    socket.on('question-loaded', handleQuestionLoaded)
    socket.on('game-state-update', handleGameUpdate)
    socket.on('room-updated', handleParticipantsUpdate)

    return () => {
      socket.off('question-loaded', handleQuestionLoaded)
      socket.off('game-state-update', handleGameUpdate)
      socket.off('room-updated', handleParticipantsUpdate)
    }
  }, [socket, isConnected])

  const handleLeaveGame = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="multiplayer-game-wrap">
        <div className="loading">Chargement du jeu...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="multiplayer-game-wrap">
        <div className="error-message">
          <h2>❌ Erreur</h2>
          <p>{error}</p>
          <button onClick={handleLeaveGame}>Retour à l'accueil</button>
        </div>
      </div>
    )
  }

  // Déterminer quel composant de jeu utiliser selon le type
  const gameType = roomDetails?.game?.settings?.gameMode || 
                   roomDetails?.game?.type || 
                   roomDetails?.gameMode ||
                   roomDetails?.type
  
  console.log('🎯 Game type:', gameType)
  console.log('🔍 Room details:', roomDetails)
  console.log('🎲 Game data:', roomDetails?.game)

  const renderGame = () => {
    const commonProps = {
      roomCode,
      roomDetails,
      gameState,
      participants,
      onLeave: handleLeaveGame
    }

    switch (gameType) {
      case 'quiz-buzzer':
        return <MultiplayerQuizBuzzer {...commonProps} />
      
      case 'quiz-speed':
        return <MultiplayerQuizSpeed {...commonProps} />
      
      case 'puzzle-race':
        return <MultiplayerPuzzleRace {...commonProps} />
      
      case 'math-duel':
        return <MultiplayerMathDuel {...commonProps} />
      
      case 'memory-match':
        return <MultiplayerMemoryMatch {...commonProps} />
      
      // Fallback pour "quiz" générique -> utiliser quiz-buzzer par défaut
      case 'quiz':
        console.log('⚠️ Generic quiz type detected, using quiz-buzzer as fallback')
        return <MultiplayerQuizBuzzer {...commonProps} />
      
      default:
        return (
          <div className="game-error">
            <h2>❌ Type de jeu non supporté</h2>
            <p>Type détecté: {gameType || 'undefined'}</p>
            <p>Types supportés: quiz-buzzer, quiz-speed, puzzle-race, math-duel, memory-match</p>
            <button onClick={handleLeaveGame}>Retour</button>
          </div>
        )
    }
  }

  return (
    <div className="multiplayer-game-wrap">
      {renderGame()}
    </div>
  )
}
