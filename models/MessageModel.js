const db = require('../config/db');

module.exports = {
  create: (data, callback) => {
    const sql = `
      INSERT INTO messages (nom, email, message)
      VALUES (?, ?, ?)
    `;
    db.query(sql, [data.nom, data.email, data.message], callback);
  }, // ✅ VIRGULE ICI

  getAll: (callback) => {
    const sql = 'SELECT * FROM messages ORDER BY date_envoi DESC';
    db.query(sql, callback);
  },

  deleteById: (id, callback) => {
    const sql = 'DELETE FROM messages WHERE id = ?';
    db.query(sql, [id], callback);
  }
};

