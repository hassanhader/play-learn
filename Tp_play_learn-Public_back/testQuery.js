const { Game, Level } = require('./models');

(async () => {
  try {
    console.log('Testing Game.findAll()...\n');
    
    // Test 1: Sans includes
    const games1 = await Game.findAll({ where: { isEnabled: true } });
    console.log(`✅ Test 1 - Basic findAll: ${games1.length} games`);
    
    // Test 2: Avec include Level seulement
    try {
      const games2 = await Game.findAll({
        where: { isEnabled: true },
        include: [{
          model: Level,
          as: 'levels',
          required: false
        }]
      });
      console.log(`✅ Test 2 - With Level include: ${games2.length} games`);
    } catch (e) {
      console.log(`❌ Test 2 - Error:`, e.message);
    }
    
    // Test 3: Sans filter isEnabled
    const games3 = await Game.findAll();
    console.log(`✅ Test 3 - Without isEnabled filter: ${games3.length} games`);
    
    await require('./models').sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
