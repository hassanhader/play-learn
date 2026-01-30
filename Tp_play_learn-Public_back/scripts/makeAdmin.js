/**
 * Script pour promouvoir un utilisateur en administrateur
 * Exécutez ce script avec: node scripts/makeAdmin.js
 */

const { sequelize, User } = require('../models')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function makeAdmin() {
  try {
    console.log('👑 Script de promotion d\'administrateur\n')
    
    await sequelize.authenticate()
    console.log('✅ Connexion à la base de données établie\n')

    // Afficher tous les utilisateurs
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'isAdmin', 'createdAt'],
      order: [['id', 'ASC']]
    })

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données')
      rl.close()
      process.exit(1)
    }

    console.log('📋 Utilisateurs disponibles:\n')
    console.log('ID  | Username              | Email                          | Admin | Date de création')
    console.log('----|-----------------------|--------------------------------|-------|------------------')
    
    users.forEach(user => {
      const isAdminStatus = user.isAdmin ? '✅ Oui' : '❌ Non'
      const date = new Date(user.createdAt).toLocaleDateString('fr-FR')
      console.log(
        `${String(user.id).padEnd(3)} | ${String(user.username).padEnd(21)} | ${String(user.email).padEnd(30)} | ${isAdminStatus} | ${date}`
      )
    })

    console.log('\n')
    const userId = await question('Entrez l\'ID de l\'utilisateur à promouvoir admin (ou "exit" pour quitter): ')

    if (userId.toLowerCase() === 'exit') {
      console.log('👋 Annulé')
      rl.close()
      process.exit(0)
    }

    const id = parseInt(userId)
    if (isNaN(id)) {
      console.log('❌ ID invalide')
      rl.close()
      process.exit(1)
    }

    const user = await User.findByPk(id)
    
    if (!user) {
      console.log(`❌ Aucun utilisateur trouvé avec l'ID ${id}`)
      rl.close()
      process.exit(1)
    }

    if (user.isAdmin) {
      const confirm = await question(`⚠️  ${user.username} est déjà administrateur. Voulez-vous retirer ses droits admin? (oui/non): `)
      
      if (confirm.toLowerCase() === 'oui' || confirm.toLowerCase() === 'o') {
        await user.update({ isAdmin: false })
        console.log(`\n✅ ${user.username} n'est plus administrateur`)
      } else {
        console.log('\n👋 Opération annulée')
      }
    } else {
      const confirm = await question(`\n❓ Confirmer la promotion de "${user.username}" (${user.email}) en administrateur? (oui/non): `)
      
      if (confirm.toLowerCase() === 'oui' || confirm.toLowerCase() === 'o') {
        await user.update({ isAdmin: true })
        console.log(`\n✅ ${user.username} est maintenant administrateur!`)
        console.log('\n📝 L\'utilisateur peut maintenant:')
        console.log('   - Accéder au tableau de bord admin via /admin')
        console.log('   - Gérer les utilisateurs (promouvoir/supprimer)')
        console.log('   - Supprimer des jeux')
        console.log('   - Supprimer des scores')
        console.log('   - Voir les statistiques globales')
      } else {
        console.log('\n👋 Opération annulée')
      }
    }

    rl.close()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    console.error(error)
    rl.close()
    process.exit(1)
  }
}

// Exécuter le script
makeAdmin()
