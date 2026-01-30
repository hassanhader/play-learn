/**
 * Script pour ajouter des questions de test au jeu 63
 * Usage: node add-questions-to-game63.js
 */

require('dotenv').config()
const { Game, Level, Question, sequelize } = require('./models')

async function addQuestionsToGame63() {
  try {
    console.log('🔍 Vérification du jeu 63...')
    
    // Vérifier que le jeu existe
    const game = await Game.findByPk(63)
    if (!game) {
      console.error('❌ Le jeu avec id=63 n\'existe pas!')
      return
    }
    
    console.log(`✅ Jeu trouvé: "${game.title}"`)
    
    // Vérifier s'il y a déjà des niveaux
    let level = await Level.findOne({ where: { gameId: 63 } })
    
    if (!level) {
      console.log('📝 Création d\'un niveau...')
      level = await Level.create({
        gameId: 63,
        title: 'Niveau 1',
        difficulty: 'easy',
        orderIndex: 1,
        description: 'Niveau de test pour le multijoueur'
      })
      console.log(`✅ Niveau créé avec ID: ${level.id}`)
    } else {
      console.log(`✅ Niveau existant trouvé avec ID: ${level.id}`)
    }
    
    // Vérifier s'il y a déjà des questions
    const existingQuestions = await Question.findAll({ where: { levelId: level.id } })
    
    if (existingQuestions.length > 0) {
      console.log(`⚠️ Il y a déjà ${existingQuestions.length} question(s) dans ce niveau`)
      console.log('Voulez-vous continuer et ajouter plus de questions? (Les existantes ne seront pas supprimées)')
    }
    
    // Questions de test
    const testQuestions = [
      {
        text: 'Quelle est la capitale de la France?',
        correctAnswer: 'Paris',
        wrongAnswers: ['Londres', 'Berlin', 'Madrid'],
        timeLimit: 30,
        points: 100
      },
      {
        text: 'Combien font 2 + 2?',
        correctAnswer: '4',
        wrongAnswers: ['3', '5', '6'],
        timeLimit: 30,
        points: 100
      },
      {
        text: 'Quel est le langage de programmation pour le web côté client?',
        correctAnswer: 'JavaScript',
        wrongAnswers: ['Python', 'Java', 'C++'],
        timeLimit: 30,
        points: 100
      },
      {
        text: 'Quelle est la couleur du ciel par beau temps?',
        correctAnswer: 'Bleu',
        wrongAnswers: ['Vert', 'Rouge', 'Jaune'],
        timeLimit: 30,
        points: 100
      },
      {
        text: 'Combien de jours dans une semaine?',
        correctAnswer: '7',
        wrongAnswers: ['5', '6', '8'],
        timeLimit: 30,
        points: 100
      },
      {
        text: 'Quel est le symbole chimique de l\'eau?',
        correctAnswer: 'H2O',
        wrongAnswers: ['CO2', 'O2', 'H2'],
        timeLimit: 30,
        points: 100
      },
      {
        text: 'Combien font 5 × 8?',
        correctAnswer: '40',
        wrongAnswers: ['35', '45', '48'],
        timeLimit: 30,
        points: 100
      },
      {
        text: 'Quel est le plus grand océan?',
        correctAnswer: 'Pacifique',
        wrongAnswers: ['Atlantique', 'Indien', 'Arctique'],
        timeLimit: 30,
        points: 100
      },
      {
        text: 'En quelle année a eu lieu le premier alunissage?',
        correctAnswer: '1969',
        wrongAnswers: ['1965', '1972', '1975'],
        timeLimit: 30,
        points: 100
      },
      {
        text: 'Quel est le plus petit nombre premier?',
        correctAnswer: '2',
        wrongAnswers: ['1', '3', '0'],
        timeLimit: 30,
        points: 100
      }
    ]
    
    console.log(`📝 Ajout de ${testQuestions.length} questions...`)
    
    for (const q of testQuestions) {
      await Question.create({
        levelId: level.id,
        text: q.text,
        correctAnswer: q.correctAnswer,
        wrongAnswers: JSON.stringify(q.wrongAnswers),
        timeLimit: q.timeLimit,
        points: q.points
      })
    }
    
    console.log(`✅ ${testQuestions.length} questions ajoutées avec succès!`)
    
    // Vérification finale
    const totalQuestions = await Question.count({ where: { levelId: level.id } })
    console.log(`\n📊 Total de questions dans le jeu "${game.title}": ${totalQuestions}`)
    
    console.log('\n🎮 Le jeu est maintenant prêt pour le multijoueur!')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await sequelize.close()
  }
}

// Exécuter le script
addQuestionsToGame63()
