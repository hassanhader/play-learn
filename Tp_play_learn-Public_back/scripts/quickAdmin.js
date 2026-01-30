/**
 * Script rapide pour promouvoir l'utilisateur ID 2 en administrateur
 * Exécutez: node scripts/quickAdmin.js
 */

const { User } = require('../models')

async function quickAdmin() {
  try {
    console.log('🔄 Promotion de l\'utilisateur ID 2 en administrateur...\n')
    
    const user = await User.findByPk(2)
    
    if (!user) {
      console.log('❌ Utilisateur ID 2 non trouvé')
      console.log('💡 Exécutez: node scripts/makeAdmin.js pour choisir un autre utilisateur')
      process.exit(1)
    }

    console.log(`📧 Utilisateur trouvé: ${user.username} (${user.email})`)
    
    if (user.isAdmin) {
      console.log('⚠️  Cet utilisateur est déjà administrateur')
    } else {
      await user.update({ isAdmin: true })
      console.log('\n✅ Promotion réussie!')
      console.log(`🎉 ${user.username} est maintenant administrateur!`)
      console.log('\n📝 Prochaines étapes:')
      console.log('   1. Connectez-vous avec cet utilisateur')
      console.log('   2. Cliquez sur le bouton "🔧 Admin" dans le header')
      console.log('   3. Accédez au tableau de bord admin')
    }

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    process.exit(1)
  }
}

quickAdmin()
