const path = require('path');
const MessageModel = require('../models/MessageModel');


const publicRoot = path.join(__dirname, '..', 'views', 'public');

const ServiceModel = require('../models/ServiceModel');


exports.home = (req, res) => {
  res.sendFile(path.join(publicRoot, 'accueil.html'));
};

exports.services = (req, res) => {
  ServiceModel.getAll((err, services) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Erreur serveur.");
    }

    const cards = services.map(s => `
      <div class="card" style="margin-bottom:12px;">
        <h2 style="margin:0 0 8px;">${escapeHtml(s.titre)}</h2>
        <p style="margin:0;">${escapeHtml(s.description)}</p>
      </div>
    `).join('');

    res.send(`<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Services - Cabinet IT</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
<header class="header">
  <div class="container">
    <div class="brand">Cabinet IT</div>
    <nav class="nav">
      <a href="/">Accueil</a>
      <a href="/services">Services</a>
      <a href="/apropos">À propos</a>
      <a href="/contact">Contact</a>
    </nav>
  </div>
</header>

<main class="container">
  <h1>Nos services</h1>
  ${cards || `<div class="card"><p>Aucun service pour le moment.</p></div>`}
</main>
</body>
</html>`);
  });
};

// helper local (si tu ne l'as pas déjà dans ce fichier)
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


exports.about = (req, res) => {
  res.sendFile(path.join(publicRoot, 'apropos.html'));
};

exports.contact = (req, res) => {
  res.sendFile(path.join(publicRoot, 'contact.html'));
};
exports.sendContact = (req, res) => {
  const { nom, email, message } = req.body;

  // Validation serveur (à conserver même si tu valides côté HTML)
  if (!nom || !email || !message) {
    return res.status(400).send("Tous les champs sont obligatoires.");
  }

  if (nom.length < 2 || nom.length > 100) {
    return res.status(400).send("Nom invalide.");
  }

  // Validation email simple
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 100) {
    return res.status(400).send("Email invalide.");
  }

  if (message.length < 5 || message.length > 2000) {
    return res.status(400).send("Message invalide.");
  }

  // Insertion en base
  MessageModel.create({ nom, email, message }, (err, result) => {
    if (err) {
      console.error('Erreur INSERT message:', err.message);
      return res.status(500).send("Erreur serveur lors de l'enregistrement du message.");
    }


  // Pour l’instant : on confirme juste la réception (MySQL à l’étape suivante)
  res.send(`
    <h1>Message envoyé</h1>
    <p>Merci ${nom}, votre message a bien été reçu.</p>
    <a href="/contact">Retour</a>
  `);
});
};

