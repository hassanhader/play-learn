const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Score = sequelize.define('Score', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',  // Changed from 'Users' to 'users' for MySQL case sensitivity
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    gameId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Identifiant du jeu (ex: quiz-history, memory-animals, speed-math)'
    },
    gameTitle: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Titre du jeu pour affichage'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Score maximum possible pour ce jeu (optionnel)'
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
      defaultValue: 'medium'
    },
    mode: {
      type: DataTypes.ENUM('single', 'multiplayer'),
      allowNull: false,
      defaultValue: 'single'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Catégorie du jeu (Quiz, Memory, Math, Physics, etc.)'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Durée de la partie en secondes'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Données supplémentaires (temps, précision, combos, etc.)'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'scores',
    timestamps: true, // Ajoute createdAt et updatedAt
    indexes: [
      {
        name: 'idx_user_id',
        fields: ['userId']
      },
      {
        name: 'idx_game_id',
        fields: ['gameId']
      },
      {
        name: 'idx_category',
        fields: ['category']
      },
      {
        name: 'idx_score',
        fields: ['score']
      },
      {
        name: 'idx_completed_at',
        fields: ['completedAt']
      }
    ]
  })

  // Associations
  Score.associate = (models) => {
    Score.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    })
    
    // Association optionnelle avec Game (si gameId correspond à un jeu en BD)
    // Note: gameId est une STRING, pas une clé étrangère directe
  }

  return Score
}
