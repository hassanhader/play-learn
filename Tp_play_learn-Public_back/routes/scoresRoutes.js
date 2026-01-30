const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const {
  saveScore,
  getUserScores,
  getGameScores,
  getUserBestScore,
  getUserStats,
  deleteScore
} = require('../controllers/scoresController')
const { protect } = require('../middleware/authMiddleware')

// Validation rules
const scoreValidation = [
  body('gameId')
    .notEmpty().withMessage('Game ID is required')
    .isString().withMessage('Game ID must be a string'),
  body('gameTitle')
    .notEmpty().withMessage('Game title is required')
    .isString().withMessage('Game title must be a string'),
  body('score')
    .notEmpty().withMessage('Score is required')
    .isInt({ min: 0 }).withMessage('Score must be a positive integer'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'normal', 'medium', 'hard']).withMessage('Invalid difficulty'),
  body('mode')
    .optional()
    .isIn(['single', 'multiplayer']).withMessage('Invalid mode'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isString().withMessage('Category must be a string')
]

// @route   POST /api/scores
// @desc    Save a new score
// @access  Private
router.post('/', protect, scoreValidation, saveScore)

// @route   GET /api/scores/user/:userId
// @desc    Get user's score history
// @access  Private
router.get('/user/:userId', protect, getUserScores)

// @route   GET /api/scores/user/:userId/stats
// @desc    Get user's statistics
// @access  Private
router.get('/user/:userId/stats', protect, getUserStats)

// @route   GET /api/scores/user/:userId/game/:gameId/best
// @desc    Get user's best score for a specific game
// @access  Private
router.get('/user/:userId/game/:gameId/best', protect, getUserBestScore)

// @route   GET /api/scores/game/:gameId
// @desc    Get scores for a specific game (leaderboard)
// @access  Public
router.get('/game/:gameId', getGameScores)

// @route   DELETE /api/scores/:id
// @desc    Delete a score
// @access  Private (own scores only)
router.delete('/:id', protect, deleteScore)

module.exports = router
