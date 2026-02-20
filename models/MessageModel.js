const db = require('../config/db');

/* ===============================
   LISTE ADMIN (avec filtre)
================================ */

exports.listAdminFiltered = (onlyUnread, callback) => {
  let sql = 'SELECT * FROM messages';

  if (onlyUnread) {
    sql += ' WHERE is_read = 0';
  }

  sql += ' ORDER BY id DESC';

  db.query(sql, callback);
};

/* ===============================
   MARQUER COMME LU
================================ */

exports.markAsRead = (id, callback) => {
  const sql = 'UPDATE messages SET is_read = 1 WHERE id = ?';
  db.query(sql, [id], callback);
};

/* ===============================
   SUPPRIMER MESSAGE
================================ */

exports.delete = (id, callback) => {
  const sql = 'DELETE FROM messages WHERE id = ?';
  db.query(sql, [id], callback);
};

/* ===============================
   COMPTER MESSAGES NON LUS
   (UTILISÉ PAR html.js)
================================ */

exports.countUnread = (callback) => {
  const sql = 'SELECT COUNT(*) AS total FROM messages WHERE is_read = 0';
  db.query(sql, (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0].total);
  });
};
exports.countUnread = (callback) => {
  const db = require('../config/db');

  db.query(
    'SELECT COUNT(*) AS total FROM messages WHERE is_read = 0',
    (err, results) => {
      if (err) return callback(err);
      callback(null, results[0].total);
    }
  );
};
exports.statsByDay = (callback) => {
  db.query(`
    SELECT DATE(date_envoi) as day, COUNT(*) as total
    FROM messages
    GROUP BY DATE(date_envoi)
    ORDER BY day ASC
  `, callback);
};
