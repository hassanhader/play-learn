/**
 * Migration script to add multiplayer fields to Games table
 * This runs automatically on server startup in production
 */

async function runMultiplayerMigration(sequelize) {
  try {
    console.log('🔄 Checking for multiplayer fields migration...')
    
    const queryInterface = sequelize.getQueryInterface()
    const tableDescription = await queryInterface.describeTable('games')
    
    // Check if multiplayer columns exist
    const hasIsMultiplayer = tableDescription.hasOwnProperty('isMultiplayer')
    const hasMinPlayers = tableDescription.hasOwnProperty('minPlayers')
    const hasMaxPlayers = tableDescription.hasOwnProperty('maxPlayers')
    
    if (hasIsMultiplayer && hasMinPlayers && hasMaxPlayers) {
      console.log('✅ Multiplayer fields already exist, skipping migration')
      return
    }
    
    console.log('📝 Adding missing multiplayer fields to games table...')
    
    // Add isMultiplayer column
    if (!hasIsMultiplayer) {
      await queryInterface.addColumn('games', 'isMultiplayer', {
        type: sequelize.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Le jeu supporte-t-il le mode multijoueur ?'
      })
      console.log('  ✅ Added isMultiplayer column')
    }
    
    // Add minPlayers column
    if (!hasMinPlayers) {
      await queryInterface.addColumn('games', 'minPlayers', {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      })
      console.log('  ✅ Added minPlayers column')
    }
    
    // Add maxPlayers column
    if (!hasMaxPlayers) {
      await queryInterface.addColumn('games', 'maxPlayers', {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      })
      console.log('  ✅ Added maxPlayers column')
    }
    
    console.log('✅ Multiplayer migration completed successfully')
    
  } catch (error) {
    console.error('❌ Error running multiplayer migration:', error)
    throw error
  }
}

module.exports = runMultiplayerMigration
