const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const MultiplayerParticipant = sequelize.define('MultiplayerParticipant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'MultiplayerRooms',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isReady: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isConnected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  finalScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'MultiplayerParticipants',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['roomId', 'userId']
    },
    {
      fields: ['userId']
    }
  ]
})

  return MultiplayerParticipant
}
