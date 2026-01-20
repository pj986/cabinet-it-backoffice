const ServiceModel = require('../models/ServiceModel');
const MessageModel = require('../models/MessageModel');

/* ===========================
   HELPERS
=========================== */

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncate(str, maxLength = 120) {
  const s = String(str ?? '');
  return s.length > maxLength ? s.slice(0, maxLength) + '…' : s;
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightAndEscape(text, search) {
  const s = String(text ?? '');
  const q = String(search ?? '').trim();
  if (!q) return escapeHtml(s);

  const re = new RegExp(escapeRegExp(q), 'ig');
  let out = '';
  let lastIndex = 0;
  let match;

  while ((match = re.exec(s)) !== null) {
    out += escapeHtml(s.slice(lastIndex, match.index));
    out += `<mark class="hl">${escapeHtml(match[0])}</mark>`;
    lastIndex = match.index + match[0].length;
    if (match[0].length === 0) re.lastIndex++;
  }

  out += escapeHtml(s.slice(lastIndex));
  return out;
}

function buildQueryString({ page, search }) {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (search && String(search).trim().length) params.set('search', String(search).trim());
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function buildPagination({ currentPage, totalPages, baseUrl, search }) {
  if (totalPages <= 1) return '';

  const windowSize = 2;
  const start = Math.max(1, currentPage - windowSize);
  const end = Math.min(totalPages, currentPage + windowSize);

  const pageLinks = [];
  for (let p = start; p <= end; p++) {
    const isActive = p === currentPage;
    const qs = buildQueryString({ page: p, search });
    pageLinks.push(`
      <a class="btn btn-secondary btn-icon" href="${baseUrl}${qs}"
         style="${isActive ? 'background:#111;color:#fff;border-color:#111;' : ''}">
        ${p}
      </a>
    `);
  }

  const firstQs = buildQueryString({ page: 1, search });
  const prevQs = buildQueryString({ page: Math.max(1, currentPage - 1), search });
  const nextQs = buildQueryString({ page: Math.min(totalPages, currentPage + 1), search });
  const lastQs = buildQueryString({ page: totalPages, search });

  const disableFirst = currentPage === 1 ? 'style="pointer-events:none;opacity:0.5;"' : '';
  const disablePrev = currentPage === 1 ? 'style="pointer-events:none;opacity:0.5;"' : '';
  const disableNext = currentPage === totalPages ? 'style="pointer-events:none;opacity:0.5;"' : '';
  const disableLast = currentPage === totalPages ? 'style="pointer-events:none;opacity:0.5;"' : '';

  return `
    <div class="actions" style="gap:8px;flex-wrap:wrap;">
      <a class="btn btn-secondary" href="${baseUrl}${firstQs}" ${disableFirst}>⟪</a>
      <a class="btn btn-secondary" href="${baseUrl}${prevQs}" ${disablePrev}>Précédent</a>
      ${pageLinks.join('')}
      <a class="btn btn-secondary" href="${baseUrl}${nextQs}" ${disableNext}>Suivant</a>
      <a class="btn btn-secondary" href="${baseUrl}${lastQs}" ${disableLast}>⟫</a>
    </div>
  `;
}

/* ===========================
   SERVICES – LISTE (pagination + recherche + surbrillance)
=========================== */

exports.servicesPage = (req, res) => {
  const pageSize = 20;
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const search = String(req.query.search || '').trim();
  const offset = (page - 1) * pageSize;
  const hasSearch = search.length > 0;

  const countFn = hasSearch
    ? cb => ServiceModel.countSearch(search, cb)
    : cb => ServiceModel.countAll(cb);

  const pageFn = hasSearch
    ? cb => ServiceModel.getPageSearch(search, pageSize, offset, cb)
    : cb => ServiceModel.getPage(pageSize, offset, cb);

  countFn((err, countRows) => {
    if (err) return res.status(500).send("Erreur serveur.");

    const total = countRows?.[0]?.total || 0;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    if (page > totalPages) {
      const qs = buildQueryString({ page: totalPages, search });
      return res.redirect(`/admin/services${qs}`);
    }

    pageFn((err2, services) => {
      if (err2) return res.status(500).send("Erreur serveur.");

      const rows = services.map(s => `
        <tr>
          <td>${s.id}</td>
          <td>${s.position}</td>
          <td>${highlightAndEscape(s.titre, search)}</td>
          <td title="${escapeHtml(s.description)}">
            ${highlightAndEscape(truncate(s.description, 120), search)}
          </td>
          <td class="actions">
            <form method="POST" action="/admin/services/move-up/${s.id}">
              <button class="btn btn-secondary btn-icon">↑</button>
            </form>
            <form method="POST" action="/admin/services/move-down/${s.id}">
              <button class="btn btn-secondary btn-icon">↓</button>
            </form>
            <a class="btn btn-secondary" href="/admin/services/view/${s.id}">Voir</a>
            <a class="btn btn-secondary" href="/admin/services/edit/${s.id}">Modifier</a>
            <form method="POST" action="/admin/services/duplicate/${s.id}">
              <button class="btn btn-secondary">Dupliquer</button>
            </form>
            <form method="POST" action="/admin/services/delete/${s.id}" onsubmit="return confirm('Supprimer ?');">
              <button class="btn btn-danger">Supprimer</button>
            </form>
          </td>
        </tr>
      `).join('');

      const paginationHtml = buildPagination({
        currentPage: page,
        totalPages,
        baseUrl: '/admin/services',
        search
      });

      res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Admin - Services</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
          <header class="header">
            <div class="container">
              <div class="brand">Cabinet IT — Admin</div>
              <nav class="nav">
                <a href="/admin/messages">Messages</a>
                <a href="/admin/services">Services</a>
                <a href="/">Site</a>
              </nav>
            </div>
          </header>

          <main class="container">
            <div class="card">
              <h1>Back-office — Services</h1>

              <div class="actions" style="margin:12px 0;flex-wrap:wrap;">
                <a class="btn" href="/admin/services/new">+ Ajouter</a>

                <form method="GET" action="/admin/services" style="display:flex;gap:8px;">
                  <input type="text" name="search" value="${escapeHtml(search)}" placeholder="Recherche titre / description">
                  <button class="btn btn-secondary">Rechercher</button>
                  ${hasSearch ? `<a class="btn btn-secondary" href="/admin/services">Réinitialiser</a>` : ''}
                </form>

                <form method="POST" action="/auth/logout">
                  <button class="btn btn-secondary">Déconnexion</button>
                </form>
              </div>

              ${paginationHtml}

              <table class="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Position</th>
                    <th>Titre</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows || `<tr><td colspan="5">Aucun résultat</td></tr>`}
                </tbody>
              </table>

              <div style="margin-top:12px;">
                ${paginationHtml}
              </div>
            </div>
          </main>
        </body>
        </html>
      `);
    });
  });
};

/* ===========================
   AUTRES ACTIONS SERVICES
=========================== */

exports.moveUpService = (req, res) => {
  const id = parseInt(req.params.id, 10);
  ServiceModel.findById(id, (err, rows) => {
    if (err || !rows.length) return res.redirect('/admin/services');
    const cur = rows[0];
    ServiceModel.findPrev(cur.position, cur.id, (err2, prev) => {
      if (err2 || !prev.length) return res.redirect('/admin/services');
      ServiceModel.swapPositions(cur.id, cur.position, prev[0].id, prev[0].position, () =>
        res.redirect('/admin/services')
      );
    });
  });
};

exports.moveDownService = (req, res) => {
  const id = parseInt(req.params.id, 10);
  ServiceModel.findById(id, (err, rows) => {
    if (err || !rows.length) return res.redirect('/admin/services');
    const cur = rows[0];
    ServiceModel.findNext(cur.position, cur.id, (err2, next) => {
      if (err2 || !next.length) return res.redirect('/admin/services');
      ServiceModel.swapPositions(cur.id, cur.position, next[0].id, next[0].position, () =>
        res.redirect('/admin/services')
      );
    });
  });
};

exports.duplicateService = (req, res) => {
  const id = parseInt(req.params.id, 10);
  ServiceModel.duplicateById(id, () => res.redirect('/admin/services'));
};

/* ===========================
   MESSAGES
=========================== */

exports.messagesPage = (req, res) => {
  MessageModel.getAll((err, rows) => {
    if (err) return res.status(500).send("Erreur serveur.");

    const trs = rows.map(m => `
      <tr>
        <td>${m.id}</td>
        <td>${escapeHtml(m.nom)}</td>
        <td>${escapeHtml(m.email)}</td>
        <td>${escapeHtml(m.message)}</td>
        <td>${m.date_envoi}</td>
        <td>
          <form method="POST" action="/admin/messages/delete/${m.id}">
            <button class="btn btn-danger">Supprimer</button>
          </form>
        </td>
      </tr>
    `).join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Admin - Messages</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body>
        <header class="header">
          <div class="container">
            <div class="brand">Cabinet IT — Admin</div>
            <nav class="nav">
              <a href="/admin/services">Services</a>
              <a href="/admin/messages">Messages</a>
              <a href="/">Site</a>
            </nav>
          </div>
        </header>

        <main class="container">
          <div class="card">
            <h1>Messages reçus</h1>
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${trs || `<tr><td colspan="6">Aucun message</td></tr>`}
              </tbody>
            </table>
          </div>
        </main>
      </body>
      </html>
    `);
  });
};
// ===========================
// SERVICES - CRUD manquants
// ===========================

exports.newServicePage = (req, res) => {
  res.send(`
    <!DOCTYPE html><html lang="fr"><head>
      <meta charset="UTF-8"><title>Nouveau service</title>
      <link rel="stylesheet" href="/css/style.css">
    </head><body>
      <main class="container">
        <div class="card" style="max-width:900px;margin:30px auto;">
          <h1>Ajouter un service</h1>
          <form method="POST" action="/admin/services/new">
            <label>Position</label>
            <input name="position" type="number" value="0" min="0" step="1" required>

            <div style="height:12px;"></div>

            <label>Titre</label>
            <input name="titre" required maxlength="100">

            <div style="height:12px;"></div>

            <label>Description</label>
            <textarea name="description" required maxlength="2000"></textarea>

            <div style="height:14px;"></div>

            <button class="btn" type="submit">Créer</button>
            <a class="btn btn-secondary" href="/admin/services">Annuler</a>
          </form>
        </div>
      </main>
    </body></html>
  `);
};

exports.createService = (req, res) => {
  const { titre, description, position } = req.body;
  const pos = Number.parseInt(position, 10);
  if (!titre || !description || Number.isNaN(pos) || pos < 0) {
    return res.status(400).send("Données invalides.");
  }

  ServiceModel.create({ titre, description, position: pos }, (err) => {
    if (err) return res.status(500).send("Erreur serveur.");
    res.redirect('/admin/services');
  });
};

exports.editServicePage = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).send("ID invalide.");

  ServiceModel.findById(id, (err, rows) => {
    if (err) return res.status(500).send("Erreur serveur.");
    if (!rows.length) return res.status(404).send("Service introuvable.");
    const s = rows[0];

    res.send(`
      <!DOCTYPE html><html lang="fr"><head>
        <meta charset="UTF-8"><title>Modifier service</title>
        <link rel="stylesheet" href="/css/style.css">
      </head><body>
        <main class="container">
          <div class="card" style="max-width:900px;margin:30px auto;">
            <h1>Modifier un service</h1>
            <form method="POST" action="/admin/services/edit/${s.id}">
              <label>Position</label>
              <input name="position" type="number" value="${s.position}" min="0" step="1" required>

              <div style="height:12px;"></div>

              <label>Titre</label>
              <input name="titre" required maxlength="100" value="${escapeHtml(s.titre)}">

              <div style="height:12px;"></div>

              <label>Description</label>
              <textarea name="description" required maxlength="2000">${escapeHtml(s.description)}</textarea>

              <div style="height:14px;"></div>

              <button class="btn" type="submit">Enregistrer</button>
              <a class="btn btn-secondary" href="/admin/services">Annuler</a>
            </form>
          </div>
        </main>
      </body></html>
    `);
  });
};

