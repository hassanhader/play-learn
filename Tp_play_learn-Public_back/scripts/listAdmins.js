const {User} = require('../models');

(async () => {
  try {
    const admins = await User.findAll({
      where: { isAdmin: true },
      attributes: ['id', 'username', 'email', 'isAdmin']
    });

    console.log('\n👑 Administrateurs actuels:\n');
    admins.forEach(admin => {
      console.log(`  ✅ ID ${admin.id}: ${admin.username} (${admin.email})`);
    });
    console.log(`\n📊 Total: ${admins.length} administrateur(s)\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
})();
