const { shell, escapeHtml } = require('../utils/html');
const MessageModel = require('../models/MessageModel');

/**
 * Badge LU / NON LU
 */
function readBadge(isRead) {
  return isRead
    ? `<span class="tag">LU</span>`
    : `<span class="tag tag--off">NON LU</span>`;
}

/**
 * Page admin — Messages
 */
exports.messagesPage = (req, res) => {
  MessageModel.listAdmin((err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur chargement messages');
    }

    const tableRows = (rows || []).map(m => `
      <tr class="${m.is_read ? '' : 'row-unread'}">
        <td>${escapeHtml(m.nom)}</td>
        <td>${escapeHtml(m.email)}</td>
        <td>${escapeHtml(m.message)}</td>
        <td>${escapeHtml(m.date_envoi)}</td>
        <td>${readBadge(m.is_read)}</td>
        <td class="actions">
          ${
            !m.is_read
              ? `
                <form method="POST" action="/admin/messages/${m.id}/read" style="display:inline">
                  <button class="btn btn--small" type="submit">Marquer lu</button>
                </form>
              `
              : ''
          }
          <form method="POST" action="/admin/messages/${m.id}/delete" style="display:inline">
            <button class="btn btn--small btn--secondary" type="submit">Supprimer</button>
          </form>
        </td>
      </tr>
    `).join('');

    const content = `
      <style>
        .row-unread { background:#fff7ed; }
      </style>

      <p class="muted">Messages envoyés via le formulaire de contact.</p>

      <table class="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Message</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || `<tr><td colspan="6">Aucun message</td></tr>`}
        </tbody>
      </table>
    `;

    res.send(shell('Back-office — Messages', 'messages', content));
  });
};

/**
 * Marquer un message comme LU
 */
exports.markRead = (req, res) => {
  MessageModel.markAsRead(req.params.id, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur mise à jour message');
    }
    res.redirect('/admin/messages');
  });
};

/**
 * Supprimer un message
 */
exports.deleteMessage = (req, res) => {
  MessageModel.delete(req.params.id, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur suppression message');
    }
    res.redirect('/admin/messages');
  });
};
