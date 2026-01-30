/**
 * Script de migration des données en dur vers la base de données
 * Ce script convertit les jeux définis dans gameConfig.js en entrées de base de données
 * 
 * Usage: node scripts/migrateGames.js
 */

require('dotenv').config()
const { Game, Level, Question, sequelize } = require('../models')

// Données des jeux (copié depuis frontend gameConfig.js)
const GAME_TYPES = {
  QUIZ: 'quiz',
  MEMORY: 'memory',
  PUZZLE: 'puzzle',
  CODING: 'coding',
  MATH: 'math'
}

const AVAILABLE_GAMES = [
  {
    id: 'math-quiz-1',
    title: 'Math Quiz Challenge',
    type: GAME_TYPES.QUIZ,
    category: 'Mathematics',
    difficulty: 'medium',
    description: 'Test your mathematical skills with various questions',
    icon: '➕',
    timeLimit: 180,
    totalQuestions: 5
  },
  {
    id: 'cs-quiz-1',
    title: 'Programming Basics',
    type: GAME_TYPES.QUIZ,
    category: 'Computer Science',
    difficulty: 'easy',
    description: 'Learn the fundamentals of programming',
    icon: '💻',
    timeLimit: 300,
    totalQuestions: 8
  },
  {
    id: 'memory-math-1',
    title: 'Math Memory Game',
    type: GAME_TYPES.MEMORY,
    category: 'Mathematics',
    difficulty: 'easy',
    description: 'Match mathematical symbols with their pairs',
    icon: '🧮',
    timeLimit: 120,
    totalQuestions: 16
  },
  {
    id: 'speed-math-1',
    title: 'Speed Math Challenge',
    type: GAME_TYPES.MATH,
    category: 'Mathematics',
    difficulty: 'medium',
    description: 'Solve math problems as fast as you can!',
    icon: '⚡',
    timeLimit: 180,
    totalQuestions: 15
  },
  {
    id: 'speed-math-easy',
    title: 'Math Basics',
    type: GAME_TYPES.MATH,
    category: 'Mathematics',
    difficulty: 'easy',
    description: 'Simple calculations for beginners',
    icon: '🔢',
    timeLimit: 120,
    totalQuestions: 10
  },
  {
    id: 'speed-math-hard',
    title: 'Math Expert',
    type: GAME_TYPES.MATH,
    category: 'Mathematics',
    difficulty: 'hard',
    description: 'Advanced mathematical operations',
    icon: '🎯',
    timeLimit: 240,
    totalQuestions: 20
  },
  {
    id: 'physics-quiz-1',
    title: 'Physics Fundamentals',
    type: GAME_TYPES.QUIZ,
    category: 'Physics',
    difficulty: 'medium',
    description: 'Test your knowledge of physics concepts',
    icon: '⚛️',
    timeLimit: 240,
    totalQuestions: 10
  },
  {
    id: 'geography-quiz-1',
    title: 'World Capitals',
    type: GAME_TYPES.QUIZ,
    category: 'Geography',
    difficulty: 'easy',
    description: 'Identify capitals of countries around the world',
    icon: '🌍',
    timeLimit: 180,
    totalQuestions: 12
  },
  {
    id: 'memory-flags-1',
    title: 'Flag Memory',
    type: GAME_TYPES.MEMORY,
    category: 'Geography',
    difficulty: 'medium',
    description: 'Match country flags in this memory game',
    icon: '🚩',
    timeLimit: 150,
    totalQuestions: 12
  },
  {
    id: 'cs-advanced-1',
    title: 'Advanced Programming',
    type: GAME_TYPES.QUIZ,
    category: 'Computer Science',
    difficulty: 'hard',
    description: 'Deep dive into complex programming concepts',
    icon: '🚀',
    timeLimit: 360,
    totalQuestions: 12
  }
]

// Questions exemples pour les quiz
const QUIZ_QUESTIONS = {
  'math-quiz-1': [
    {
      type: 'multiple_choice',
      questionText: 'Combien font 5 + 7 ?',
      options: ['10', '11', '12', '13'],
      correctAnswer: '2',
      points: 10,
      difficulty: 'easy',
      order: 1
    },
    {
      type: 'multiple_choice',
      questionText: 'Quelle est la valeur de π (pi) arrondie à 2 décimales ?',
      options: ['3.12', '3.14', '3.16', '3.18'],
      correctAnswer: '1',
      points: 10,
      difficulty: 'normal',
      order: 2
    },
    {
      type: 'multiple_choice',
      questionText: 'Combien font 8 × 7 ?',
      options: ['54', '56', '58', '60'],
      correctAnswer: '1',
      points: 10,
      difficulty: 'normal',
      order: 3
    },
    {
      type: 'multiple_choice',
      questionText: 'Quelle est la racine carrée de 64 ?',
      options: ['6', '7', '8', '9'],
      correctAnswer: '2',
      points: 15,
      difficulty: 'normal',
      order: 4
    },
    {
      type: 'multiple_choice',
      questionText: 'Combien font 15% de 200 ?',
      options: ['25', '30', '35', '40'],
      correctAnswer: '1',
      points: 15,
      difficulty: 'hard',
      order: 5
    }
  ],
  'cs-quiz-1': [
    {
      type: 'multiple_choice',
      questionText: 'Quelle est la complexité temporelle d\'une recherche binaire ?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: '1',
      points: 10,
      difficulty: 'normal',
      order: 1
    },
    {
      type: 'multiple_choice',
      questionText: 'En Python, quelle structure de données est mutable ?',
      options: ['tuple', 'string', 'list', 'int'],
      correctAnswer: '2',
      points: 10,
      difficulty: 'easy',
      order: 2
    },
    {
      type: 'multiple_choice',
      questionText: 'Quel est le résultat de 2 ** 3 en Python ?',
      options: ['6', '8', '9', '5'],
      correctAnswer: '1',
      points: 10,
      difficulty: 'easy',
      order: 3
    },
    {
      type: 'multiple_choice',
      questionText: 'Quelle méthode HTTP est utilisée pour créer une ressource ?',
      options: ['GET', 'PUT', 'POST', 'DELETE'],
      correctAnswer: '2',
      points: 10,
      difficulty: 'normal',
      order: 4
    }
  ],
  'physics-quiz-1': [
    {
      type: 'multiple_choice',
      questionText: 'Quelle est la vitesse de la lumière dans le vide ?',
      options: ['300 000 km/s', '150 000 km/s', '450 000 km/s', '600 000 km/s'],
      correctAnswer: '0',
      points: 10,
      difficulty: 'normal',
      order: 1
    },
    {
      type: 'multiple_choice',
      questionText: 'Quelle est l\'unité de mesure de la force ?',
      options: ['Joule', 'Newton', 'Watt', 'Pascal'],
      correctAnswer: '1',
      points: 10,
      difficulty: 'easy',
      order: 2
    }
  ]
}

