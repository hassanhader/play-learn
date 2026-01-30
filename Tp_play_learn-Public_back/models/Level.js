const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Level = sequelize.define('Level', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Référence vers le jeu parent'
    },
    levelNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Numéro du niveau (1, 2, 3, etc.)'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nom du niveau (ex: "Niveau 1: Les bases")'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description du niveau et objectifs'
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard', 'expert'),
      allowNull: false,
      comment: 'Difficulté spécifique de ce niveau'
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Temps limite en secondes (null = utilise timeLimit du jeu)'
    },
    pointsToPass: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Score minimum requis pour passer le niveau'
    },
    maxScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Score maximum possible pour ce niveau'
    },
    requiredLevel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'levels',
        key: 'id'
      },
      onDelete: 'SET NULL',
      comment: 'ID du niveau qui doit être complété avant de débloquer celui-ci'
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Le niveau est-il verrouillé par défaut ?'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Ordre d\'affichage du niveau'
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Paramètres spécifiques du niveau (ex: nombre de questions, règles)'
    }
  }, {
    tableName: 'levels',
    timestamps: true,
    indexes: [
      { fields: ['gameId'] },
      { fields: ['levelNumber'] },
      { fields: ['difficulty'] },
      { fields: ['order'] },
      { fields: ['gameId', 'levelNumber'], unique: true }
    ]
  })

  // Associations
  Level.associate = (models) => {
    // Un niveau appartient à un jeu
    Level.belongsTo(models.Game, {
      foreignKey: 'gameId',
      as: 'game'
    })

    // Un niveau a plusieurs questions
    Level.hasMany(models.Question, {
      foreignKey: 'levelId',
      as: 'questions',
      onDelete: 'CASCADE'
    })

    // Un niveau peut avoir un niveau pré-requis
    Level.belongsTo(models.Level, {
      foreignKey: 'requiredLevel',
      as: 'prerequisite'
    })

    // Un niveau peut être pré-requis pour d'autres niveaux
    Level.hasMany(models.Level, {
      foreignKey: 'requiredLevel',
      as: 'unlocksLevels'
    })

    // Un niveau a des progressions utilisateur
    Level.hasMany(models.UserProgress, {
      foreignKey: 'levelId',
      as: 'userProgresses'
    })
  }

  return Level
}
