const db = require('../config/db');

module.exports = {

  create: ({ nom, email, message }, callback) => {
    db.query(
      'INSERT INTO messages (nom, email, message, is_read, date_envoi) VALUES (?, ?, ?, 0, NOW())',
      [nom, email, message],
      callback
    );
  },

  listAdminFiltered: (onlyUnread, callback) => {
    let sql = 'SELECT * FROM messages ORDER BY date_envoi DESC';

    if (onlyUnread) {
      sql = 'SELECT * FROM messages WHERE is_read = 0 ORDER BY date_envoi DESC';
    }

    db.query(sql, callback);
  },

  markAsRead: (id, callback) => {
    db.query(
      'UPDATE messages SET is_read = 1 WHERE id = ?',
      [id],
      callback
    );
  },

  delete: (id, callback) => {
    db.query(
      'DELETE FROM messages WHERE id = ?',
      [id],
      callback
    );
  },

  countUnread: (callback) => {
    db.query(
      'SELECT COUNT(*) AS count FROM messages WHERE is_read = 0',
      (err, rows) => {
        if (err) return callback(err);
        callback(null, rows[0].count);
      }
    );
  },

  countMessagesLast7Days: (callback) => {
    const sql = `
      SELECT DATE(date_envoi) as jour, COUNT(*) as total
      FROM messages
      WHERE date_envoi >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(date_envoi)
      ORDER BY jour ASC
    `;

    db.query(sql, callback);
  },
  countMessagesByPeriod: (days, callback) => {
  const sql = `
    SELECT DATE(date_envoi) as jour, COUNT(*) as total
    FROM messages
    WHERE date_envoi >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY DATE(date_envoi)
    ORDER BY jour ASC
  `;
  db.query(sql, [days], callback);
},

};