const { MultiplayerRoom, MultiplayerParticipant, MultiplayerGameState, User, Game, Question, Level } = require('../models')
const { setupGameSocketHandlers } = require('./gameSocketHandlers')

// Track active connections
const connections = new Map()

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    // Setup game-specific handlers (questions, buzz, answers)
    setupGameSocketHandlers(io, socket)

    // Join room
    socket.on('joinRoom', async ({ roomCode, userId, username }) => {
      try {
        const room = await MultiplayerRoom.findOne({ where: { roomCode } })
        if (!room) {
          socket.emit('error', { message: 'Room not found' })
          return
        }

        // Store connection info
        connections.set(socket.id, { userId, roomCode, username })

        // Join Socket.io room
        socket.join(roomCode)

        // Create or update participant (findOrCreate ensures participant exists in DB)
        const [participant, created] = await MultiplayerParticipant.findOrCreate({
          where: { roomId: room.id, userId },
          defaults: {
            roomId: room.id,
            userId,
            isReady: false,
            isConnected: true
          }
        })

        // If participant already existed, update connection status
        if (!created) {
          await participant.update({ isConnected: true })
        }

        console.log(`${created ? '✨ Created' : '🔄 Updated'} participant: userId=${userId}, room=${roomCode}`)

        // Get all participants
        const participants = await MultiplayerParticipant.findAll({
          where: { roomId: room.id },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }]
        })

        console.log(`🔍 Found ${participants.length} participants in room ${roomCode}`)
        console.log('📋 Raw participants:', participants.map(p => ({ userId: p.userId, username: p.user?.username, isReady: p.isReady })))

        // Format participants data
        const participantsData = participants.map(p => ({
          userId: p.userId,
          username: p.user?.username || 'Unknown',
          isReady: p.isReady,
          isConnected: p.isConnected,
          joinedAt: p.createdAt
        }))

        console.log('📤 Sending participants data:', JSON.stringify(participantsData, null, 2))

        // Update room current players count
        await room.update({ currentPlayers: participants.length })

        // Broadcast to ALL users in room (including the one who just joined)
        io.to(roomCode).emit('playerJoined', { 
          userId, 
          username,
          currentPlayers: participants.length,
          participants: participantsData
        })
        
        console.log(`📡 Broadcasted playerJoined to room ${roomCode} with ${participants.length} players`)

        console.log(`User ${username} joined room ${roomCode} (${participants.length} players)`)
      } catch (error) {
        console.error('Join room error:', error)
        socket.emit('error', { message: 'Failed to join room' })
      }
    })

    // Set ready status
    socket.on('setReady', async ({ roomCode, userId, isReady }) => {
      try {
        const room = await MultiplayerRoom.findOne({ where: { roomCode } })
        if (!room) return

        await MultiplayerParticipant.update(
          { isReady },
          { where: { roomId: room.id, userId } }
        )

        // Get all participants with user data
        const participants = await MultiplayerParticipant.findAll({
          where: { roomId: room.id },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }]
        })

        console.log(`🔍 setReady: Found ${participants.length} participants in room ${roomCode}`)

        // Format participants data
        const participantsData = participants.map(p => ({
          userId: p.userId,
          username: p.user?.username || 'Unknown',
          isReady: p.isReady,
          isConnected: p.isConnected,
          joinedAt: p.createdAt
        }))

        const allReady = participants.length >= 2 && participants.every(p => p.isReady)
        const readyCount = participants.filter(p => p.isReady).length

        console.log(`👥 Room ${roomCode}: ${readyCount}/${participants.length} ready, allReady=${allReady}`)
        console.log('📤 setReady: Sending participants:', JSON.stringify(participantsData, null, 2))

        // Broadcast updated participants list to ALL users in room
        io.to(roomCode).emit('playerReady', { 
          userId, 
          isReady, 
          allPlayersReady: allReady,
          participants: participantsData,
          readyCount,
          totalPlayers: participants.length
        })

        if (allReady) {
          console.log(`🚀 All players ready in room ${roomCode}!`)
          io.to(roomCode).emit('allPlayersReady', {
            participants: participantsData
          })
        }
      } catch (error) {
        console.error('Set ready error:', error)
      }
    })

    // Start game
    socket.on('startGame', async ({ roomCode, userId }) => {
      try {
        console.log(`🎮 Starting game in room ${roomCode} initiated by user ${userId}`)
        
        const room = await MultiplayerRoom.findOne({ 
          where: { roomCode },
          include: [{ model: Game, as: 'game' }]
        })

        if (!room) {
          console.log(`❌ Room ${roomCode} not found`)
          socket.emit('error', { message: 'Room not found' })
          return
        }

        // Check all players ready
        const participants = await MultiplayerParticipant.findAll({
          where: { roomId: room.id }
        })

        const readyCount = participants.filter(p => p.isReady).length
        console.log(`👥 ${readyCount}/${participants.length} players ready`)

        if (participants.length < 2) {
          console.log(`❌ Not enough players (need at least 2, have ${participants.length})`)
          socket.emit('error', { message: 'Not enough players' })
          return
        }

        if (!participants.every(p => p.isReady)) {
          console.log(`❌ Not all players ready`)
          socket.emit('error', { message: 'Not all players ready' })
          return
        }

        // Load questions via levels (questions are linked to levelId, not gameId)
        const levels = await Level.findAll({
          where: { gameId: room.gameId },
          attributes: ['id']
        })

        if (levels.length === 0) {
          socket.emit('error', { message: 'No levels available for this game' })
          return
        }

        const levelIds = levels.map(l => l.id)
        const questions = await Question.findAll({
          where: { levelId: levelIds },
          limit: 10,
          order: [['id', 'ASC']]
        })

        if (questions.length === 0) {
          socket.emit('error', { message: 'No questions available' })
          return
        }

        // Update room status
        await room.update({ status: 'playing' })

        // Initialize game state
        const gameState = await MultiplayerGameState.findOne({
          where: { roomId: room.id }
        })

        const initialScores = {}
        participants.forEach(p => {
          initialScores[p.userId] = 0
        })

        await gameState.update({
          currentQuestionIndex: 0,
          totalQuestions: questions.length,
          scores: initialScores,
          responses: {},
          buzzedByUserId: null
        })

        // Send first question
        const firstQuestion = questions[0]
        io.to(roomCode).emit('gameStarted', {
          gameMode: room.gameMode,
          difficulty: room.difficulty || 'medium',
          currentQuestionIndex: 0,
          totalQuestions: questions.length,
          question: {
            id: firstQuestion.id,
            questionText: firstQuestion.questionText,
            options: firstQuestion.options,
            timeLimit: firstQuestion.timeLimit || 30
          }
        })

        console.log(`✅ Game started in room ${roomCode} with ${questions.length} questions`)
      } catch (error) {
        console.error('Start game error:', error)
        socket.emit('error', { message: 'Failed to start game' })
      }
    })

    // New format: start-game (for synchronized game launch)
    socket.on('start-game', async ({ roomCode, hostId, timestamp }) => {
      try {
        console.log(`🚀 start-game event received: room=${roomCode}, host=${hostId}, timestamp=${timestamp}`)
        
        const room = await MultiplayerRoom.findOne({ where: { roomCode } })
        
        if (!room) {
          console.log(`❌ Room ${roomCode} not found`)
          socket.emit('error', { message: 'Room not found' })
          return
        }

        // Verify the sender is the host
        if (room.hostUserId !== hostId) {
          console.log(`❌ User ${hostId} is not the host (host is ${room.hostUserId})`)
          socket.emit('error', { message: 'Only host can start the game' })
          return
        }

        // Update room status to in-progress
        await room.update({ status: 'in-progress' })
        console.log(`✅ Room ${roomCode} status updated to in-progress`)

        // Broadcast to ALL participants in the room
        io.to(roomCode).emit('game-started', {
          roomCode,
          startedBy: hostId,
          timestamp,
          status: 'in-progress'
        })

        // Also emit alternative formats for compatibility
        io.to(roomCode).emit('start-game-broadcast', {
          roomCode,
          hostId,
          timestamp
        })

        io.to(roomCode).emit('room-updated', {
          room: {
            ...room.toJSON(),
            status: 'in-progress'
          },
          status: 'in-progress'
        })

        console.log(`✅ Broadcasted game-started to all participants in room ${roomCode}`)
      } catch (error) {
        console.error('start-game error:', error)
        socket.emit('error', { message: 'Failed to start game' })
      }
    })

    // Alternative handler: join-room (for game launch page)
    socket.on('join-room', async ({ roomCode, userId, username }) => {
      try {
        console.log(`🔌 join-room: ${username} joining ${roomCode}`)
        
        // Join the Socket.io room
        socket.join(roomCode)
        
        // Store connection
        connections.set(socket.id, { userId, roomCode, username })
        
        console.log(`✅ ${username} joined Socket.io room ${roomCode}`)
      } catch (error) {
        console.error('join-room error:', error)
      }
    })

    // Buzz (for quiz mode)
    socket.on('buzz', async ({ roomCode, userId }) => {
      try {
        const room = await MultiplayerRoom.findOne({ where: { roomCode } })
        if (!room) return

        const gameState = await MultiplayerGameState.findOne({
          where: { roomId: room.id }
        })

        // Check if someone already buzzed
        if (gameState.buzzedByUserId) {
          return
        }

        // Get user info to send username with buzz event
        const user = await User.findByPk(userId, {
          attributes: ['id', 'username']
        })

        // Set buzzer
        await gameState.update({ buzzedByUserId: userId })

        io.to(roomCode).emit('playerBuzzed', { 
          userId, 
          username: user?.username || 'Unknown' 
        })
      } catch (error) {
        console.error('Buzz error:', error)
      }
    })

    // Submit answer
    socket.on('submitAnswer', async ({ roomCode, userId, answer }) => {
      try {
        const room = await MultiplayerRoom.findOne({ where: { roomCode } })
        if (!room) return

        const gameState = await MultiplayerGameState.findOne({
          where: { roomId: room.id }
        })

        // Load questions via levels
        const levels = await Level.findAll({
          where: { gameId: room.gameId },
          attributes: ['id']
        })
        const levelIds = levels.map(l => l.id)
        const questions = await Question.findAll({
          where: { levelId: levelIds },
          limit: 10,
          order: [['id', 'ASC']]
        })

        const currentQuestion = questions[gameState.currentQuestionIndex]
        if (!currentQuestion) return

        // Check answer
        const isCorrect = answer === currentQuestion.correctAnswer
        const currentScores = gameState.scores || {}
        const currentResponses = gameState.responses || {}

        // Calculate score with time bonus
        let points = 0
        if (isCorrect) {
          points = 100 // Base points
          if (room.gameMode === 'quiz' && gameState.buzzedByUserId === userId) {
            points += 50 // Buzzer bonus
          }
        }

        currentScores[userId] = (currentScores[userId] || 0) + points
        currentResponses[userId] = {
          answer,
          isCorrect,
          timestamp: Date.now()
        }

        await gameState.update({
          scores: currentScores,
          responses: currentResponses
        })

        // Emit result
        socket.emit('answerResult', {
          isCorrect,
          correctAnswer: currentQuestion.correctAnswer,
          score: points,
          totalScore: currentScores[userId]
        })

        // For speed mode, check if all answered
        if (room.gameMode === 'speed') {
          const participants = await MultiplayerParticipant.findAll({
            where: { roomId: room.id }
          })

          const allAnswered = participants.every(p => currentResponses[p.userId])

          if (allAnswered) {
            io.to(roomCode).emit('questionComplete', {
              responses: currentResponses,
              scores: currentScores,
              correctAnswer: currentQuestion.correctAnswer
            })

            // Auto-advance after 3 seconds
            setTimeout(() => {
              nextQuestion(io, roomCode, room, gameState, questions)
            }, 3000)
          }
        }
      } catch (error) {
        console.error('Submit answer error:', error)
      }
    })

    // Next question (for quiz mode)
    socket.on('nextQuestion', async ({ roomCode, userId }) => {
      try {
        const room = await MultiplayerRoom.findOne({ where: { roomCode } })
        if (!room || room.hostUserId !== userId) return

        const gameState = await MultiplayerGameState.findOne({
          where: { roomId: room.id }
        })

        // Load questions via levels
        const levels = await Level.findAll({
          where: { gameId: room.gameId },
          attributes: ['id']
        })
        const levelIds = levels.map(l => l.id)
        const questions = await Question.findAll({
          where: { levelId: levelIds },
          limit: 10,
          order: [['id', 'ASC']]
        })

        await nextQuestion(io, roomCode, room, gameState, questions)
      } catch (error) {
        console.error('Next question error:', error)
      }
    })

    // Complete game (for puzzle/memory modes)
    socket.on('gameComplete', async ({ roomCode, userId, time }) => {
      try {
        const room = await MultiplayerRoom.findOne({ where: { roomCode } })
        if (!room) return

        const gameState = await MultiplayerGameState.findOne({
          where: { roomId: room.id }
        })

        const completionData = gameState.completionData || {}
        completionData[userId] = {
          completed: true,
          time,
          timestamp: Date.now()
        }

        await gameState.update({ completionData })

        // Update participant
        await MultiplayerParticipant.update(
          { completedAt: new Date(), finalScore: time },
          { where: { roomId: room.id, userId } }
        )

        // Check if all completed
        const participants = await MultiplayerParticipant.findAll({
          where: { roomId: room.id }
        })

        const allCompleted = participants.every(p => completionData[p.userId]?.completed)

        if (allCompleted) {
          // Assign ranks
          const sorted = Object.entries(completionData)
            .sort((a, b) => a[1].time - b[1].time)

          for (let i = 0; i < sorted.length; i++) {
            const [userId, data] = sorted[i]
            await MultiplayerParticipant.update(
              { rank: i + 1 },
              { where: { roomId: room.id, userId: parseInt(userId) } }
            )
          }

          await room.update({ status: 'finished' })

          // Emit final rankings
          const rankings = await MultiplayerParticipant.findAll({
            where: { roomId: room.id },
            include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
            order: [['rank', 'ASC']]
          })

          io.to(roomCode).emit('gameEnded', {
            rankings: rankings.map(r => ({
              userId: r.userId,
              username: r.user.username,
              score: r.finalScore,
              rank: r.rank
            }))
          })
        } else {
          io.to(roomCode).emit('playerCompleted', { userId, time })
        }
      } catch (error) {
        console.error('Game complete error:', error)
      }
    })

    // Disconnect
    socket.on('disconnect', async () => {
      const connection = connections.get(socket.id)
      if (connection) {
        const { userId, roomCode } = connection

        try {
          const room = await MultiplayerRoom.findOne({ where: { roomCode } })
          if (room) {
            await MultiplayerParticipant.update(
              { isConnected: false },
              { where: { roomId: room.id, userId } }
            )

            io.to(roomCode).emit('playerDisconnected', { userId })
          }
        } catch (error) {
          console.error('Disconnect error:', error)
        }

        connections.delete(socket.id)
      }

      console.log('Socket disconnected:', socket.id)
    })
  })
}

