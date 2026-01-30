const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const MultiplayerGameState = sequelize.define('MultiplayerGameState', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'MultiplayerRooms',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  currentQuestionIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  buzzedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  responses: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  scores: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  gameData: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  completionData: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'MultiplayerGameStates',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['roomId']
    }
  ]
})

  return MultiplayerGameState
}
