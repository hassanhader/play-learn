const { Level, Question, Game, UserProgress } = require('../models')
const { Op } = require('sequelize')

/**
 * Controller pour la gestion des niveaux
 */
const levelsController = {
  /**
   * GET /api/levels/:levelId
   * Récupérer un niveau spécifique avec toutes ses questions
   */
  getLevelById: async (req, res) => {
    try {
      const { levelId } = req.params
      const userId = req.user?.id

      const level = await Level.findByPk(levelId, {
        include: [
          {
            model: Game,
            as: 'game',
            attributes: ['id', 'gameId', 'title', 'type', 'category', 'icon']
          },
          {
            model: Question,
            as: 'questions',
            where: { isActive: true },
            required: false,
            order: [['order', 'ASC']]
          },
          {
            model: Level,
            as: 'prerequisite',
            attributes: ['id', 'name', 'levelNumber']
          }
        ]
      })

      if (!level) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        })
      }

      // Si utilisateur connecté, inclure sa progression
      let userProgress = null
      if (userId) {
        userProgress = await UserProgress.findOne({
          where: {
            userId,
            levelId: level.id
          }
        })
      }

      res.json({
        success: true,
        data: {
          ...level.toJSON(),
          userProgress
        }
      })
    } catch (error) {
      console.error('Error fetching level:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching level',
        error: error.message
      })
    }
  },

  /**
   * GET /api/levels/:levelId/questions
   * Récupérer toutes les questions d'un niveau
   */
  getLevelQuestions: async (req, res) => {
    try {
      const { levelId } = req.params
      const { includeAnswers = false } = req.query

      const level = await Level.findByPk(levelId)

      if (!level) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        })
      }

      const questions = await Question.findAll({
        where: {
          levelId,
          isActive: true
        },
        order: [['order', 'ASC']],
        attributes: includeAnswers === 'true' 
          ? undefined // Tout inclure
          : { exclude: ['correctAnswer', 'explanation'] } // Exclure les réponses
      })

      res.json({
        success: true,
        count: questions.length,
        data: questions
      })
    } catch (error) {
      console.error('Error fetching level questions:', error)
      res.status(500).json({
        success: false,
        message: 'Error fetching level questions',
        error: error.message
      })
    }
  },

  /**
   * POST /api/levels (Admin/Creator)
   * Créer un nouveau niveau
   */
  createLevel: async (req, res) => {
    try {
      const levelData = req.body

      // Vérifier que le jeu existe
      const game = await Game.findByPk(levelData.gameId)
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        })
      }

      const level = await Level.create(levelData)

      res.status(201).json({
        success: true,
        message: 'Level created successfully',
        data: level
      })
    } catch (error) {
      console.error('Error creating level:', error)
      res.status(500).json({
        success: false,
        message: 'Error creating level',
        error: error.message
      })
    }
  },

  /**
   * PUT /api/levels/:id (Admin/Creator)
   * Mettre à jour un niveau
   */
  updateLevel: async (req, res) => {
    try {
      const { id } = req.params
      const updates = req.body

      const level = await Level.findByPk(id)
      
      if (!level) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        })
      }

      await level.update(updates)

      res.json({
        success: true,
        message: 'Level updated successfully',
        data: level
      })
    } catch (error) {
      console.error('Error updating level:', error)
      res.status(500).json({
        success: false,
        message: 'Error updating level',
        error: error.message
      })
    }
  },

  /**
   * DELETE /api/levels/:id (Admin)
   * Supprimer un niveau
   */
  deleteLevel: async (req, res) => {
    try {
      const { id } = req.params

      const level = await Level.findByPk(id)
      
      if (!level) {
        return res.status(404).json({
          success: false,
          message: 'Level not found'
        })
      }

      await level.destroy()

      res.json({
        success: true,
        message: 'Level deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting level:', error)
      res.status(500).json({
        success: false,
        message: 'Error deleting level',
        error: error.message
      })
    }
  },

  /**
   * POST /api/levels/:levelId/unlock
   * Débloquer un niveau pour un utilisateur
   */
  unlockLevel: async (req, res) => {
    try {
      const { levelId } = req.params
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

      // Vérifier si le niveau a un pré-requis
      if (level.requiredLevel) {
        const requiredProgress = await UserProgress.findOne({
          where: {
            userId,
            levelId: level.requiredLevel,
            status: { [Op.in]: ['completed', 'mastered'] }
          }
        })

        if (!requiredProgress) {
          return res.status(403).json({
            success: false,
            message: 'Required level not completed'
          })
        }
      }

      // Créer ou mettre à jour la progression
      let [progress, created] = await UserProgress.findOrCreate({
        where: {
          userId,
          levelId
        },
        defaults: {
          status: 'unlocked'
        }
      })

      if (!created && progress.status === 'locked') {
        progress.status = 'unlocked'
        await progress.save()
      }

      res.json({
        success: true,
        message: 'Level unlocked successfully',
        data: progress
      })
    } catch (error) {
      console.error('Error unlocking level:', error)
      res.status(500).json({
        success: false,
        message: 'Error unlocking level',
        error: error.message
      })
    }
  }
}

module.exports = levelsController
