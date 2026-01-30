const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const UserProgress = sequelize.define('UserProgress', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Référence vers l\'utilisateur'
    },
    levelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'levels',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Référence vers le niveau'
    },
    status: {
      type: DataTypes.ENUM('locked', 'unlocked', 'in_progress', 'completed', 'mastered'),
      allowNull: false,
      defaultValue: 'locked',
      comment: 'État de progression du niveau pour cet utilisateur'
    },
    bestScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Meilleur score obtenu sur ce niveau'
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Nombre de tentatives sur ce niveau'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date de première complétion du niveau'
    },
    lastPlayedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date de dernière tentative'
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Temps total passé sur ce niveau en secondes'
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 3
      },
      comment: 'Nombre d\'étoiles obtenues (0-3)'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Métadonnées additionnelles (statistiques détaillées, achievements, etc.)'
    }
  }, {
    tableName: 'user_progress',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['levelId'] },
      { fields: ['status'] },
      { fields: ['userId', 'levelId'], unique: true }
    ]
  })

  // Associations
  UserProgress.associate = (models) => {
    // Une progression appartient à un utilisateur
    UserProgress.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    })

    // Une progression appartient à un niveau
    UserProgress.belongsTo(models.Level, {
      foreignKey: 'levelId',
      as: 'level'
    })
  }

  // Méthode pour calculer les étoiles en fonction du score
  UserProgress.prototype.calculateStars = function(score, maxScore) {
    if (!maxScore || score <= 0) return 0
    
    const percentage = (score / maxScore) * 100
    
    if (percentage >= 90) return 3      // 90%+ = 3 étoiles
    if (percentage >= 70) return 2      // 70-89% = 2 étoiles
    if (percentage >= 50) return 1      // 50-69% = 1 étoile
    return 0                            // <50% = 0 étoile
  }

  // Méthode pour mettre à jour la progression après une partie
  UserProgress.prototype.updateAfterGame = async function(score, maxScore, timeSpent) {
    this.attempts += 1
    this.lastPlayedAt = new Date()
    this.timeSpent += timeSpent

    // Mettre à jour le meilleur score
    if (score > this.bestScore) {
      this.bestScore = score
      this.stars = this.calculateStars(score, maxScore)
    }

    // Mettre à jour le statut
    if (this.status === 'locked' || this.status === 'unlocked') {
      this.status = 'in_progress'
    }

    // Si score suffisant, marquer comme complété
    const percentage = maxScore ? (score / maxScore) * 100 : 0
    if (percentage >= 50 && this.status !== 'completed' && this.status !== 'mastered') {
      this.status = 'completed'
      this.completedAt = new Date()
    }

    // Si excellent score, marquer comme maîtrisé
    if (percentage >= 90) {
      this.status = 'mastered'
    }

    await this.save()
    return this
  }

  return UserProgress
}