// Fonction principale de migration
const migrateGames = async (closeConnection = true) => {
  try {
    console.log('🚀 Starting game migration...')
    
    // Test de connexion seulement si on a besoin de se connecter
    if (closeConnection) {
      await sequelize.authenticate()
      console.log('✅ Database connection established')

      // Synchroniser les modèles (créer les tables)
      await sequelize.sync({ force: false })
      console.log('✅ Database models synchronized')
    }

    let gamesCreated = 0
    let levelsCreated = 0
    let questionsCreated = 0

    // Parcourir chaque jeu
    for (const gameData of AVAILABLE_GAMES) {
      console.log(`\n📦 Processing game: ${gameData.title}`)

      // Créer ou mettre à jour le jeu
      const [game, created] = await Game.findOrCreate({
        where: { gameId: gameData.id },
        defaults: {
          gameId: gameData.id,
          title: gameData.title,
          type: gameData.type,
          category: gameData.category,
          difficulty: gameData.difficulty,
          description: gameData.description,
          icon: gameData.icon,
          timeLimit: gameData.timeLimit,
          isEnabled: true,
          isMultiplayer: false
        }
      })

      if (created) {
        gamesCreated++
        console.log(`  ✅ Game created: ${game.title}`)
      } else {
        console.log(`  ℹ️  Game already exists: ${game.title}`)
      }

      // Créer un niveau par défaut pour chaque jeu
      const [level, levelCreated] = await Level.findOrCreate({
        where: { 
          gameId: game.id,
          levelNumber: 1
        },
        defaults: {
          gameId: game.id,
          levelNumber: 1,
          name: `Niveau 1: ${gameData.difficulty}`,
          description: `Premier niveau du jeu ${game.title}`,
          difficulty: gameData.difficulty,
          timeLimit: gameData.timeLimit,
          pointsToPass: Math.floor(gameData.totalQuestions * 5), // 50% pour passer
          maxScore: gameData.totalQuestions * 10,
          isLocked: false,
          order: 1,
          settings: {
            totalQuestions: gameData.totalQuestions
          }
        }
      })

      if (levelCreated) {
        levelsCreated++
        console.log(`    ✅ Level created: ${level.name}`)
      } else {
        console.log(`    ℹ️  Level already exists: ${level.name}`)
      }

      // Ajouter des questions si disponibles
      if (QUIZ_QUESTIONS[gameData.id]) {
        for (const questionData of QUIZ_QUESTIONS[gameData.id]) {
          const [question, questionCreated] = await Question.findOrCreate({
            where: {
              levelId: level.id,
              order: questionData.order
            },
            defaults: {
              levelId: level.id,
              type: questionData.type,
              questionText: questionData.questionText,
              options: questionData.options,
              correctAnswer: questionData.correctAnswer,
              points: questionData.points,
              difficulty: questionData.difficulty,
              order: questionData.order,
              isActive: true
            }
          })

          if (questionCreated) {
            questionsCreated++
            console.log(`      ✅ Question ${questionData.order} created`)
          }
        }
      }

      // Pour les jeux MATH et MEMORY, les questions sont générées dynamiquement
      // Pas besoin de les créer en base de données
      if (gameData.type === GAME_TYPES.MATH || gameData.type === GAME_TYPES.MEMORY) {
        console.log(`    ℹ️  Questions generated dynamically for ${gameData.type} game`)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('✅ Migration completed successfully!')
    console.log('='.repeat(50))
    console.log(`📊 Statistics:`)
    console.log(`   - Games created: ${gamesCreated}`)
    console.log(`   - Levels created: ${levelsCreated}`)
    console.log(`   - Questions created: ${questionsCreated}`)
    console.log('='.repeat(50))

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    // Fermer la connexion seulement si demandé (pas quand appelé depuis server.js)
    if (closeConnection) {
      await sequelize.close()
      console.log('🔌 Database connection closed')
    }
  }
}

// Exécuter la migration
if (require.main === module) {
  migrateGames()
    .then(() => {
      console.log('✅ Migration script finished successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateGames }
