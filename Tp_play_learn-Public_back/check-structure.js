const db = require('./config/database');

async function checkStructure() {
  try {
    await db.authenticate();
    console.log('✅ Connected to database\n');

    // Check questions table
    const [questions] = await db.query('SHOW COLUMNS FROM questions');
    console.log('📋 QUESTIONS TABLE COLUMNS:');
    questions.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });

    // Check levels table
    const [levels] = await db.query('SHOW COLUMNS FROM levels');
    console.log('\n📋 LEVELS TABLE COLUMNS:');
    levels.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });

    // Check games table
    const [games] = await db.query('SHOW COLUMNS FROM games');
    console.log('\n📋 GAMES TABLE COLUMNS:');
    games.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStructure();
