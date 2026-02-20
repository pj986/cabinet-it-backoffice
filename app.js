require('dotenv').config();

const express = require('express');
const path = require('path');
require('./config/db');

const session = require('express-session');
const csrf = require('csurf'); // ← IMPORTANT

const app = express();

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// SESSION (DOIT être avant CSRF)
app.use(session({
  secret: process.env.SESSION_SECRET || 'phrase-secrete-longue',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 30 * 60 * 1000
  }
}));

// 🔐 CSRF DOIT être après session
app.use(csrf());

// Routes
app.use('/', require('./routes/publicRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/auth', require('./routes/authRoutes'));

// 404
app.use((req, res) => {
  res.status(404).send('Page introuvable');
});

// Gestion erreur CSRF
app.use((err, req, res, next) => {

  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Formulaire invalide ou session expirée.');
  }

  console.error(err);
  res.status(500).send('Erreur serveur');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
