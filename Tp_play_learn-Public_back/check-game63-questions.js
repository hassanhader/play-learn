/**
 * Script pour vérifier si les questions ont bien été ajoutées au jeu 63
 * Usage: node check-game63-questions.js
 */

require('dotenv').config()
const { Game, Level, Question, sequelize } = require('./models')

async function checkGame63() {
  try {
    console.log('🔍 Vérification du jeu 63...\n')
    
    // 1. Vérifier le jeu
    const game = await Game.findByPk(63)
    if (!game) {
      console.error('❌ Le jeu avec id=63 n\'existe pas!')
      return
    }
    console.log(`✅ Jeu trouvé: "${game.title}" (ID: ${game.id})`)
    
    // 2. Vérifier les niveaux
    const levels = await Level.findAll({ where: { gameId: 63 } })
    console.log(`\n📊 Niveaux trouvés: ${levels.length}`)
    
    if (levels.length === 0) {
      console.error('❌ Aucun niveau trouvé pour ce jeu!')
      return
    }
    
    // 3. Pour chaque niveau, compter les questions
    let totalQuestions = 0
    for (const level of levels) {
      const questions = await Question.findAll({ where: { levelId: level.id } })
      console.log(`   - Niveau "${level.title}" (ID: ${level.id}): ${questions.length} questions`)
      totalQuestions += questions.length
      
      // Afficher quelques questions
      if (questions.length > 0) {
        questions.slice(0, 3).forEach((q, idx) => {
          console.log(`      ${idx + 1}. ${q.text.substring(0, 50)}...`)
        })
      }
    }
    
    console.log(`\n✅ Total: ${totalQuestions} questions pour le jeu "${game.title}"`)
    
    // 4. Test avec include (comme dans gameSocketHandlers.js)
    console.log('\n🧪 Test avec include (simulation backend)...')
    const gameWithLevels = await Game.findByPk(63, {
      include: [
        {
          model: Level,
          as: 'levels',
          include: [
            {
              model: Question,
              as: 'questions'
            }
          ]
        }
      ]
    })
    
    if (gameWithLevels && gameWithLevels.levels) {
      console.log(`   Niveaux chargés: ${gameWithLevels.levels.length}`)
      
      let allQuestions = []
      gameWithLevels.levels.forEach(level => {
        if (level.questions && level.questions.length > 0) {
          console.log(`   - ${level.title}: ${level.questions.length} questions`)
          allQuestions = allQuestions.concat(level.questions)
        }
      })
      
      console.log(`   ✅ Total questions via include: ${allQuestions.length}`)
      
      if (allQuestions.length > 0) {
        console.log('\n✅ Les questions sont accessibles via include!')
        console.log('   Le backend devrait pouvoir les charger.')
      } else {
        console.log('\n❌ Problème: Les questions ne sont pas accessibles via include')
      }
    } else {
      console.log('   ❌ Échec du chargement avec include')
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await sequelize.close()
  }
}

checkGame63()
