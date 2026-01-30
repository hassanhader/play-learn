const { UserProgress, Level, Game, User } = require('../models')
const { Op } = require('sequelize')

/**
 * Controller pour la gestion de la progression utilisateur
 */
const progressController = {
  /**
   * GET /api/progress
   * Récupérer toute la progression de l'utilisateur connecté
   */
  getUserProgress: async (req, res) => {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const progress = await UserProgress.findAll({
        where: { userId },
        include: [
          {
            model: Level,
            as: 'level',
            include: [
              {
                model: Game,
                as: 'game',
                attributes: ['id', 'gameId', 'title', 'type', 'category', 'icon']
              }
            ]
          }
        ],
        order: [['lastPlayedAt', 'DESC']]
      })

      res.json({
        success: true,
        count: progress.length,
        data: progress
      })
    } catch (error) {
      console.error('Error fetching user progress:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching user progress',
        error: error.message
      })
    }
  },

  /**
   * GET /api/progress/game/:gameId
   * Récupérer la progression pour un jeu spécifique
   */
  getGameProgress: async (req, res) => {
    try {
      const { gameId } = req.params
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      // Trouver le jeu
      const game = await Game.findOne({
        where: { gameId },
        include: [
          {
            model: Level,
            as: 'levels',
            order: [['order', 'ASC']]
          }
        ]
      })

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        })
      }

      // Récupérer la progression pour chaque niveau
      const levelIds = game.levels.map(l => l.id)
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

      const levelsWithProgress = game.levels.map(level => ({
        ...level.toJSON(),
        userProgress: progressMap[level.id] || {
          status: level.isLocked ? 'locked' : 'unlocked',
          bestScore: 0,
          attempts: 0,
          stars: 0
        }
      }))

      res.json({
        success: true,
        data: {
          game: {
            id: game.id,
            gameId: game.gameId,
            title: game.title,
            type: game.type,
            category: game.category,
            icon: game.icon
          },
          levels: levelsWithProgress
        }
      })
    } catch (error) {
      console.error('Error fetching game progress:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching game progress',
        error: error.message
      })
    }
  },

  /**
   * POST /api/progress/level/:levelId/complete
   * Enregistrer la complétion d'un niveau
   */
  completeLevel: async (req, res) => {
    try {
      const { levelId } = req.params
      const { score, maxScore, timeSpent, metadata } = req.body
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const level = await Level.findByPk(levelId)
      
      if (!level) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        })
      }

      // Trouver ou créer la progression
      let [progress, created] = await UserProgress.findOrCreate({
        where: {
          userId,
          levelId
        },
        defaults: {
          status: 'in_progress',
          bestScore: 0,
          attempts: 0
        }
      })

      // Mettre à jour la progression
      await progress.updateAfterGame(score, maxScore || level.maxScore, timeSpent || 0)

      // Mettre à jour les métadonnées si fournies
      if (metadata) {
        progress.metadata = {
          ...progress.metadata,
          ...metadata
        }
        await progress.save()
      }

      // Débloquer le niveau suivant si ce niveau est complété
      if (progress.status === 'completed' || progress.status === 'mastered') {
        const nextLevel = await Level.findOne({
          where: {
            gameId: level.gameId,
            requiredLevel: level.id
          }
        })

        if (nextLevel) {
          await UserProgress.findOrCreate({
            where: {
              userId,
              levelId: nextLevel.id
            },
            defaults: {
              status: 'unlocked'
            }
          })
        }
      }

      res.json({
        success: true,
        message: 'Level progress updated successfully',
        data: progress
      })
    } catch (error) {
      console.error('Error completing level:', error)
      res.status(500).json({
        success: false,
        message: 'Error completing level',
        error: error.message
      })
    }
  },

  /**
   * GET /api/progress/stats
   * Récupérer les statistiques globales de progression
   */
  getProgressStats: async (req, res) => {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const progress = await UserProgress.findAll({
        where: { userId },
        include: [
          {
            model: Level,
            as: 'level',
            include: [
              {
                model: Game,
                as: 'game'
              }
            ]
          }
        ]
      })

      // Calculer les statistiques
      const stats = {
        totalLevelsPlayed: progress.length,
        totalLevelsCompleted: progress.filter(p => p.status === 'completed' || p.status === 'mastered').length,
        totalLevelsMastered: progress.filter(p => p.status === 'mastered').length,
        totalAttempts: progress.reduce((sum, p) => sum + p.attempts, 0),
        totalTimeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
        totalStars: progress.reduce((sum, p) => sum + p.stars, 0),
        averageScore: progress.length > 0 
          ? Math.round(progress.reduce((sum, p) => sum + p.bestScore, 0) / progress.length)
          : 0,
        progressByCategory: {}
      }

      // Stats par catégorie
      progress.forEach(p => {
        const category = p.level?.game?.category || 'Unknown'
        if (!stats.progressByCategory[category]) {
          stats.progressByCategory[category] = {
            levelsPlayed: 0,
            levelsCompleted: 0,
            totalScore: 0
          }
        }
        stats.progressByCategory[category].levelsPlayed++
        if (p.status === 'completed' || p.status === 'mastered') {
          stats.progressByCategory[category].levelsCompleted++
        }
        stats.progressByCategory[category].totalScore += p.bestScore
      })

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error fetching progress stats:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching progress stats',
        error: error.message
      })
    }
  },

  /**
   * DELETE /api/progress/level/:levelId/reset
   * Réinitialiser la progression d'un niveau
   */
  resetLevelProgress: async (req, res) => {
    try {
      const { levelId } = req.params
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const progress = await UserProgress.findOne({
        where: {
          userId,
          levelId
        }
      })

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'Progress not found'
        })
      }

      await progress.destroy()

      res.json({
        success: true,
        message: 'Level progress reset successfully'
      })
    } catch (error) {
      console.error('Error resetting level progress:', error)
      res.status(500).json({
        success: false,
        message: 'Error resetting level progress',
        error: error.message
      })
    }
  }
}

module.exports = progressController
