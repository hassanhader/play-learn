require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const db = require('./models')
const { sequelize } = db

// Import routes
const authRoutes = require('./routes/authRoutes')
const scoresRoutes = require('./routes/scoresRoutes')
const gamesRoutes = require('./routes/gamesRoutes')
const levelsRoutes = require('./routes/levelsRoutes')
const progressRoutes = require('./routes/progressRoutes')
const adminRoutes = require('./routes/adminRoutes')
const multiplayerRoutes = require('./routes/multiplayerRoutes')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// CORS Configuration - Flexible origin handling
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5175',
  'https://tpplaylearn-publicfront-production.up.railway.app', // Vite preview
  // Add production URLs here when deploying
  // 'https://your-production-domain.com'
]

// If CORS_ORIGIN is set in .env, parse it (comma-separated list)
if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  allowedOrigins.push(...envOrigins)
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins if CORS_ORIGIN is set to '*' (⚠️ DEVELOPMENT ONLY!)
    if (process.env.CORS_ORIGIN === '*') {
      return callback(null, true)
    }
    
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true)
    
    // Check if origin is in allowedOrigins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.warn("CORS blocked origin: ")
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions
})

// Setup Socket.io handlers
const setupSocketHandlers = require('./utils/socketHandlers')
setupSocketHandlers(io)

// Store io instance for use in routes/controllers
app.set('io', io)

// Middleware
app.use(helmet()) // Security headers
app.use(cors(corsOptions))
app.use(morgan('dev')) // HTTP request logger
app.use(express.json()) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Play&Learn API',
    status: 'Server is running',
    version: '1.0.0'
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/scores', scoresRoutes)
app.use('/api/games', gamesRoutes)
app.use('/api/levels', levelsRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/multiplayer', multiplayerRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Database connection and server start
const runMigrationIfNeeded = async () => {
  // Vérifier si la migration doit être exécutée
  if (process.env.RUN_MIGRATION === 'true') {
    console.log('🔄 Running database migration...')
    console.log('⚠️  This will populate the database with games, levels, and questions')
    
    try {
      const { migrateGames } = require('./scripts/migrateGames')
      
      // Exécuter la migration (ne pas fermer la connexion sequelize)
      await migrateGames(false) // false = ne pas fermer la connexion
      
      console.log('✅ Migration completed successfully!')
      console.log('⚠️  IMPORTANT: Remove RUN_MIGRATION variable from Railway to prevent re-running')
      console.log('')
      
      return true
    } catch (error) {
      console.error('❌ Migration failed:', error.message)
      console.error('   Stack:', error.stack)
      console.log('⚠️  Server will continue to start despite migration failure')
      console.log('')
      // Ne pas arrêter le serveur, continuer quand même
      return false
    }
  }
  return false
}

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate()
    console.log('✅ Database connection established successfully')
    
    // Run multiplayer migration check
    const { runMultiplayerMigration } = require('./scripts/check-multiplayer-migration')
    await runMultiplayerMigration()
    
    // Sync models (create tables if they don't exist)
    // Use 'alter: true' in production to update existing tables without dropping data
    const syncOptions = process.env.NODE_ENV === 'production' 
      ? { alter: true } // Met à jour les colonnes existantes sans supprimer les données
      : { force: process.env.FORCE_SYNC === 'true' }
    
    // Sync models - Different strategies for production vs development
    console.log('🔄 Synchronizing database models...')
    
    if (process.env.NODE_ENV === 'production') {
      // PRODUCTION: Manually sync tables in dependency order with delays
      console.log('⚠️  Production mode: Syncing tables in order to avoid FK errors')
      
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
      
      // 1. Base tables (no dependencies)
      console.log('  🔄 Syncing Users...')
      await db.User.sync()
      await wait(2000) // Wait 2 seconds for MySQL to commit
      console.log('  ✅ Users table ready')
      
      console.log('  🔄 Syncing Games...')
      await db.Game.sync()
      await wait(2000) // Wait 2 seconds for MySQL to commit
      console.log('  ✅ Games table ready')
      
      // 2. Dependent tables
      console.log('  🔄 Syncing dependent tables...')
      await db.Score.sync()
      await db.Level.sync()
      await db.Question.sync()
      await db.UserProgress.sync()
      await wait(1000)
      console.log('  ✅ Dependent tables ready')
      
      // 3. Multiplayer tables (depend on Users and Games)
      console.log('  🔄 Syncing MultiplayerRooms...')
      await db.MultiplayerRoom.sync()
      await wait(2000) // Wait 2 seconds - CRITICAL for FK references
      console.log('  ✅ MultiplayerRooms table ready')
      
      console.log('  🔄 Syncing MultiplayerParticipants...')
      await db.MultiplayerParticipant.sync()
      await wait(1000)
      console.log('  ✅ MultiplayerParticipants table ready')
      
      console.log('  🔄 Syncing MultiplayerGameStates...')
      await db.MultiplayerGameState.sync()
      console.log('  ✅ MultiplayerGameStates table ready')
      
      console.log('✅ Production tables synchronized')
    } else { 
      // Development mode - force sync if requested
      await sequelize.sync(syncOptions)
    }
    
    console.log('✅ Database models synchronized')

    // Run migration if RUN_MIGRATION is set
    await runMigrationIfNeeded()
    // Start server - Listen on 0.0.0.0 for Railway/Docker compatibility
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`)
      console.log(`📍 Environment: ${process.env.NODE_ENV}`)
      console.log(`🌐 API URL: http://localhost:${PORT}`)
      console.log(`🔓 Listening on 0.0.0.0:${PORT} (accessible externally)`)
      console.log(`🎮 WebSocket/Socket.io server ready`)
    })
  } catch (error) {
    console.error('❌ Unable to start server:', error)
    process.exit(1)
  }
}

startServer()

module.exports = app
