const { body, validationResult } = require('express-validator')

// Common validation rules
exports.validateEmail = body('email')
  .trim()
  .isEmail()
  .withMessage('Please provide a valid email')
  .normalizeEmail()

exports.validatePassword = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters')

exports.validateUsername = body('username')
  .trim()
  .isLength({ min: 3, max: 50 })
  .withMessage('Username must be between 3 and 50 characters')
  .matches(/^[a-zA-Z0-9_-]+$/)
  .withMessage('Username can only contain letters, numbers, underscores and hyphens')

// Middleware to handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    })
  }
  next()
}
