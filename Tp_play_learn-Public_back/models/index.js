const { Sequelize } = require('sequelize')
const config = require('../config/database')

const env = process.env.NODE_ENV || 'development'
const dbConfig = config[env]

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions || {}
  }
)

// Import models
const User = require('./User')(sequelize)
const Score = require('./Score')(sequelize)
const Game = require('./Game')(sequelize)
const Level = require('./Level')(sequelize)
const Question = require('./Question')(sequelize)
const UserProgress = require('./UserProgress')(sequelize)
const MultiplayerRoom = require('./MultiplayerRoom')(sequelize)
const MultiplayerParticipant = require('./MultiplayerParticipant')(sequelize)
const MultiplayerGameState = require('./MultiplayerGameState')(sequelize)

// Store models in db object
const db = {
  sequelize,
  Sequelize,
  User,
  Score,
  Game,
  Level,
  Question,
  UserProgress,
  MultiplayerRoom,
  MultiplayerParticipant,
  MultiplayerGameState
}

// Define multiplayer associations
MultiplayerRoom.belongsTo(User, { as: 'host', foreignKey: 'hostUserId' })
MultiplayerRoom.belongsTo(Game, { as: 'game', foreignKey: 'gameId' })
MultiplayerRoom.hasMany(MultiplayerParticipant, { as: 'participants', foreignKey: 'roomId' })
MultiplayerRoom.hasOne(MultiplayerGameState, { as: 'gameState', foreignKey: 'roomId' })

MultiplayerParticipant.belongsTo(MultiplayerRoom, { as: 'room', foreignKey: 'roomId' })
MultiplayerParticipant.belongsTo(User, { as: 'user', foreignKey: 'userId' })

MultiplayerGameState.belongsTo(MultiplayerRoom, { as: 'room', foreignKey: 'roomId' })

// Define associations after all models are loaded
if (User.associate) User.associate(db)
if (Score.associate) Score.associate(db)
if (Game.associate) Game.associate(db)
if (Level.associate) Level.associate(db)
if (Question.associate) Question.associate(db)
if (UserProgress.associate) UserProgress.associate(db)
if (MultiplayerRoom.associate) MultiplayerRoom.associate(db)
if (MultiplayerParticipant.associate) MultiplayerParticipant.associate(db)
if (MultiplayerGameState.associate) MultiplayerGameState.associate(db)

module.exports = db
