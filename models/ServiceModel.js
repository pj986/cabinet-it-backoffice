const db = require('../config/db');

module.exports = {

  getAll: (callback) => {
    db.query(
      'SELECT * FROM services ORDER BY created_at DESC',
      callback
    );
  },

  findById: (id, callback) => {
    db.query(
      'SELECT * FROM services WHERE id = ?',
      [id],
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0]);
      }
    );
  },

  create: ({ title, description }, callback) => {
    db.query(
      'INSERT INTO services (title, description) VALUES (?, ?)',
      [title, description],
      callback
    );
  },

  update: (id, { title, description }, callback) => {
    db.query(
      'UPDATE services SET title = ?, description = ? WHERE id = ?',
      [title, description, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.query(
      'DELETE FROM services WHERE id = ?',
      [id],
      callback
    );
  }

};