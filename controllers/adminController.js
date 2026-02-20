const { shell, escapeHtml } = require('../utils/html');
const MessageModel = require('../models/MessageModel');
const ServiceModel = require('../models/ServiceModel'); // si utilisé
// const SettingsModel = require('../models/SettingsModel'); // à activer si tu l’as

/* ======================================================
   BADGES
====================================================== */

function readBadge(isRead) {
  return isRead
    ? `<span class="tag">LU</span>`
    : `<span class="tag tag--off">NON LU</span>`;
}

/* ======================================================
   MESSAGES (CONTACT)
====================================================== */

exports.messagesPage = (req, res) => {
  const onlyUnread = req.query.unread === '1';

  MessageModel.listAdminFiltered(onlyUnread, (err, rows) => {
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
        <td>
          ${
            !m.is_read
              ? `
                <form method="POST" action="/admin/messages/${m.id}/read" style="display:inline">
                  <button class="btn btn--small">Marquer comme lu</button>
                </form>
              `
              : ''
          }
          <form method="POST" action="/admin/messages/${m.id}/delete" style="display:inline">
            <button class="btn btn--secondary btn--small">Supprimer</button>
          </form>
        </td>
      </tr>
    `).join('');

    const content = `
      <style>
        .row-unread { background:#fff7ed; }
        .filters { margin-bottom:14px; }
      </style>

      <h1>Back-office — Messages</h1>
      <p class="muted">Gestion des messages du formulaire de contact.</p>

      <form method="GET" action="/admin/messages" class="filters">
        <label>
          <input type="checkbox" name="unread" value="1" ${onlyUnread ? 'checked' : ''}>
          Afficher uniquement les non lus
        </label>
        <button class="btn btn--secondary btn--small" type="submit">Filtrer</button>
        ${
          onlyUnread
            ? `<a class="btn btn--secondary btn--small" href="/admin/messages">Réinitialiser</a>`
            : ''
        }
      </form>

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

    shell('Back-office — Messages', 'messages', content)
  .then(html => res.send(html));

  });
};

/* ======================================================
   MARQUER COMME LU
====================================================== */

exports.markMessageRead = (req, res) => {
  MessageModel.markAsRead(req.params.id, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur mise à jour message');
    }
    res.redirect('/admin/messages');
  });
};

/* ======================================================
   SUPPRIMER MESSAGE
====================================================== */

exports.deleteMessage = (req, res) => {
  MessageModel.delete(req.params.id, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur suppression message');
    }
    res.redirect('/admin/messages');
  });
};

/* ======================================================
   PARAMÈTRES (VERSION SIMPLE STABLE)
====================================================== */

exports.settingsPage = (req, res) => {

  const content = `
    <h1>Back-office — Paramètres</h1>
    <p class="muted">Configuration générale du cabinet.</p>

    <form method="POST" action="/admin/settings" style="max-width:500px;">
      <label>Nom du cabinet
        <input name="name" required>
      </label>

      <label>Email de contact
        <input name="email" type="email">
      </label>

      <label>Téléphone
        <input name="phone">
      </label>

      <div style="margin-top:12px;">
        <button class="btn">Enregistrer</button>
      </div>
    </form>
  `;

  shell('Back-office — Paramètres', 'settings', content)
  .then(html => res.send(html));

};

exports.settingsSave = (req, res) => {
  // Ici tu pourras connecter un SettingsModel plus tard
  res.redirect('/admin/settings');
};
exports.getUnreadCount = (req, res) => {
  MessageModel.countUnread((err, count) => {
    if (err) {
      console.error(err);
      return res.json({ count: 0 });
    }
    res.json({ count });
  });
};
exports.dashboardPage = async (req, res) => {


  MessageModel.statsByDay(async (err, rows) => {


    if (err) {
      console.error(err);
      return res.status(500).send('Erreur stats');
    }

    const labels = rows.map(r => r.day);
    const values = rows.map(r => r.total);

    const content = `
      <h2>Dashboard Analytics</h2>
      <canvas id="chartMessages" height="100"></canvas>

      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script>
        const ctx = document.getElementById('chartMessages');

        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ${JSON.stringify(labels)},
            datasets: [{
              label: 'Messages par jour',
              data: ${JSON.stringify(values)},
              borderWidth: 2,
              tension: 0.3
            }]
          }
        });
      </script>
    `;

    const html = await shell('Back-office — Dashboard', 'dashboard', content);
res.send(html);

  });
};

