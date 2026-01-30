const { Score, User } = require('../models')
const { validationResult } = require('express-validator')

// @desc    Save a new score
// @route   POST /api/scores
// @access  Private
exports.saveScore = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const {
      gameId,
      gameTitle,
      score,
      maxScore,
      difficulty,
      mode,
      category,
      duration,
      metadata
    } = req.body

    // Create score record
    const newScore = await Score.create({
      userId: req.user.id,
      gameId,
      gameTitle,
      score,
      maxScore,
      difficulty,
      mode,
      category,
      duration,
      metadata,
      completedAt: new Date()
    })

    // Fetch the created score with user info
    const scoreWithUser = await Score.findByPk(newScore.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'isGuest']
      }]
    })

    res.status(201).json({
      success: true,
      message: 'Score saved successfully',
      data: scoreWithUser
    })
  } catch (error) {
    console.error('Error saving score:', error)
    res.status(500).json({
      success: false,
      message: 'Error saving score',
      error: error.message
    })
  }
}

// @desc    Get user's score history
// @route   GET /api/scores/user/:userId
// @access  Private
exports.getUserScores = async (req, res) => {
  try {
    const { userId } = req.params
    const { gameId, category, limit = 50, offset = 0 } = req.query

    // Build where clause
    const whereClause = { userId }
    if (gameId) whereClause.gameId = gameId
    if (category) whereClause.category = category

    // Fetch scores
    const scores = await Score.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'isGuest']
      }],
      order: [['completedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    // Get total count
    const total = await Score.count({ where: whereClause })

    res.json({
      success: true,
      data: scores,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + scores.length) < total
      }
    })
  } catch (error) {
    console.error('Error fetching user scores:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching scores',
      error: error.message
    })
  }
}

// @desc    Get scores for a specific game (leaderboard)
// @route   GET /api/scores/game/:gameId
// @access  Public
exports.getGameScores = async (req, res) => {
  try {
    const { gameId } = req.params
    const { difficulty, mode, limit = 100 } = req.query

    // Build where clause
    const whereClause = { gameId }
    if (difficulty) whereClause.difficulty = difficulty
    if (mode) whereClause.mode = mode

    // Fetch top scores
    const scores = await Score.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'isGuest']
      }],
      order: [
        ['score', 'DESC'],
        ['completedAt', 'ASC'] // Earlier completion wins in case of tie
      ],
      limit: parseInt(limit)
    })

    res.json({
      success: true,
      data: scores,
      total: scores.length
    })
  } catch (error) {
    console.error('Error fetching game scores:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching game scores',
      error: error.message
    })
  }
}

// @desc    Get user's best score for a specific game
// @route   GET /api/scores/user/:userId/game/:gameId/best
// @access  Private
exports.getUserBestScore = async (req, res) => {
  try {
    const { userId, gameId } = req.params
    const { difficulty } = req.query

    // Build where clause
    const whereClause = { userId, gameId }
    if (difficulty) whereClause.difficulty = difficulty

    // Fetch best score
    const bestScore = await Score.findOne({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'isGuest']
      }],
      order: [['score', 'DESC']]
    })

    if (!bestScore) {
      return res.status(404).json({
        success: false,
        message: 'No scores found'
      })
    }

    res.json({
      success: true,
      data: bestScore
    })
  } catch (error) {
    console.error('Error fetching best score:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching best score',
      error: error.message
    })
  }
}

// @desc    Get user's statistics
// @route   GET /api/scores/user/:userId/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params

    // Get total games played
    const totalGames = await Score.count({ where: { userId } })

    // Get total score
    const totalScore = await Score.sum('score', { where: { userId } })

    // Get games by category
    const gamesByCategory = await Score.findAll({
      where: { userId },
      attributes: [
        'category',
        [Score.sequelize.fn('COUNT', Score.sequelize.col('id')), 'count'],
        [Score.sequelize.fn('SUM', Score.sequelize.col('score')), 'totalScore'],
        [Score.sequelize.fn('AVG', Score.sequelize.col('score')), 'avgScore']
      ],
      group: ['category']
    })

    // Get games by difficulty
    const gamesByDifficulty = await Score.findAll({
      where: { userId },
      attributes: [
        'difficulty',
        [Score.sequelize.fn('COUNT', Score.sequelize.col('id')), 'count'],
        [Score.sequelize.fn('AVG', Score.sequelize.col('score')), 'avgScore']
      ],
      group: ['difficulty']
    })

    // Get recent activity (last 10 games)
    const recentGames = await Score.findAll({
      where: { userId },
      order: [['completedAt', 'DESC']],
      limit: 10,
      attributes: ['gameId', 'gameTitle', 'score', 'category', 'difficulty', 'completedAt']
    })

    res.json({
      success: true,
      data: {
        totalGames,
        totalScore: totalScore || 0,
        averageScore: totalGames > 0 ? Math.round(totalScore / totalGames) : 0,
        gamesByCategory,
        gamesByDifficulty,
        recentGames
      }
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    })
  }
}

// @desc    Delete a score
// @route   DELETE /api/scores/:id
// @access  Private (own scores only)
exports.deleteScore = async (req, res) => {
  try {
    const { id } = req.params

    // Find score
    const score = await Score.findByPk(id)

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score not found'
      })
    }

    // Check if user owns the score
    if (score.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this score'
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
}
