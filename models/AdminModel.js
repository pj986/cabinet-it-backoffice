const db = require('../config/db');

const AdminModel = {

  /* =========================
     TROUVER ADMIN PAR EMAIL
  ========================= */
  findByEmail: (email, callback) => {

    const sql = 'SELECT id, email, password FROM admins WHERE email = ? LIMIT 1';

    db.query(sql, [email], (err, rows) => {

      if (err) {
        return callback(err, null);
      }

      // On retourne directement l'objet admin
      callback(null, rows.length > 0 ? rows[0] : null);
    });
  },


  /* =========================
     CRÉER UN ADMIN
  ========================= */
  create: (email, hashedPassword, callback) => {

    const sql = 'INSERT INTO admins (email, password) VALUES (?, ?)';

    db.query(sql, [email, hashedPassword], (err, result) => {

      if (err) {
        return callback(err, null);
      }

      callback(null, result);
    });
  },


  /* =========================
     TROUVER ADMIN PAR ID
     (utile pour évolutions futures)
  ========================= */
  findById: (id, callback) => {

    const sql = 'SELECT id, email FROM admins WHERE id = ? LIMIT 1';

    db.query(sql, [id], (err, rows) => {

      if (err) {
        return callback(err, null);
      }

      callback(null, rows.length > 0 ? rows[0] : null);
    });
  }

};

module.exports = AdminModel;
