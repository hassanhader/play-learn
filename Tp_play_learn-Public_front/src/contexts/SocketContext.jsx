import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [participants, setParticipants] = useState([])
  const [gameState, setGameState] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    // Créer la connexion Socket.io
    // Socket.io se connecte à la racine du serveur, pas à /api
    const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    const newSocket = io(API_BASE_URL, {
      autoConnect: false,
      withCredentials: true
    })

    // Événements de connexion
    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.io server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.io server')
      setIsConnected(false)
    })

    newSocket.on('error', (error) => {
      console.error('Socket.io error:', error)
    })

    // Événements de la salle
    newSocket.on('playerJoined', ({ userId, username, currentPlayers, participants: updatedParticipants }) => {
      console.log(`✅ Player ${username} joined the room (${currentPlayers} players)`)
      console.log('📋 Updated participants:', JSON.stringify(updatedParticipants, null, 2))
      console.log('📊 Participants count:', updatedParticipants?.length || 0)
      if (updatedParticipants && Array.isArray(updatedParticipants)) {
        setParticipants(updatedParticipants)
      }
    })

    newSocket.on('playerDisconnected', ({ userId, username }) => {
      console.log(`❌ Player ${username} disconnected`)
      setParticipants(prev => 
        (prev || []).map(p => p.userId === userId ? { ...p, isConnected: false } : p)
      )
    })

    newSocket.on('playerReady', ({ userId, isReady, participants: updatedParticipants, readyCount, totalPlayers, allPlayersReady }) => {
      console.log(`${isReady ? '✓' : '⏳'} Player ${userId} is ${isReady ? 'ready' : 'not ready'} (${readyCount}/${totalPlayers})`)
      console.log('📋 Updated participants from playerReady:', JSON.stringify(updatedParticipants, null, 2))
      console.log('📊 Participants count:', updatedParticipants?.length || 0)
      
      // Update with complete participants list from server
      if (updatedParticipants && Array.isArray(updatedParticipants)) {
        setParticipants(updatedParticipants)
      }

      if (allPlayersReady) {
        console.log('🎉 All players are ready!')
      }
    })

    newSocket.on('allPlayersReady', ({ participants: updatedParticipants }) => {
      console.log('🚀 All players are ready! Starting game...')
      if (updatedParticipants && Array.isArray(updatedParticipants)) {
        setParticipants(updatedParticipants)
      }
    })

    // Événements de jeu
    newSocket.on('gameStarted', (data) => {
      console.log('Game started!', data)
      setGameState({
        status: 'playing',
        gameMode: data.gameMode,
        difficulty: data.difficulty,
        currentQuestionIndex: data.currentQuestionIndex,
        totalQuestions: data.totalQuestions,
        question: data.question
      })
    })

    newSocket.on('nextQuestion', (data) => {
      console.log('Next question:', data)
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: data.currentQuestionIndex,
        question: data.question,
        buzzedBy: null
      }))
    })

    newSocket.on('playerBuzzed', ({ userId, username }) => {
      console.log(`${username} buzzed!`)
      setGameState(prev => ({
        ...prev,
        buzzedBy: { userId, username }
      }))
    })

    newSocket.on('answerResult', ({ isCorrect, correctAnswer, score }) => {
      console.log('Answer result:', { isCorrect, correctAnswer, score })
      setGameState(prev => ({
        ...prev,
        lastResult: { isCorrect, correctAnswer, score }
      }))
    })

    newSocket.on('questionComplete', ({ responses, scores, correctAnswer }) => {
      console.log('Question complete:', { responses, scores, correctAnswer })
      setGameState(prev => ({
        ...prev,
        responses,
        scores,
        correctAnswer
      }))
    })

    newSocket.on('playerCompleted', ({ userId, username, completionTime }) => {
      console.log(`${username} completed the game in ${completionTime}s`)
    })

    newSocket.on('gameEnded', ({ rankings, winner }) => {
      console.log('Game ended!', { rankings, winner })
      setGameState(prev => ({
        ...prev,
        status: 'finished',
        rankings,
        winner
      }))
    })

    // Nouveaux événements pour le lancement synchronisé du jeu
    newSocket.on('game-started', (data) => {
      console.log('🚀 Game started broadcast received from server:', data)
      setGameState(prev => ({
        ...prev,
        status: 'in-progress',
        startedBy: data.startedBy || data.hostId,
        startedAt: data.timestamp
      }))
    })

    newSocket.on('start-game-broadcast', (data) => {
      console.log('📢 Start game broadcast received:', data)
      setGameState(prev => ({
        ...prev,
        status: 'in-progress',
        startedBy: data.hostId,
        startedAt: data.timestamp
      }))
    })

    newSocket.on('room-updated', (data) => {
      console.log('📡 Room update received:', data)
      if (data.room?.status === 'in-progress' || data.status === 'in-progress') {
        console.log('🎮 Room status changed to in-progress')
        setGameState(prev => ({
          ...prev,
          status: 'in-progress'
        }))
      }
      if (data.room?.participants || data.participants) {
        setParticipants(data.room?.participants || data.participants)
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      newSocket.removeAllListeners()
    }
  }, [])

  // Connecter le socket quand l'utilisateur est authentifié
  useEffect(() => {
    if (socket && user && !isConnected) {
      socket.connect()
    }
  }, [socket, user, isConnected])

  const joinRoom = (roomCode) => {
    if (!socket || !user) return
    socket.emit('joinRoom', {
      roomCode,
      userId: user.id,
      username: user.username
    })
    setCurrentRoom(roomCode)
  }

  const setReady = (roomCode, isReady) => {
    if (!socket || !user) return
    socket.emit('setReady', {
      roomCode,
      userId: user.id,
      isReady
    })
  }

  const startGame = (roomCode) => {
    if (!socket || !user) return
    console.log(`🚀 Sending startGame event for room ${roomCode} by user ${user.id}`)
    socket.emit('startGame', { roomCode, userId: user.id })
  }

  const broadcastGameStart = (roomCode) => {
    if (!socket || !user) return
    console.log(`📢 Broadcasting start-game event for room ${roomCode} by host ${user.id}`)
    socket.emit('start-game', { 
      roomCode, 
      hostId: user.id,
      timestamp: Date.now()
    })
  }

  const buzz = (roomCode) => {
    if (!socket || !user) return
    socket.emit('buzz', {
      roomCode,
      userId: user.id
    })
  }

  const submitAnswer = (roomCode, answer) => {
    if (!socket || !user) return
    socket.emit('submitAnswer', {
      roomCode,
      userId: user.id,
      answer
    })
  }

  const nextQuestion = (roomCode) => {
    if (!socket) return
    socket.emit('nextQuestion', { roomCode })
  }

  const completeGame = (roomCode, completionTime) => {
    if (!socket || !user) return
    socket.emit('gameComplete', {
      roomCode,
      userId: user.id,
      completionTime
    })
  }

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.disconnect()
      setCurrentRoom(null)
      setParticipants([])
      setGameState(null)
    }
  }

  const value = {
    socket,
    isConnected,
    currentRoom,
    participants,
    gameState,
    joinRoom,
    setReady,
    startGame,
    broadcastGameStart,
    buzz,
    submitAnswer,
    nextQuestion,
    completeGame,
    leaveRoom
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
