const { sequelize, Game, Level, Question } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');
    
    const games = await Game.findAll();
    console.log(`📊 Total games: ${games.length}\n`);
    
    if (games.length > 0) {
      console.log('🎮 Games in database:');
      for (const game of games) {
        const levels = await Level.count({ where: { gameId: game.id } });
        const questions = await Question.count({ 
          include: [{ model: Level, where: { gameId: game.id } }] 
        });
        console.log(`  - ${game.gameId}: ${game.title}`);
        console.log(`    Type: ${game.type}, Difficulty: ${game.difficulty}`);
        console.log(`    Levels: ${levels}, Questions: ${questions}`);
        console.log(`    Time limit: ${game.timeLimit}s`);
        console.log('');
      }
    } else {
      console.log('❌ No games found in database!');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
