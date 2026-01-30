const { MultiplayerRoom, MultiplayerGameState, Game, Level, Question } = require('../models')
const { DEFAULT_MULTIPLAYER_QUESTIONS, isDefaultGame } = require('./defaultMultiplayerGame')

/**
 * Setup game-specific socket handlers for multiplayer games
 * Handles: next-question, buzz, submit-answer, game progression
 */
const setupGameSocketHandlers = (io, socket) => {
  
  // Load and send next question
  socket.on('next-question', async ({ roomCode }) => {
    try {
      console.log(`⏭️ Next question requested for room ${roomCode}`)

      // Find room with game details
      const room = await MultiplayerRoom.findOne({
        where: { roomCode },
        include: [
          {
            model: Game,
            as: 'game',
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
          }
        ]
      })

      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      if (!room.game) {
        socket.emit('error', { message: 'Game not found' })
        return
      }

      // Get game state
      let gameState = await MultiplayerGameState.findOne({
        where: { roomId: room.id }
      })

      if (!gameState) {
        // Create initial game state if it doesn't exist
        gameState = await MultiplayerGameState.create({
          roomId: room.id,
          currentQuestionIndex: 0,
          totalQuestions: 10,
          responses: {},
          scores: {},
          gameData: {}
        })
      }

      // Vérifier si c'est le jeu par défaut
      let allQuestions = []
      
      if (isDefaultGame(room.gameId)) {
        console.log(`🎮 Using DEFAULT multiplayer game with ${DEFAULT_MULTIPLAYER_QUESTIONS.length} hardcoded questions`)
        allQuestions = DEFAULT_MULTIPLAYER_QUESTIONS
      } else {
        // Debug: Log game structure
        console.log(`🔍 Game structure:`, {
          gameId: room.game.id,
          gameTitle: room.game.title,
          hasLevels: !!room.game.levels,
          levelsCount: room.game.levels ? room.game.levels.length : 0
        })

        // Flatten all questions from all levels
        if (room.game.levels && room.game.levels.length > 0) {
          console.log(`📦 Processing ${room.game.levels.length} levels...`)
          room.game.levels.forEach((level, idx) => {
            console.log(`   Level ${idx + 1}: "${level.title}" - ${level.questions ? level.questions.length : 0} questions`)
            if (level.questions && level.questions.length > 0) {
              allQuestions = allQuestions.concat(level.questions)
            }
          })
        } else {
          console.error(`❌ No levels found! room.game.levels =`, room.game.levels)
        }
      }

      // Check if we have questions
      if (allQuestions.length === 0) {
        console.error(`❌ No questions found for game ${room.gameId}`)
        console.error(`   Game object:`, JSON.stringify(room.game, null, 2))
        socket.emit('error', { message: 'No questions available' })
        io.to(roomCode).emit('game-ended', {
          message: 'No questions available',
          finalScores: gameState.scores || {}
        })
        return
      }

      console.log(`📚 Found ${allQuestions.length} questions for game "${room.game.title}"`)

      // Update total questions if needed
      if (gameState.totalQuestions !== allQuestions.length) {
        await gameState.update({ totalQuestions: allQuestions.length })
      }

      // Check if game is finished
      if (gameState.currentQuestionIndex >= allQuestions.length) {
        console.log(`🏁 Game finished in room ${roomCode}`)
        io.to(roomCode).emit('game-ended', {
          message: 'All questions answered!',
          finalScores: gameState.scores || {},
          totalQuestions: allQuestions.length
        })
        
        // Update room status
        await room.update({ status: 'finished' })
        return
      }

      // Get current question
      const currentQuestion = allQuestions[gameState.currentQuestionIndex]
      
      console.log(`📤 Sending question ${gameState.currentQuestionIndex + 1}/${allQuestions.length}`)
      console.log(`   Text: ${currentQuestion.text}`)

      // Send question to all players in room
      io.to(roomCode).emit('question-loaded', {
        question: {
          id: currentQuestion.id,
          text: currentQuestion.text,
          correctAnswer: currentQuestion.correctAnswer,
          wrongAnswers: currentQuestion.wrongAnswers || [],
          timeLimit: currentQuestion.timeLimit || 30,
          points: currentQuestion.points || 100
        },
        currentQuestionIndex: gameState.currentQuestionIndex,
        totalQuestions: allQuestions.length,
        gameMode: room.gameMode || 'quiz'
      })

      // Update game state with current question
      await gameState.update({
        gameData: {
          ...gameState.gameData,
          currentQuestion: {
            id: currentQuestion.id,
            text: currentQuestion.text,
            correctAnswer: currentQuestion.correctAnswer,
            wrongAnswers: currentQuestion.wrongAnswers || [],
            timeLimit: currentQuestion.timeLimit || 30,
            points: currentQuestion.points || 100
          },
          buzzedPlayer: null, // Reset buzzed player for new question
          questionStartTime: Date.now()
        }
      })

      // Move to next question index
      await gameState.update({ 
        currentQuestionIndex: gameState.currentQuestionIndex + 1 
      })

      console.log(`✅ Question sent to room ${roomCode}, next index: ${gameState.currentQuestionIndex}`)

    } catch (error) {
      console.error('Next question error:', error)
      socket.emit('error', { message: 'Failed to load question', error: error.message })
    }
  })

  // Handle buzz
  socket.on('buzz', async ({ roomCode, userId, username }) => {
    try {
      console.log(`🔔 Player ${username} (${userId}) buzzed in room ${roomCode}`)

      const room = await MultiplayerRoom.findOne({ where: { roomCode } })
      if (!room) return

      const gameState = await MultiplayerGameState.findOne({ where: { roomId: room.id } })
      if (!gameState) return

      // Check if someone already buzzed
      const currentGameData = gameState.gameData || {}
      if (currentGameData.buzzedPlayer) {
        console.log(`⚠️ Player already buzzed: ${currentGameData.buzzedPlayer.username}`)
        return
      }

      // Update game state with buzzed player
      await gameState.update({
        gameData: {
          ...currentGameData,
          buzzedPlayer: { userId, username, buzzTime: Date.now() }
        }
      })

      // Broadcast to all players
      io.to(roomCode).emit('player-buzzed', {
        userId,
        username,
        buzzTime: Date.now()
      })

      console.log(`✅ Buzz registered for ${username}`)
    } catch (error) {
      console.error('Buzz error:', error)
    }
  })

  // Handle answer submission
  socket.on('submit-answer', async ({ roomCode, userId, answer }) => {
    try {
      console.log(`📝 Player ${userId} submitted answer in room ${roomCode}`)

      const room = await MultiplayerRoom.findOne({ where: { roomCode } })
      if (!room) return

      const gameState = await MultiplayerGameState.findOne({ where: { roomId: room.id } })
      if (!gameState) return

      const currentGameData = gameState.gameData || {}
      const currentQuestion = currentGameData.currentQuestion
      
      if (!currentQuestion) {
        console.error('❌ No current question found')
        return
      }

      // Check if answer is correct
      const isCorrect = answer === currentQuestion.correctAnswer
      const points = isCorrect ? (currentQuestion.points || 100) : 0

      console.log(`${isCorrect ? '✅ Correct' : '❌ Wrong'} answer from user ${userId}`)

      // Update scores
      const currentScores = gameState.scores || {}
      currentScores[userId] = (currentScores[userId] || 0) + points

      await gameState.update({ scores: currentScores })

      // Broadcast result to all players
      io.to(roomCode).emit('answer-result', {
        userId,
        answer,
        isCorrect,
        correctAnswer: currentQuestion.correctAnswer,
        points,
        newScore: currentScores[userId]
      })

      io.to(roomCode).emit('scores-updated', {
        scores: currentScores
      })

      console.log(`✅ Answer processed, new scores:`, currentScores)
    } catch (error) {
      console.error('Submit answer error:', error)
    }
  })
}

module.exports = { setupGameSocketHandlers }
