const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'DB_play_and_learn'
  });
  
  console.log('✅ Connected to MySQL\n');
  
  const [games] = await connection.execute('SELECT COUNT(*) as count FROM games');
  console.log(`Total games: ${games[0].count}`);
  
  const [gamesList] = await connection.execute('SELECT id, gameId, title, type, isEnabled FROM games LIMIT 10');
  console.log('\nGames:');
  gamesList.forEach(g => console.log(`  ${g.id}. ${g.gameId} - ${g.title} (${g.type}) - Enabled: ${g.isEnabled}`));
  
  await connection.end();
  console.log('\n✅ Done');
})().catch(console.error);
