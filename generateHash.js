const bcrypt = require('bcrypt');

const password = 'Admin123!'; // 👉 Remplace par ton vrai mot de passe

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('Hash généré :');
    console.log(hash);
  })
  .catch(err => {
    console.error(err);
  });