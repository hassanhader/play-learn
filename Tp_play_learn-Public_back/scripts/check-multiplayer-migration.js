/**
 * Migration automatique pour ajouter les colonnes multijoueur
 * Ce script s'exécute au démarrage du serveur pour garantir que la structure de la BD est à jour
 */

const { sequelize } = require('../models')

async function runMultiplayerMigration() {
  try {
    console.log('🔍 Checking if multiplayer columns exist in games table...')

    // Vérifier si les colonnes existent
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'games' 
      AND COLUMN_NAME IN ('isMultiplayer', 'minPlayers', 'maxPlayers')
    `)

    const existingColumns = results.map(r => r.COLUMN_NAME)
    console.log('📊 Existing multiplayer columns:', existingColumns)

    // Ajouter isMultiplayer si elle n'existe pas
    if (!existingColumns.includes('isMultiplayer')) {
      console.log('➕ Adding isMultiplayer column...')
      await sequelize.query(`
        ALTER TABLE games 
        ADD COLUMN isMultiplayer TINYINT(1) NOT NULL DEFAULT 0 
        COMMENT 'Le jeu supporte-t-il le mode multijoueur ?'
      `)
      console.log('✅ isMultiplayer column added')
    } else {
      console.log('✓ isMultiplayer column already exists')
    }

    // Ajouter minPlayers si elle n'existe pas
    if (!existingColumns.includes('minPlayers')) {
      console.log('➕ Adding minPlayers column...')
      await sequelize.query(`
        ALTER TABLE games 
        ADD COLUMN minPlayers INT NULL DEFAULT 1
      `)
      console.log('✅ minPlayers column added')
    } else {
      console.log('✓ minPlayers column already exists')
    }

    // Ajouter maxPlayers si elle n'existe pas
    if (!existingColumns.includes('maxPlayers')) {
      console.log('➕ Adding maxPlayers column...')
      await sequelize.query(`
        ALTER TABLE games 
        ADD COLUMN maxPlayers INT NULL DEFAULT 1
      `)
      console.log('✅ maxPlayers column added')
    } else {
      console.log('✓ maxPlayers column already exists')
    }

    console.log('✅ Multiplayer migration completed successfully')
    return true
  } catch (error) {
    console.error('❌ Error running multiplayer migration:', error.message)
    // Ne pas crasher le serveur, juste logger l'erreur
    return false
  }
}

module.exports = { runMultiplayerMigration }
