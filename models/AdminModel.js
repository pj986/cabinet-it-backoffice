const db = require('../config/db');

module.exports = {
  findByEmail: (email, callback) => {
    db.query('SELECT * FROM admins WHERE email = ? LIMIT 1', [email], callback);
  },

  create: (email, hashedPassword, callback) => {
    db.query(
      'INSERT INTO admins (email, password) VALUES (?, ?)',
      [email, hashedPassword],
      callback
    );
  }
};
