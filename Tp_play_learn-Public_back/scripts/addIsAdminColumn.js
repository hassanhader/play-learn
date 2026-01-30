/**
 * Script de migration pour ajouter la colonne isAdmin à la table users
 * Exécutez ce script avec: node scripts/addIsAdminColumn.js
 */

const { sequelize } = require('../models')

async function addIsAdminColumn() {
  try {
    console.log('🔄 Vérification de la connexion à la base de données...')
    await sequelize.authenticate()
    console.log('✅ Connexion réussie')

    console.log('\n🔄 Ajout de la colonne isAdmin à la table users...')
    
    // Vérifier d'abord si la colonne existe déjà
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'isAdmin'
    `)

    if (results.length > 0) {
      console.log('⚠️  La colonne isAdmin existe déjà dans la table users')
      console.log('✅ Migration déjà effectuée, aucune action nécessaire')
    } else {
      // Ajouter la colonne
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN isAdmin TINYINT(1) NOT NULL DEFAULT 0 
        COMMENT 'Admin users have access to admin dashboard and management features'
      `)
      console.log('✅ Colonne isAdmin ajoutée avec succès!')
    }

    // Afficher le nombre d'admins actuels
    const [admins] = await sequelize.query(`
      SELECT COUNT(*) as count FROM users WHERE isAdmin = 1
    `)
    console.log(`\n📊 Nombre d'administrateurs actuels: ${admins[0].count}`)

    if (admins[0].count === 0) {
      console.log('\n⚠️  Aucun administrateur trouvé!')
      console.log('📝 Pour créer un administrateur, exécutez:')
      console.log('   UPDATE users SET isAdmin = 1 WHERE id = 1;')
      console.log('   (Remplacez 1 par l\'ID de votre utilisateur)')
    }

    console.log('\n✨ Migration terminée avec succès!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Exécuter la migration
addIsAdminColumn()
