const express = require('express')
const { body } = require('express-validator')
const {
  register,
  login,
  getMe,
  guestLogin
} = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
]

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

// Routes
router.post('/register', registerValidation, register)
router.post('/login', loginValidation, login)
router.post('/guest', guestLogin)
router.get('/me', protect, getMe)

module.exports = router