// Helper function to advance to next question
const nextQuestion = async (io, roomCode, room, gameState, questions) => {
  const nextIndex = gameState.currentQuestionIndex + 1

  if (nextIndex >= questions.length) {
    // Game finished
    await room.update({ status: 'finished' })

    const participants = await MultiplayerParticipant.findAll({
      where: { roomId: room.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }]
    })

    const scores = gameState.scores || {}
    const rankings = participants
      .map(p => ({
        userId: p.userId,
        username: p.user.username,
        score: scores[p.userId] || 0
      }))
      .sort((a, b) => b.score - a.score)

    // Assign ranks
    for (let i = 0; i < rankings.length; i++) {
      await MultiplayerParticipant.update(
        { rank: i + 1, finalScore: rankings[i].score },
        { where: { roomId: room.id, userId: rankings[i].userId } }
      )
    }

    io.to(roomCode).emit('gameEnded', { rankings })
  } else {
    // Next question
    await gameState.update({
      currentQuestionIndex: nextIndex,
      buzzedByUserId: null,
      responses: {}
    })

    const nextQuestion = questions[nextIndex]
    io.to(roomCode).emit('nextQuestion', {
      questionIndex: nextIndex,
      totalQuestions: questions.length,
      question: {
        id: nextQuestion.id,
        questionText: nextQuestion.questionText,
        options: nextQuestion.options,
        timeLimit: nextQuestion.timeLimit || 30
      },
      scores: gameState.scores
    })
  }
}

module.exports = setupSocketHandlers
