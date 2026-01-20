const bcrypt = require('bcrypt');
const AdminModel = require('./models/AdminModel');

(async () => {
  const email = 'admin@cabinet-it.fr';
  const password = 'Admin123!'; // change-le après test

  const hash = await bcrypt.hash(password, 10);

  AdminModel.create(email, hash, (err) => {
    if (err) {
      console.error('Erreur création admin:', err.message);
      process.exit(1);
    }
    console.log('Admin créé:', email, 'MDP:', password);
    process.exit(0);
  });
})();
