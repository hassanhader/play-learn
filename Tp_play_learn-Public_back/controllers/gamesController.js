const { Game, Level, Question, User, UserProgress } = require('../models')
const { Op } = require('sequelize')
const { DEFAULT_MULTIPLAYER_GAME } = require('../utils/defaultMultiplayerGame')

/**
 * Controller pour la gestion des jeux
 */
const gamesController = {
  /**
   * GET /api/games
   * Récupérer tous les jeux disponibles avec filtres optionnels
   */
  getAllGames: async (req, res) => {
    try {
      const { 
        category, 
        type, 
        difficulty, 
        isEnabled,
        isMultiplayer,
        search 
      } = req.query

      // Construire les filtres
      const where = {}
      
      if (category) where.category = category
      if (type) where.type = type
      if (difficulty) where.difficulty = difficulty
      // Par défaut, ne montrer que les jeux activés (sauf si explicitement demandé autrement)
      if (isEnabled !== undefined) {
        where.isEnabled = isEnabled === 'true' || isEnabled === true
      } else {
        where.isEnabled = true // Défaut: jeux activés seulement
      }
      if (isMultiplayer !== undefined) where.isMultiplayer = isMultiplayer === 'true'
      
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ]
      }

      const games = await Game.findAll({
        where,
        include: [
          {
            model: Level,
            as: 'levels',
            attributes: ['id', 'levelNumber', 'name', 'difficulty', 'timeLimit', 'isLocked', 'order']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username']
          }
        ],
        order: [
          ['category', 'ASC'],
          ['difficulty', 'ASC'],
          ['title', 'ASC'],
          ['levels', 'order', 'ASC']
        ]
      })

      // Ajouter le jeu multijoueur par défaut si filtré pour multiplayer
      let allGames = [...games]
      if (isMultiplayer === 'true' || isMultiplayer === true) {
        allGames.unshift(DEFAULT_MULTIPLAYER_GAME)
      }

      res.json({
        success: true,
        count: allGames.length,
        data: allGames
      })
    } catch (error) {
      console.error('Error fetching games:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching games',
        error: error.message
      })
    }
  },

  /**
   * GET /api/games/:gameId
   * Récupérer un jeu spécifique par son gameId (string)
   */
  getGameById: async (req, res) => {
    try {
      const { gameId } = req.params
      const userId = req.user?.id // Si authentifié

      const game = await Game.findOne({
        where: { gameId },
        include: [
          {
            model: Level,
            as: 'levels',
            include: [
              {
                model: Question,
                as: 'questions',
                where: { isActive: true },
                required: false,
                order: [['order', 'ASC']]
              }
            ],
            order: [['order', 'ASC']]
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username']
          }
        ]
      })

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        })
      }

      // Si l'utilisateur est authentifié, inclure sa progression
      let userProgress = null
      if (userId && game.levels) {
        const levelIds = game.levels.map(l => l.id)
        userProgress = await UserProgress.findAll({
          where: {
            userId,
            levelId: { [Op.in]: levelIds }
          }
        })
      }

      res.json({
        success: true,
        data: {
          ...game.toJSON(),
          userProgress: userProgress || []
        }
      })
    } catch (error) {
      console.error('Error fetching game:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching game',
        error: error.message
      })
    }
  },

  /**
   * GET /api/games/:gameId/levels
   * Récupérer tous les niveaux d'un jeu
   */
  getGameLevels: async (req, res) => {
    try {
      const { gameId } = req.params
      const userId = req.user?.id

      const game = await Game.findOne({
        where: { gameId }
      })

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        })
      }

      const levels = await Level.findAll({
        where: { gameId: game.id },
        include: [
          {
            model: Question,
            as: 'questions',
            attributes: ['id', 'type', 'difficulty', 'points'],
            where: { isActive: true },
            required: false
          }
        ],
        order: [['order', 'ASC']]
      })

      // Si utilisateur connecté, ajouter sa progression
      if (userId) {
        const levelIds = levels.map(l => l.id)
        const progress = await UserProgress.findAll({
          where: {
            userId,
            levelId: { [Op.in]: levelIds }
          }
        })

        // Mapper la progression aux niveaux
        const progressMap = {}
        progress.forEach(p => {
          progressMap[p.levelId] = p
        })

        levels.forEach(level => {
          level.dataValues.userProgress = progressMap[level.id] || null
        })
      }

      res.json({
        success: true,
        count: levels.length,
        data: levels
      })
    } catch (error) {
      console.error('Error fetching game levels:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching game levels',
        error: error.message
      })
    }
  },

  /**
   * GET /api/games/categories
   * Récupérer toutes les catégories disponibles
   */
  getCategories: async (req, res) => {
    try {
      const categories = await Game.findAll({
        attributes: [[Game.sequelize.fn('DISTINCT', Game.sequelize.col('category')), 'category']],
        where: { isEnabled: true },
        raw: true
      })

      res.json({
        success: true,
        data: categories.map(c => c.category)
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message
      })
    }
  },

  /**
   * POST /api/games (Admin/Creator)
   * Créer un nouveau jeu avec niveaux et questions
   */
  createGame: async (req, res) => {
    try {
      const userId = req.user?.id
      
      // 🔍 LOG: Voir ce qui est reçu du frontend
      console.log('🔍 Backend received from frontend:', {
        isMultiplayer: req.body.isMultiplayer,
        minPlayers: req.body.minPlayers,
        maxPlayers: req.body.maxPlayers,
        title: req.body.title
      })
      
      const gameData = {
        ...req.body,
        createdBy: userId
      }

      // 1. Créer le jeu
      const game = await Game.create(gameData)
      console.log('✅ Game created:', game.gameId)
      
      // 🔍 LOG: Voir ce qui a été sauvegardé en base de données
      console.log('🔍 Game saved in DB with:', {
        isMultiplayer: game.isMultiplayer,
        minPlayers: game.minPlayers,
        maxPlayers: game.maxPlayers
      })

      // 2. Créer un niveau par défaut si des questions/configurations existent
      let level = null
      let questions = []

      if (gameData.settings) {
        const settings = gameData.settings

        // Créer le niveau par défaut
        level = await Level.create({
          gameId: game.id,
          levelNumber: 1,
          name: `${game.title} - Level 1`,
          description: `Niveau par défaut pour ${game.title}`,
          difficulty: game.difficulty,
          timeLimit: game.timeLimit,
          pointsToPass: 0,
          isLocked: false,
          order: 1,
          settings: settings // Conserver les settings au niveau du Level
        })
        console.log('✅ Level created:', level.id)

        // 3. Créer les questions selon le type de jeu
        if (game.type === 'quiz' && settings.questions && Array.isArray(settings.questions)) {
          // NOUVEAU CODE ✅
        const questionRecords = settings.questions.map((q, index) => {
        // S'assurer que options est correctement formaté (éviter le double stringify)
        let optionsValue = q.options || []
        
        // Si c'est déjà une string, la garder telle quelle
        // Sinon, la convertir en string JSON
        if (typeof optionsValue === 'string') {
            // Déjà stringifié, on garde tel quel
            optionsValue = optionsValue
        } else if (Array.isArray(optionsValue)) {
            // C'est un array, on stringify une seule fois
            optionsValue = JSON.stringify(optionsValue)
        } else {
            // Cas par défaut
            optionsValue = JSON.stringify([])
        }
        
        return {
            levelId: level.id,
            type: 'multiple_choice',
            questionText: q.question || q.questionText || 'Question sans texte',
            options: optionsValue,  // ✅ Plus de double stringify
            correctAnswer: (q.correctAnswer !== undefined ? q.correctAnswer : 0).toString(),
            explanation: q.explanation || null,
            points: q.points || 10,
            difficulty: game.difficulty,
            order: index,
            isActive: true
        }
        })

          questions = await Question.bulkCreate(questionRecords)
          console.log(`✅ ${questions.length} questions created`)
        } 
        else if (game.type === 'memory' && settings.memoryConfig) {
          // Pour Memory, créer une question "container" avec la config
          const memoryQuestion = await Question.create({
            levelId: level.id,
            type: 'memory_card',
            questionText: 'Memory Game',
            options: null,
            correctAnswer: JSON.stringify(settings.memoryConfig),
            points: settings.totalQuestions || 10,
            difficulty: game.difficulty,
            order: 0,
            isActive: true,
            metadata: settings.memoryConfig
          })
          questions = [memoryQuestion]
          console.log('✅ Memory config question created')
        }
        else if (game.type === 'math' && settings.mathConfig) {
          // Pour Math, créer une question "container" avec la config
          const mathQuestion = await Question.create({
            levelId: level.id,
            type: 'math_problem',
            questionText: 'Math Challenge',
            options: null,
            correctAnswer: JSON.stringify(settings.mathConfig),
            points: settings.totalQuestions || 10,
            difficulty: game.difficulty,
            order: 0,
            isActive: true,
            metadata: settings.mathConfig
          })
          questions = [mathQuestion]
          console.log('✅ Math config question created')
        }
      }

      res.status(201).json({
        success: true,
        message: 'Game created successfully',
        data: {
          game,
          level,
          questionsCount: questions.length
        }
      })
    } catch (error) {
      console.error('Error creating game:', error)
      res.status(500).json({
        success: false,
        message: 'Error creating game',
        error: error.message
      })
    }
  },

  /**
   * PUT /api/games/:id (Admin/Creator)
   * Mettre à jour un jeu
   */
  updateGame: async (req, res) => {
    try {
      const { id } = req.params
      const updates = req.body

      const game = await Game.findByPk(id)
      
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        })
      }

      await game.update(updates)

      res.json({
        success: true,
        message: 'Game updated successfully',
        data: game
      })
    } catch (error) {
      console.error('Error updating game:', error)
      res.status(500).json({
        success: false,
        message: 'Error updating game',
        error: error.message
      })
    }
  },

  /**
   * DELETE /api/games/:id (Admin)
   * Supprimer un jeu
   */
  deleteGame: async (req, res) => {
    try {
      const { id } = req.params

      const game = await Game.findByPk(id)
      
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        })
      }

      await game.destroy()

      res.json({
        success: true,
        message: 'Game deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting game:', error)
      res.status(500).json({
        success: false,
        message: 'Error deleting game',
        error: error.message
      })
    }
  },

  /**
   * POST /api/games/:gameId/play
   * Incrémenter le compteur de jeu et mettre à jour les stats
   */
  incrementPlayCount: async (req, res) => {
    try {
      const { gameId } = req.params

      const game = await Game.findOne({ where: { gameId } })
      
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        })
      }

      game.playCount += 1
      await game.save()

      res.json({
        success: true,
        data: { playCount: game.playCount }
      })
    } catch (error) {
      console.error('Error incrementing play count:', error)
      res.status(500).json({
        success: false,
        message: 'Error incrementing play count',
        error: error.message
      })
    }
  }
}

module.exports = gamesController
