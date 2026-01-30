const { MultiplayerRoom, MultiplayerParticipant, MultiplayerGameState, User, Game, Level, Question } = require('../models')
const { DEFAULT_MULTIPLAYER_GAME, DEFAULT_MULTIPLAYER_QUESTIONS, isDefaultGame } = require('../utils/defaultMultiplayerGame')

// Generate unique room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create a new multiplayer room
exports.createRoom = async (req, res) => {
  try {
    const { gameId, name, maxPlayers, difficulty, category } = req.body
    const hostUserId = req.user.id

    // Vérifier si c'est le jeu par défaut
    let game
    if (isDefaultGame(gameId)) {
      game = DEFAULT_MULTIPLAYER_GAME
    } else {
      // Verify game exists in DB
      game = await Game.findByPk(gameId)
      if (!game) {
        return res.status(404).json({ message: 'Game not found' })
      }
    }

    // Generate unique room code
    let roomCode
    let isUnique = false
    while (!isUnique) {
      roomCode = generateRoomCode()
      const existing = await MultiplayerRoom.findOne({ where: { roomCode } })
      if (!existing) isUnique = true
    }

    // Determine game mode based on game type
    let gameMode = 'quiz'
    if (game.type === 'math' || game.type === 'speed') gameMode = 'speed'
    else if (game.type === 'puzzle' || game.type === 'memory') gameMode = 'puzzle'
    else if (game.type === 'coding') gameMode = 'coding'

    // Create room
    const room = await MultiplayerRoom.create({
      roomCode,
      gameId,
      hostUserId,
      name: name || `${game.title} Room`,
      maxPlayers: maxPlayers || 4,
      currentPlayers: 1,
      status: 'waiting',
      gameMode,
      difficulty,
      category
    })

    // Add host as first participant (automatically ready since they created the room)
    await MultiplayerParticipant.create({
      roomId: room.id,
      userId: hostUserId,
      isReady: true  // Host is automatically ready
    })

    // Initialize game state
    await MultiplayerGameState.create({
      roomId: room.id,
      currentQuestionIndex: 0,
      totalQuestions: 10,
      responses: {},
      scores: {},
      gameData: {}
    })

    // Schedule automatic room deletion after 1 minute (60000ms)
    setTimeout(async () => {
      try {
        const roomToDelete = await MultiplayerRoom.findByPk(room.id)
        if (roomToDelete && roomToDelete.status === 'waiting') {
          console.log(`⏰ Auto-deleting room ${roomCode} after 1 minute timeout`)
          
          // Delete associated records
          await MultiplayerGameState.destroy({ where: { roomId: room.id } })
          await MultiplayerParticipant.destroy({ where: { roomId: room.id } })
          await roomToDelete.destroy()
          
          console.log(`✅ Room ${roomCode} deleted successfully`)
        }
      } catch (error) {
        console.error(`❌ Error auto-deleting room ${roomCode}:`, error)
      }
    }, 60000) // 1 minute = 60000 milliseconds

    res.status(201).json({
      message: 'Room created successfully',
      room: {
        id: room.id,
        roomCode: room.roomCode,
        name: room.name,
        gameMode: room.gameMode,
        maxPlayers: room.maxPlayers,
        currentPlayers: room.currentPlayers
      }
    })
  } catch (error) {
    console.error('Create room error:', error)
    res.status(500).json({ message: 'Failed to create room', error: error.message })
  }
}

// Get available rooms
exports.getAvailableRooms = async (req, res) => {
  try {
    const rooms = await MultiplayerRoom.findAll({
      where: { status: 'waiting' },
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'username']
        },
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'title', 'type']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json({ rooms })
  } catch (error) {
    console.error('Get rooms error:', error)
    res.status(500).json({ message: 'Failed to fetch rooms', error: error.message })
  }
}

