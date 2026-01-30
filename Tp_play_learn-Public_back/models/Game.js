const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Game = sequelize.define('Game', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    gameId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Identifiant unique du jeu (ex: math-quiz-1, speed-math-easy)'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Titre du jeu affiché à l\'utilisateur'
    },
    type: {
      type: DataTypes.ENUM('quiz', 'memory', 'puzzle', 'coding', 'math'),
      allowNull: false,
      comment: 'Type de jeu détermine quel template utiliser'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Catégorie du jeu (Mathematics, Physics, Computer Science, etc.)'
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard', 'expert'),
      allowNull: false,
      defaultValue: 'medium',
      comment: 'Niveau de difficulté général du jeu'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description détaillée du jeu'
    },
    icon: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: '🎮',
      comment: 'Emoji ou icône pour représenter le jeu'
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 180,
      comment: 'Temps limite par défaut en secondes (configurable par niveau)'
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Le jeu est-il actuellement disponible ?'
    },
    isMultiplayer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Le jeu supporte-t-il le mode multijoueur ?'
    },
    minPlayers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Paramètres additionnels du jeu (règles spécifiques, options, etc.)'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      comment: 'ID de l\'utilisateur qui a créé le jeu (null pour jeux système)'
    },
    playCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Nombre de fois que le jeu a été joué'
    },
    averageScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Score moyen des joueurs'
    }
  }, {
    tableName: 'games',
    timestamps: true,
    indexes: [
      { fields: ['gameId'] },
      { fields: ['type'] },
      { fields: ['category'] },
      { fields: ['difficulty'] },
      { fields: ['isEnabled'] }
    ]
  })

  // Associations seront définies dans models/index.js
  Game.associate = (models) => {
    // Un jeu a plusieurs niveaux
    Game.hasMany(models.Level, {
      foreignKey: 'gameId',
      as: 'levels',
      onDelete: 'CASCADE'
    })

    // Un jeu peut avoir été créé par un utilisateur
    Game.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    })

    // Un jeu a plusieurs scores
    Game.hasMany(models.Score, {
      foreignKey: 'gameId',
      sourceKey: 'gameId',
      as: 'scores'
    })
  }

  return Game
}
