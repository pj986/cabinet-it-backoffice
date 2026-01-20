const db = require('../config/db');

module.exports = {
  getAll: (callback) => {
  db.query('SELECT * FROM services ORDER BY position ASC, id DESC', callback);
},


  findById: (id, callback) => {
    db.query('SELECT * FROM services WHERE id = ? LIMIT 1', [id], callback);
  },

  create: (data, callback) => {
    db.query(
      'INSERT INTO services (titre, description) VALUES (?, ?)',
      [data.titre, data.description],
      callback
    );
  },

  update: (id, data, callback) => {
    db.query(
      'UPDATE services SET titre = ?, description = ? WHERE id = ?',
      [data.titre, data.description, id],
      callback
    );
  },

  deleteById: (id, callback) => {
    db.query('DELETE FROM services WHERE id = ?', [id], callback);
  },
  findPrev: (position, id, callback) => {
  // service "au-dessus" (position plus petite), sinon en cas d'égalité on se base sur id
  db.query(
    `SELECT * FROM services
     WHERE position < ? OR (position = ? AND id < ?)
     ORDER BY position DESC, id DESC
     LIMIT 1`,
    [position, position, id],
    callback
  );
},

findNext: (position, id, callback) => {
  // service "en-dessous" (position plus grande), sinon en cas d'égalité on se base sur id
  db.query(
    `SELECT * FROM services
     WHERE position > ? OR (position = ? AND id > ?)
     ORDER BY position ASC, id ASC
     LIMIT 1`,
    [position, position, id],
    callback
  );
},

swapPositions: (idA, posA, idB, posB, callback) => {
  db.query(
    `UPDATE services
     SET position = CASE
       WHEN id = ? THEN ?
       WHEN id = ? THEN ?
       ELSE position
     END
     WHERE id IN (?, ?)`,
    [idA, posB, idB, posA, idA, idB],
    callback
  );
},
duplicateById: (id, callback) => {
  // Duplique titre/description et place le duplicata juste après l'original (position + 1)
  db.query(
    `INSERT INTO services (position, titre, description)
     SELECT position + 1, CONCAT(titre, ' (copie)'), description
     FROM services
     WHERE id = ?
     LIMIT 1`,
    [id],
    callback
  );
},
countAll: (callback) => {
  db.query('SELECT COUNT(*) AS total FROM services', callback);
},

getPage: (limit, offset, callback) => {
  db.query(
    'SELECT * FROM services ORDER BY position ASC, id DESC LIMIT ? OFFSET ?',
    [limit, offset],
    callback
  );
},
countSearch: (search, callback) => {
  const like = `%${search}%`;
  db.query(
    'SELECT COUNT(*) AS total FROM services WHERE titre LIKE ?',
    [like],
    callback
  );
},

getPageSearch: (search, limit, offset, callback) => {
  const like = `%${search}%`;
  db.query(
    'SELECT * FROM services WHERE titre LIKE ? ORDER BY position ASC, id DESC LIMIT ? OFFSET ?',
    [like, limit, offset],
    callback
  );
},


};