exports.updateService = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { titre, description, position } = req.body;
  const pos = Number.parseInt(position, 10);

  if (!Number.isInteger(id) || !titre || !description || Number.isNaN(pos) || pos < 0) {
    return res.status(400).send("Données invalides.");
  }

  ServiceModel.update(id, { titre, description, position: pos }, (err) => {
    if (err) return res.status(500).send("Erreur serveur.");
    res.redirect('/admin/services');
  });
};

exports.deleteService = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).send("ID invalide.");

  ServiceModel.deleteById(id, (err) => {
    if (err) return res.status(500).send("Erreur serveur.");
    res.redirect('/admin/services');
  });
};

exports.viewServicePage = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).send("ID invalide.");

  ServiceModel.findById(id, (err, rows) => {
    if (err) return res.status(500).send("Erreur serveur.");
    if (!rows.length) return res.status(404).send("Service introuvable.");
    const s = rows[0];

    res.send(`
      <!DOCTYPE html><html lang="fr"><head>
        <meta charset="UTF-8"><title>Détail service</title>
        <link rel="stylesheet" href="/css/style.css">
      </head><body>
        <main class="container">
          <div class="card" style="max-width:1100px;margin:30px auto;">
            <h1>Détail du service</h1>
            <div class="service-grid" style="margin-top:18px;">
              <aside class="service-info">
                <h3>Informations</h3>
                <p><strong>ID :</strong> ${s.id}</p>
                <p><strong>Position :</strong> ${s.position}</p>
                <p><strong>Titre :</strong><br>${escapeHtml(s.titre)}</p>

                <div class="actions" style="margin-top:18px;">
                  <a class="btn btn-secondary" href="/admin/services">Retour</a>
                  <a class="btn" href="/admin/services/edit/${s.id}">Modifier</a>
                  <form method="POST" action="/admin/services/delete/${s.id}" onsubmit="return confirm('Supprimer ?');">
                    <button class="btn btn-danger" type="submit">Supprimer</button>
                  </form>
                </div>
              </aside>

              <section class="service-description">
                <h3>Description complète</h3>
                <p>${escapeHtml(s.description)}</p>
              </section>
            </div>
          </div>
        </main>
      </body></html>
    `);
  });
};

// ===========================
// MESSAGES - suppression
// ===========================

exports.deleteMessage = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).send("ID invalide.");

  MessageModel.deleteById(id, (err) => {
    if (err) return res.status(500).send("Erreur serveur.");
    res.redirect('/admin/messages');
  });
};