// Join a room
exports.joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.params
    const userId = req.user.id

    const room = await MultiplayerRoom.findOne({
      where: { roomCode },
      include: [
        {
          model: MultiplayerParticipant,
          as: 'participants'
        }
      ]
    })

    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }

    if (room.status !== 'waiting') {
      return res.status(400).json({ message: 'Game already started' })
    }

    if (room.currentPlayers >= room.maxPlayers) {
      return res.status(400).json({ message: 'Room is full' })
    }

    // Check if already in room
    const existing = await MultiplayerParticipant.findOne({
      where: { roomId: room.id, userId }
    })

    if (existing) {
      return res.status(400).json({ message: 'Already in this room' })
    }

    // Add participant
    await MultiplayerParticipant.create({
      roomId: room.id,
      userId,
      isReady: false
    })

    // Update player count
    await room.update({ currentPlayers: room.currentPlayers + 1 })

    res.json({ message: 'Joined room successfully', roomCode: room.roomCode })
  } catch (error) {
    console.error('Join room error:', error)
    res.status(500).json({ message: 'Failed to join room', error: error.message })
  }
}

// Get room details
exports.getRoomDetails = async (req, res) => {
  try {
    const { roomCode } = req.params

    const room = await MultiplayerRoom.findOne({
      where: { roomCode },
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'username']
        },
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'title', 'type', 'description']
        },
        {
          model: MultiplayerParticipant,
          as: 'participants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        },
        {
          model: MultiplayerGameState,
          as: 'gameState'
        }
      ]
    })

    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }

    res.json({ room })
  } catch (error) {
    console.error('Get room details error:', error)
    res.status(500).json({ message: 'Failed to fetch room details', error: error.message })
  }
}

// Set player ready status
exports.setPlayerReady = async (req, res) => {
  try {
    const { roomCode } = req.params
    const { isReady } = req.body
    const userId = req.user.id

    const room = await MultiplayerRoom.findOne({ where: { roomCode } })
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }

    const participant = await MultiplayerParticipant.findOne({
      where: { roomId: room.id, userId }
    })

    if (!participant) {
      return res.status(404).json({ message: 'Not in this room' })
    }

    await participant.update({ isReady })

    // Check if all players ready
    const allParticipants = await MultiplayerParticipant.findAll({
      where: { roomId: room.id }
    })
    const allReady = allParticipants.every(p => p.isReady)

    res.json({ 
      message: 'Ready status updated', 
      isReady,
      allPlayersReady: allReady
    })
  } catch (error) {
    console.error('Set ready error:', error)
    res.status(500).json({ message: 'Failed to update ready status', error: error.message })
  }
}

// Leave room
exports.leaveRoom = async (req, res) => {
  try {
    const { roomCode } = req.params
    const userId = req.user.id

    const room = await MultiplayerRoom.findOne({ where: { roomCode } })
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }

    const participant = await MultiplayerParticipant.findOne({
      where: { roomId: room.id, userId }
    })

    if (!participant) {
      return res.status(404).json({ message: 'Not in this room' })
    }

    await participant.destroy()

    // Update player count
    const newCount = room.currentPlayers - 1
    await room.update({ currentPlayers: newCount })

    // If host left, transfer to another player or delete room
    if (room.hostUserId === userId) {
      if (newCount > 0) {
        const newHost = await MultiplayerParticipant.findOne({
          where: { roomId: room.id }
        })
        if (newHost) {
          await room.update({ hostUserId: newHost.userId })
        }
      } else {
        // No players left, delete room
        await room.destroy()
      }
    }

    res.json({ message: 'Left room successfully' })
  } catch (error) {
    console.error('Leave room error:', error)
    res.status(500).json({ message: 'Failed to leave room', error: error.message })
  }
}

