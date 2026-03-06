const { shell, escapeHtml } = require('../utils/html');
const MessageModel = require('../models/MessageModel');
const ServiceModel = require('../models/ServiceModel'); // si utilisé
// const SettingsModel = require('../models/SettingsModel'); // à activer si tu l’as
const { validationResult } = require('express-validator');

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
  const token = req.csrfToken(); // 🔐 IMPORTANT

  MessageModel.listAdminFiltered(onlyUnread, async (err, rows) => {

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
                <form method="POST"
                      action="/admin/messages/${m.id}/read"
                      style="display:inline">

                  <input type="hidden" name="_csrf" value="${token}" />

                  <button class="btn btn--small"
                          type="submit">
                    Marquer comme lu
                  </button>
                </form>
              `
              : ''
          }

          <form method="POST"
                action="/admin/messages/${m.id}/delete"
                style="display:inline">

            <input type="hidden" name="_csrf" value="${token}" />

            <button class="btn btn--secondary btn--small"
                    type="submit">
              Supprimer
            </button>
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
      <div style="margin-top:20px; margin-bottom:25px;">
  <a href="/admin/messages/create" class="btn btn--primary">
    ✉️ Envoyer un message
  </a>
</div>

      <form method="GET" action="/admin/messages" class="filters">
        <label>
          <input type="checkbox"
                 name="unread"
                 value="1"
                 ${onlyUnread ? 'checked' : ''}>
          Afficher uniquement les non lus
        </label>

        <button class="btn btn--secondary btn--small"
                type="submit">
          Filtrer
        </button>

        ${
          onlyUnread
            ? `<a class="btn btn--secondary btn--small"
                  href="/admin/messages">
                  Réinitialiser
               </a>`
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

    const html = await shell(
      'Back-office — Messages',
      'messages',
      content,
      token // 🔐 on passe le token au layout
    );

    res.send(html);
  });
};

/* ======================================================
   MARQUER COMME LU
====================================================== */

exports.markMessageRead = (req, res) => {

  const id = parseInt(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).send('ID invalide');
  }

  MessageModel.markAsRead(id, (err) => {
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

  const id = parseInt(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).send('ID invalide');
  }

  MessageModel.delete(id, (err) => {
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

exports.settingsPage = async (req, res) => {

  const token = req.csrfToken(); // 🔐 IMPORTANT

  const content = `
    <h1>Back-office — Paramètres</h1>
    <p class="muted">Configuration générale du cabinet.</p>

    <form method="POST"
          action="/admin/settings"
          style="max-width:500px;">

      <input type="hidden"
             name="_csrf"
             value="${token}" />

      <label>
        Nom du cabinet
        <input name="name" required>
      </label>

      <label>
        Email de contact
        <input name="email" type="email">
      </label>

      <label>
        Téléphone
        <input name="phone">
      </label>

      <div style="margin-top:12px;">
        <button class="btn"
                type="submit">
          Enregistrer
        </button>
      </div>
    </form>
  `;

  const html = await shell(
    'Back-office — Paramètres',
    'settings',
    content,
    token // 🔐 on passe le token au layout
  );

  res.send(html);
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
exports.dashboardPage = (req, res) => {

  const token = req.csrfToken();
  const periode = parseInt(req.query.periode) || 7;

  MessageModel.countUnread((err1, unreadCount) => {

    if (err1) unreadCount = 0;

    ServiceModel.getAll((err2, services) => {

      if (err2) services = [];

      MessageModel.countMessagesByPeriod(periode, (err3, evolution) => {
        if (err3) evolution = [];

        const labels = evolution.map(row => row.jour);
        const data = evolution.map(row => row.total);

        const content = `
          <h1>Dashboard</h1>
          <form method="GET" style="margin-top:20px;margin-bottom:30px;">
  <select name="periode">
    <option value="7" ${periode === 7 ? 'selected' : ''}>
      7 derniers jours
    </option>
    <option value="30" ${periode === 30 ? 'selected' : ''}>
      30 derniers jours
    </option>
  </select>
  <button type="submit" class="btn">Filtrer</button>
</form>

          <!-- SECTION KPI -->
          <section style="margin-top:30px;">
            <div style="display:flex;gap:30px;flex-wrap:wrap;">

              <div class="card fade-in" style="width:250px;">
                <h3>Messages non lus</h3>
                <p style="font-size:32px;font-weight:bold;margin:10px 0;">
                  ${unreadCount}
                </p>
              </div>

              <div class="card fade-in" style="width:250px;">
                <h3>Nombre de services</h3>
                <p style="font-size:32px;font-weight:bold;margin:10px 0;">
                  ${services.length}
                </p>
              </div>

            </div>
          </section>

          <!-- SECTION GRAPHIQUES -->
          <section style="margin-top:60px;display:grid;grid-template-columns:1fr 1fr;gap:30px;">

            <div class="card">
              <h2>Statistiques globales</h2>
              <canvas id="globalChart"></canvas>
            </div>

            <div class="card">
              <h2>Évolution des messages</h2>
              <canvas id="evolutionChart"></canvas>
            </div>

          </section>

          <script>
            // BAR CHART
            new Chart(document.getElementById('globalChart'), {
              type: 'bar',
              data: {
                labels: ['Messages non lus', 'Services'],
                datasets: [{
                  data: [${unreadCount}, ${services.length}],
                  backgroundColor: [
                    'rgba(255,152,0,0.8)',
                    'rgba(33,150,243,0.8)'
                  ],
                  borderRadius: 8
                }]
              },
              options: {
                responsive: true,
                animation: {
                  duration: 1500,
                  easing: 'easeOutQuart'
                },
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }
            });

            // LINE CHART
            new Chart(document.getElementById('evolutionChart'), {
              type: 'line',
              data: {
                labels: ${JSON.stringify(labels)},
                datasets: [{
                  label: 'Messages reçus',
                  data: ${JSON.stringify(data)},
                  borderColor: 'rgba(33,150,243,1)',
                  backgroundColor: 'rgba(33,150,243,0.2)',
                  fill: true,
                  tension: 0.3
                }]
              },
              options: {
                responsive: true,
                animation: {
                  duration: 1500,
                  easing: 'easeOutQuart'
                },
                elements: {
                  line: { borderWidth: 3 },
                  point: { radius: 5, hoverRadius: 8 }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }
            });
          </script>
        `;

        const html = shell('Dashboard', 'dashboard', content, token);
        res.send(html);

      });
    });
  });
};

/* =========================
   LISTE SERVICES
========================= */
exports.servicesPage = (req, res) => {

  const token = req.csrfToken();

  ServiceModel.getAll(async (err, rows) => {

    if (err) {
      console.error(err);
      return res.status(500).send('Erreur chargement services');
    }

    const tableRows = rows.map(service => `
      <tr>
        <td>${escapeHtml(service.title)}</td>
        <td>${escapeHtml(service.description)}</td>
        <td>
          <a class="btn btn--small"
             href="/admin/services/edit/${service.id}">
             Modifier
          </a>

          <form method="POST"
                action="/admin/services/delete/${service.id}"
                style="display:inline;">
            <input type="hidden"
                   name="_csrf"
                   value="${token}" />

            <button class="btn btn--secondary btn--small"
                    type="submit">
              Supprimer
            </button>
          </form>
        </td>
      </tr>
    `).join('');

    const content = `
      <h1>Gestion des services</h1>

      <a class="btn"
         href="/admin/services/create">
         Ajouter un service
      </a>

      <table class="table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || '<tr><td colspan="3">Aucun service</td></tr>'}
        </tbody>
      </table>
    `;

    const html = await shell('Services — Admin', 'services', content, token);
    res.send(html);
  });
};

/* =========================
   FORM CREATE
========================= */
exports.createServicePage = async (req, res) => {

  const token = req.csrfToken();

  const content = `
    <h1>Ajouter un service</h1>

    <form method="POST" action="/admin/services/create">
      <input type="hidden" name="_csrf" value="${token}" />

      <label>Titre</label>
      <input type="text" name="title" required>

      <label>Description</label>
      <textarea name="description" required></textarea>

      <button class="btn">Enregistrer</button>
    </form>
  `;

  const html = await shell(
  'Créer service',
  'services',
  content,
  token
);
  res.send(html);
};


/* =========================
   CREATE
========================= */
exports.createService = (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).send(errors.array()[0].msg);
  }

  const { title, description } = req.body;

  ServiceModel.create({ title, description }, (err) => {
    if (err) return res.status(500).send('Erreur création');
    res.redirect('/admin/services');
  });
};


/* =========================
   FORM EDIT
========================= */
exports.editServicePage = (req, res) => {

 const id = parseInt(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).send('ID invalide');
  }

  if (!Number.isInteger(id)) {
    return res.status(400).send('ID invalide');
  }
  ServiceModel.findById(id, async (err, service) => {

    if (err || !service) {
      return res.status(404).send('Service introuvable');
    }

    // 🔐 Génération du token CSRF
    const token = req.csrfToken();

    const content = `
      <h1>Modifier service</h1>

      <form method="POST" action="/admin/services/edit/${service.id}">
        
        <input type="hidden" name="_csrf" value="${token}" />

        <label>Titre</label>
        <input type="text" name="title"
          value="${escapeHtml(service.title)}" required>

        <label>Description</label>
        <textarea name="description" required>
          ${escapeHtml(service.description)}
        </textarea>

        <button class="btn">Mettre à jour</button>
      </form>
    `;

    const html = await shell(
  'Modifier service',
  'services',
  content,
  token // 🔐 IMPORTANT
);

res.send(html);
  });
};


/* =========================
   UPDATE
========================= */
exports.updateService = (req, res) => {

  const id = parseInt(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).send('ID invalide');
  }
  const { title, description } = req.body;

  ServiceModel.update(id, { title, description }, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur mise à jour');
    }

    res.redirect('/admin/services');
  });
};


/* =========================
   DELETE
========================= */
exports.deleteService = (req, res) => {

  const id = parseInt(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).send('ID invalide');
  }

  ServiceModel.delete(id, (err) => {

    if (err) {
      console.error(err);
      return res.status(500).send('Erreur suppression');
    }

    res.redirect('/admin/services');
  });
};
exports.messageDetailPage = (req, res) => {

  const id = parseInt(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).send('ID invalide');
  }
  const token = req.csrfToken(); // 🔐 IMPORTANT

  MessageModel.findById(id, async (err, message) => {

    if (err || !message) {
      return res.status(404).send('Message introuvable');
    }

    const content = `
      <h1>Détail du message</h1>

      <p><strong>Nom :</strong> ${escapeHtml(message.nom)}</p>
      <p><strong>Email :</strong> ${escapeHtml(message.email)}</p>
      <p><strong>Message :</strong> ${escapeHtml(message.message)}</p>
      <p><strong>Date :</strong> ${escapeHtml(message.date_envoi)}</p>

      <a class="btn" href="/admin/messages">Retour</a>
    `;

    const html = await shell(
      'Détail message',
      'messages',
      content,
      token // 🔐 on passe le token au layout
    );

    res.send(html);
  });
};
exports.createMessagePage = (req, res) => {

  const token = req.csrfToken();

  const content = `
    <h1>Envoyer un message</h1>

    <div class="card" style="max-width:500px;margin-top:30px;">
      <form method="POST" action="/admin/messages/create">

        <input type="hidden" name="_csrf" value="${token}" />

        <label>Nom</label>
        <input type="text" name="nom" required style="width:100%;padding:8px;margin-bottom:15px;">

        <label>Email</label>
        <input type="email" name="email" required style="width:100%;padding:8px;margin-bottom:15px;">

        <label>Message</label>
        <textarea name="message" required style="width:100%;padding:8px;margin-bottom:15px;"></textarea>

        <button class="btn btn--primary" type="submit">
          Envoyer
        </button>
      </form>
    </div>
  `;

  const html = shell('Envoyer message', 'messages', content, token);
  res.send(html);
};
exports.createMessage = (req, res) => {

  const { nom, email, message } = req.body;

  MessageModel.create({ nom, email, message }, (err) => {

    if (err) {
      console.error(err);
      return res.status(500).send('Erreur envoi message');
    }

    res.redirect('/admin/messages');
  });
};