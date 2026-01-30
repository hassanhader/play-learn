const { sequelize } = require('../models');
require('dotenv').config();

async function checkPasswordField() {
  try {
    console.log('🔍 Vérification du champ password...\n');

    // Requête pour obtenir les informations sur la colonne password
    const [results] = await sequelize.query(`
      SELECT 
        COLUMN_NAME as columnName,
        COLUMN_TYPE as columnType,
        CHARACTER_MAXIMUM_LENGTH as maxLength,
        IS_NULLABLE as isNullable,
        COLUMN_DEFAULT as defaultValue
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'password'
    `, {
      replacements: [process.env.DB_NAME || 'DB_play_and_learn']
    });

    if (results.length === 0) {
      console.log('❌ Colonne password non trouvée dans la table users');
      process.exit(1);
    }

    const passwordField = results[0];
    
    console.log('📊 Informations sur le champ password:');
    console.log('─────────────────────────────────────');
    console.log(`Nom:           ${passwordField.columnName}`);
    console.log(`Type:          ${passwordField.columnType}`);
    console.log(`Longueur max:  ${passwordField.maxLength} caractères`);
    console.log(`Nullable:      ${passwordField.isNullable}`);
    console.log(`Défaut:        ${passwordField.defaultValue || 'NULL'}`);
    console.log('─────────────────────────────────────\n');

    // Vérifications
    const expectedLength = 500;
    if (passwordField.maxLength >= expectedLength) {
      console.log(`✅ Le champ password a la bonne taille (${passwordField.maxLength} >= ${expectedLength})`);
    } else {
      console.log(`⚠️  Le champ password est trop petit (${passwordField.maxLength} < ${expectedLength})`);
      console.log(`   Il devrait être au moins ${expectedLength} caractères`);
      process.exit(1);
    }

    // Compter les utilisateurs
    const [countResult] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 Nombre d'utilisateurs: ${countResult[0].count}`);

    console.log('\n✨ Vérification terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

checkPasswordField();
