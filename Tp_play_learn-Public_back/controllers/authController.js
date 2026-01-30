const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { validationResult } = require('express-validator')

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { username, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ email }, { username }]
      }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      })
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      isGuest: false
    })

    // Generate token
    const token = generateToken(user.id)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        isAdmin: user.isAdmin || false
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Update last login
    await user.update({ lastLogin: new Date() })

    // Generate token
    const token = generateToken(user.id)

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        isAdmin: user.isAdmin || false
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// @desc    Guest login
// @route   POST /api/auth/guest
// @access  Public
exports.guestLogin = async (req, res) => {
  try {
    const guestUsername = `Guest_${Date.now()}`
    const guestEmail = `${guestUsername}@guest.local`

    // Create guest user
    const user = await User.create({
      username: guestUsername,
      email: guestEmail,
      password: Math.random().toString(36).substring(7), // Random password for guest
      isGuest: true
    })

    // Generate token
    const token = generateToken(user.id)

    res.status(201).json({
      success: true,
      message: 'Guest session created',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        isAdmin: user.isAdmin || false
      }
    })
  } catch (error) {
    console.error('Guest login error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating guest session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}


