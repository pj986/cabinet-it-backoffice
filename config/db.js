const mysql = require('mysql2');

// Modifie uniquement si tes identifiants sont différents
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',        // souvent vide avec XAMPP
  database: 'cabinet_it'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur connexion MySQL :', err.message);
    return;
  }
  console.log('Connecté à MySQL (cabinet_it)');
});

module.exports = db;
