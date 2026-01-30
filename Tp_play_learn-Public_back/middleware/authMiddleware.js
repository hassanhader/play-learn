const jwt = require('jsonwebtoken')
const { User } = require('../models')

exports.protect = async (req, res, next) => {
  try {
    let token

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from token
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Alias pour compatibilité
exports.authenticate = exports.protect
