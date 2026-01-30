const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Question = sequelize.define('Question', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    levelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'levels',
        key: 'id'
      },
      onDelete: 'CASCADE',
      comment: 'Référence vers le niveau parent'
    },
    type: {
      type: DataTypes.ENUM('multiple_choice', 'true_false', 'text_input', 'math_problem', 'memory_card', 'code_challenge'),
      allowNull: false,
      comment: 'Type de question/défi'
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Texte de la question ou instruction'
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Options pour questions à choix multiples (array de strings)'
    },
    correctAnswer: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Réponse correcte (peut être un index, texte, ou JSON selon le type)'
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Explication de la réponse (affichée après réponse)'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: 'Points accordés pour une bonne réponse'
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Temps limite pour cette question en secondes (null = pas de limite spécifique)'
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'normal', 'hard', 'expert'),
      allowNull: false,
      defaultValue: 'normal'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Sous-catégorie ou tag de la question'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Ordre d\'apparition dans le niveau'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Métadonnées additionnelles (images, code snippets, etc.)'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'La question est-elle active ?'
    },
    timesAnswered: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Nombre de fois que cette question a été répondue'
    },
    timesCorrect: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Nombre de bonnes réponses'
    },
    successRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Taux de réussite en pourcentage'
    }
  }, {
    tableName: 'questions',
    timestamps: true,
    indexes: [
      { fields: ['levelId'] },
      { fields: ['type'] },
      { fields: ['difficulty'] },
      { fields: ['order'] },
      { fields: ['isActive'] }
    ]
  })

  // Associations
  Question.associate = (models) => {
    // Une question appartient à un niveau
    Question.belongsTo(models.Level, {
      foreignKey: 'levelId',
      as: 'level'
    })
  }

  // Méthode pour mettre à jour le taux de réussite
  Question.prototype.updateSuccessRate = async function() {
    if (this.timesAnswered > 0) {
      this.successRate = (this.timesCorrect / this.timesAnswered) * 100
      await this.save()
    }
  }

  return Question
}
