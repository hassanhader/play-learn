const mysql = require('mysql2/promise');
require('dotenv').config();

async function updatePasswordField() {
  let connection;
  
  try {
    console.log('🔧 Connexion à la base de données...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'DB_play_and_learn'
    });

    console.log('✅ Connecté à la base de données');

    // Vérifier la taille actuelle du champ password
    console.log('\n📊 Vérification de la taille actuelle du champ password...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password'
    `, [process.env.DB_NAME || 'DB_play_and_learn']);

    if (columns.length > 0) {
      console.log('Taille actuelle:', columns[0].COLUMN_TYPE);
      console.log('Longueur maximale:', columns[0].CHARACTER_MAXIMUM_LENGTH);
    }

    // Modifier la taille du champ password à 500 caractères
    console.log('\n🔨 Modification de la taille du champ password à VARCHAR(500)...');
    await connection.query(`
      ALTER TABLE users 
      MODIFY COLUMN password VARCHAR(500) NOT NULL
    `);

    console.log('✅ Champ password modifié avec succès!');

    // Vérifier la nouvelle taille
    console.log('\n📊 Vérification de la nouvelle taille...');
    const [newColumns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password'
    `, [process.env.DB_NAME || 'DB_play_and_learn']);

    if (newColumns.length > 0) {
      console.log('Nouvelle taille:', newColumns[0].COLUMN_TYPE);
      console.log('Nouvelle longueur maximale:', newColumns[0].CHARACTER_MAXIMUM_LENGTH);
    }

    console.log('\n✨ Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 Connexion fermée');
    }
  }
}

// Exécuter la migration
updatePasswordField();