// Start game (REST API endpoint for synchronized launch)
exports.startGame = async (req, res) => {
  try {
    const { roomCode } = req.params
    const userId = req.user.id
    const { hostId } = req.body

    console.log(`🚀 API start-game: room=${roomCode}, userId=${userId}, hostId=${hostId}`)

    const room = await MultiplayerRoom.findOne({ 
      where: { roomCode },
      include: [
        { 
          model: Game, 
          as: 'game',
          attributes: ['id', 'title', 'type', 'difficulty', 'category']
        }
      ]
    })

    if (!room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      })
    }

    // Verify the user is the host
    if (room.hostUserId !== userId && room.hostUserId !== hostId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the host can start the game' 
      })
    }

    // Update room status
    await room.update({ status: 'in-progress' })
    console.log(`✅ Room ${roomCode} status updated to in-progress via API`)

    // Get Socket.io instance from app (if available)
    const io = req.app.get('io')
    if (io) {
      // Broadcast to all participants via Socket.io
      io.to(roomCode).emit('game-started', {
        roomCode,
        startedBy: userId,
        timestamp: Date.now(),
        status: 'in-progress'
      })

      io.to(roomCode).emit('room-updated', {
        room: {
          ...room.toJSON(),
          status: 'in-progress'
        },
        status: 'in-progress'
      })

      console.log(`📡 Broadcasted game-started via Socket.io for room ${roomCode}`)
    } else {
      console.warn('⚠️ Socket.io not available, only API response will be sent')
    }

    res.json({
      success: true,
      message: 'Game started successfully',
      room: {
        id: room.id,
        roomCode: room.roomCode,
        status: room.status,
        gameId: room.gameId,
        game: room.game
      }
    })
  } catch (error) {
    console.error('Start game API error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start game', 
      error: error.message 
    })
  }
}

// Get game details with questions (NEW endpoint for multiplayer)
exports.getGameDetails = async (req, res) => {
  try {
    const { gameId } = req.params
    
    console.log(`🎮 Fetching game details for gameId: ${gameId}`)

    // Vérifier si c'est le jeu par défaut
    if (isDefaultGame(gameId)) {
      console.log(`✅ Using DEFAULT multiplayer game with ${DEFAULT_MULTIPLAYER_QUESTIONS.length} hardcoded questions`)
      
      return res.json({
        success: true,
        data: {
          ...DEFAULT_MULTIPLAYER_GAME,
          settings: {
            gameMode: DEFAULT_MULTIPLAYER_GAME.type,
            totalQuestions: DEFAULT_MULTIPLAYER_QUESTIONS.length,
            timePerQuestion: 30
          },
          questions: DEFAULT_MULTIPLAYER_QUESTIONS
        }
      })
    }

    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: Level,
          as: 'levels',
          include: [
            {
              model: Question,
              as: 'questions'
            }
          ]
        }
      ]
    })

    if (!game) {
      return res.status(404).json({ 
        success: false, 
        message: 'Game not found' 
      })
    }

    // Flatten questions from all levels
    let allQuestions = []
    if (game.levels && game.levels.length > 0) {
      game.levels.forEach(level => {
        if (level.questions && level.questions.length > 0) {
          allQuestions = allQuestions.concat(level.questions)
        }
      })
    }

    console.log(`✅ Found game "${game.title}" with ${allQuestions.length} questions`)

    res.json({
      success: true,
      data: {
        id: game.id,
        title: game.title,
        type: game.type,
        description: game.description,
        difficulty: game.difficulty,
        category: game.category,
        isMultiplayer: game.isMultiplayer,
        settings: {
          gameMode: game.type,
          totalQuestions: allQuestions.length,
          timePerQuestion: 30
        },
        questions: allQuestions.map(q => ({
          id: q.id,
          text: q.text,
          correctAnswer: q.correctAnswer,
          wrongAnswers: q.wrongAnswers,
          timeLimit: q.timeLimit || 30,
          points: q.points || 100
        }))
      }
    })
  } catch (error) {
    console.error('Get game details error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch game details', 
      error: error.message 
    })
  }
}
