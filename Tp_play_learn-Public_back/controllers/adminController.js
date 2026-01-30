const { User, Game, Score, Level, Question } = require('../models')
const { Op } = require('sequelize')

/**
 * Controller pour les fonctionnalités admin
 */
const adminController = {
  /**
   * GET /api/admin/users
   * Récupérer tous les utilisateurs (Admin only)
   */
  getAllUsers: async (req, res) => {
    try {
      const { search, isAdmin, sortBy = 'createdAt', order = 'DESC' } = req.query

      const where = {}
      
      // Filtrer par recherche
      if (search) {
        where[Op.or] = [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ]
      }

      // Filtrer par isAdmin
      if (isAdmin !== undefined) {
        where.isAdmin = isAdmin === 'true'
      }

      const users = await User.findAll({
        where,
        attributes: ['id', 'username', 'email', 'isAdmin', 'isGuest', 'lastLogin', 'createdAt'],
        include: [
          {
            model: Score,
            as: 'scores',
            attributes: ['id', 'score', 'createdAt'],
            limit: 5,
            order: [['score', 'DESC']]
          }
        ],
        order: [[sortBy, order]]
      })

      // Calculer des statistiques pour chaque utilisateur
      const usersWithStats = users.map(user => {
        const userJson = user.toJSON()
        const scores = userJson.scores || []
        
        return {
          ...userJson,
          stats: {
            totalGames: scores.length,
            bestScore: scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0,
            averageScore: scores.length > 0 
              ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
              : 0
          }
        }
      })

      res.json({
        success: true,
        count: usersWithStats.length,
        data: usersWithStats
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      })
    }
  },

  /**
   * PUT /api/admin/users/:id/toggle-admin
   * Basculer le statut admin d'un utilisateur
   */
  toggleUserAdmin: async (req, res) => {
    try {
      const { id } = req.params

      const user = await User.findByPk(id)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Ne pas permettre de se retirer soi-même les droits admin
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot remove your own admin privileges'
        })
      }

      // Basculer isAdmin
      user.isAdmin = !user.isAdmin
      await user.save()

      res.json({
        success: true,
        message: `User ${user.isAdmin ? 'promoted to' : 'removed from'} admin`,
        data: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin
        }
      })
    } catch (error) {
      console.error('Error toggling admin status:', error)
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      })
    }
  },

  /**
   * DELETE /api/admin/users/:id
   * Supprimer un utilisateur
   */
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params

      const user = await User.findByPk(id)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Ne pas permettre de se supprimer soi-même
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        })
      }

      await user.destroy()

      res.json({
        success: true,
        message: 'User deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      })
    }
  },

  /**
   * DELETE /api/admin/games/:id
   * Supprimer un jeu (Admin only)
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
   * PUT /api/admin/games/:id/toggle-status
   * Basculer le statut actif/inactif d'un jeu (Admin only)
   */
  toggleGameStatus: async (req, res) => {
    try {
      const { id } = req.params

      const game = await Game.findByPk(id)
      
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        })
      }

      // Basculer isEnabled (le champ correct dans le modèle)
      game.isEnabled = !game.isEnabled
      await game.save()

      res.json({
        success: true,
        message: `Game ${game.isEnabled ? 'activated' : 'deactivated'} successfully`,
        data: {
          id: game.id,
          gameId: game.gameId,
          title: game.title,
          isEnabled: game.isEnabled
        }
      })
    } catch (error) {
      console.error('Error toggling game status:', error)
      res.status(500).json({
        success: false,
        message: 'Error updating game status',
        error: error.message
      })
    }
  },
  
  /**
   * GET /api/admin/games
   * Récupérer tous les jeux avec leurs statistiques (Admin only)
   */
  getAllGames: async (req, res) => {
    try {
      const { search, category, sortBy = 'createdAt', order = 'DESC' } = req.query

      const where = {}
      
      // Filtrer par recherche
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ]
      }

      // Filtrer par catégorie
      if (category) {
        where.category = category
      }

      // Récupérer les jeux sans les associations complexes
      const games = await Game.findAll({
        where,
        order: [[sortBy, order]]
      })

      // Calculer des statistiques pour chaque jeu
      const gamesWithStats = await Promise.all(games.map(async (game) => {
        const gameJson = game.toJSON()
        
        // Compter les questions directement liées au jeu
        const questionCount = await Question.count({
        include: [{
            model: Level,
            as: 'level',
            where: { gameId: game.id },
            attributes: []
        }]
        })
        
        // Compter les levels
        const levelCount = await Level.count({
          where: { gameId: game.id }
        })
        
        return {
          id: gameJson.id,
          gameId: gameJson.gameId,
          title: gameJson.title,
          description: gameJson.description || 'No description',
          category: gameJson.category,
          difficulty: gameJson.difficulty || 'medium',
          timeLimit: gameJson.timeLimit || null,
          icon: gameJson.icon || '🎮',
          playCount: gameJson.playCount || 0,
          isEnabled: Boolean(gameJson.isEnabled), // Convertir 1/0 en true/false correctement
          isMultiplayer: Boolean(gameJson.isMultiplayer), // ✅ Ajout du champ multiplayer
          minPlayers: gameJson.minPlayers || 1, // ✅ Ajout minPlayers
          maxPlayers: gameJson.maxPlayers || 1, // ✅ Ajout maxPlayers
          type: gameJson.type, // ✅ Ajout type de jeu
          settings: gameJson.settings, // ✅ Ajout settings (gameMode, hasBuzzer, etc.)
          questionCount,
          levelCount,
          createdAt: gameJson.createdAt,
          updatedAt: gameJson.updatedAt,
          createdBy: gameJson.createdBy
        }
      }))

      res.json({
        success: true,
        count: gamesWithStats.length,
        data: gamesWithStats
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
   * DELETE /api/admin/scores/:id
   * Supprimer un score
   */
  deleteScore: async (req, res) => {
    try {
      const { id } = req.params

      const score = await Score.findByPk(id)
      
      if (!score) {
        return res.status(404).json({
          success: false,
          message: 'Score not found'
        })
      }

      await score.destroy()

      res.json({
        success: true,
        message: 'Score deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting score:', error)
      res.status(500).json({
        success: false,
        message: 'Error deleting score',
        error: error.message
      })
    }
  },

  /**
   * GET /api/admin/stats
   * Récupérer des statistiques globales
   */
  getGlobalStats: async (req, res) => {
    try {
      const [
        totalUsers,
        totalGames,
        totalScores,
        adminUsers
      ] = await Promise.all([
        User.count(),
        Game.count(),
        Score.count(),
        User.count({ where: { isAdmin: true } })
      ])

      // Récupérer les jeux les plus joués
      const topGames = await Game.findAll({
        attributes: ['id', 'gameId', 'title', 'playCount', 'category', 'icon'],
        order: [['playCount', 'DESC']],
        limit: 5
      })

      // Récupérer les meilleurs joueurs
      const topPlayers = await User.findAll({
        attributes: ['id', 'username', 'createdAt'],
        include: [
          {
            model: Score,
            as: 'scores',
            attributes: ['score']
          }
        ],
        limit: 10
      })

      const playersWithTotalScore = topPlayers.map(player => {
        const scores = player.scores || []
        return {
          id: player.id,
          username: player.username,
          createdAt: player.createdAt,
          totalScore: scores.reduce((sum, s) => sum + s.score, 0),
          gamesPlayed: scores.length
        }
      }).sort((a, b) => b.totalScore - a.totalScore).slice(0, 5)

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalGames,
            totalScores,
            adminUsers
          },
          topGames,
          topPlayers: playersWithTotalScore
        }
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      })
    }
  },

  /**
   * GET /api/admin/games/:id
   * Récupérer un jeu spécifique avec tous ses détails (Admin only)
   */
  getGameById: async (req, res) => {
    try {
      const { id } = req.params

      const game = await Game.findByPk(id, {
        include: [
          {
            model: Level,
            as: 'levels',
            include: [
              {
                model: Question,
                as: 'questions',
                attributes: ['id', 'questionText', 'correctAnswer', 'wrongAnswer1', 'wrongAnswer2', 'wrongAnswer3', 'levelId']
              }
            ]
          },
          {
            model: Score,
            as: 'scores',
            attributes: ['id', 'score', 'playedAt'],
            limit: 10,
            separate: true,
            order: [['score', 'DESC']]
          }
        ]
      })

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        })
      }

      const gameJson = game.toJSON()

      // Récupérer toutes les questions du jeu (tous niveaux confondus)
      const allQuestions = gameJson.levels?.flatMap(level => level.questions || []) || []

      res.json({
        success: true,
        game: {
          id: gameJson.id,
          gameId: gameJson.gameId,
          title: gameJson.title,
          description: gameJson.description,
          category: gameJson.category,
          difficulty: gameJson.difficulty,
          icon: gameJson.icon,
          timeLimit: gameJson.timeLimit,
          isEnabled: Boolean(gameJson.isEnabled),
          isMultiplayer: Boolean(gameJson.isMultiplayer), // ✅ Ajout
          minPlayers: gameJson.minPlayers || 1, // ✅ Ajout
          maxPlayers: gameJson.maxPlayers || 1, // ✅ Ajout
          type: gameJson.type, // ✅ Ajout
          settings: gameJson.settings, // ✅ Ajout
          createdAt: gameJson.createdAt,
          updatedAt: gameJson.updatedAt,
          playCount: gameJson.scores?.length || 0,
          questionCount: allQuestions.length,
          levelCount: gameJson.levels?.length || 0,
          questions: allQuestions,
          levels: gameJson.levels || []
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
  }
}

module.exports = adminController
