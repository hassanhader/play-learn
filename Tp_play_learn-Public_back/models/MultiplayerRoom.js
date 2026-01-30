const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const MultiplayerRoom = sequelize.define('MultiplayerRoom', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roomCode: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true,
    validate: {
      len: [6, 8]
    }
  },
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'games',
      key: 'id'
    }
  },
  hostUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
    validate: {
      min: 2,
      max: 8
    }
  },
  currentPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM('waiting', 'playing', 'finished'),
    allowNull: false,
    defaultValue: 'waiting'
  },
  gameMode: {
    type: DataTypes.ENUM('quiz', 'speed', 'puzzle', 'memory', 'coding'),
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'MultiplayerRooms',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['roomCode']
    },
    {
      fields: ['status']
    },
    {
      fields: ['gameId']
    }
  ]
})

  return MultiplayerRoom
}
