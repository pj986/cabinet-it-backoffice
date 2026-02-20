const { shell, escapeHtml } = require('../utils/html');
const MessageModel = require('../models/MessageModel');

/* =========================
   PAGE ACCUEIL
========================= */
exports.home = async (req, res) => {
  const content = `
    <h1>Bienvenue chez Cabinet IT</h1>
    <p>Expert en développement web et sécurité informatique.</p>
  `;

  const html = await shell('Accueil — Cabinet IT', '', content);
  res.send(html);
};


/* =========================
   PAGE SERVICES
========================= */
exports.services = async (req, res) => {
  const content = `
    <h1>Nos services</h1>
    <ul>
      <li>Développement web</li>
      <li>Cybersécurité</li>
      <li>Audit & conseil IT</li>
    </ul>
  `;

  const html = await shell('Services — Cabinet IT', '', content);
  res.send(html);
};


/* =========================
   PAGE À PROPOS
========================= */
exports.about = async (req, res) => {
  const content = `
    <h1>À propos</h1>
    <p>Cabinet IT accompagne les entreprises dans leur transformation digitale.</p>
  `;

  const html = await shell('À propos — Cabinet IT', '', content);
  res.send(html);
};


/* =========================
   PAGE CONTACT (GET)
========================= */
exports.contact = async (req, res) => {

  const content = `
    <h1>Contact</h1>

    <form method="POST" action="/contact" style="display:flex;flex-direction:column;gap:12px;max-width:400px;">
      
      <label>
        Nom
        <input type="text" name="nom" required>
      </label>

      <label>
        Email
        <input type="email" name="email" required>
      </label>

      <label>
        Message
        <textarea name="message" required></textarea>
      </label>

      <button class="btn" type="submit">Envoyer</button>
    </form>
  `;

  const html = await shell('Contact — Cabinet IT', '', content);
  res.send(html);
};


/* =========================
   ENVOI CONTACT (POST)
========================= */
exports.sendContact = (req, res) => {

  const { nom, email, message } = req.body;

  if (!nom || !email || !message) {
    return res.status(400).send('Tous les champs sont obligatoires.');
  }

  MessageModel.create({ nom, email, message }, (err) => {

    if (err) {
      console.error(err);
      return res.status(500).send('Erreur lors de l\'envoi.');
    }

    // 🔔 Notification temps réel si Socket.io activé
    const io = req.app.get('io');
    if (io) {
      io.emit('newMessage');
    }

    res.redirect('/contact');
  });
};
