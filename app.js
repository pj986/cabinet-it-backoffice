require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csurf');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

require('./config/db');

const app = express();

/* =========================
   SÉCURITÉ BAS NIVEAU
========================= */

// Supprime header X-Powered-By
app.disable('x-powered-by');

// Logs HTTP
app.use(morgan('combined'));

// Rate limit global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

/* =========================
   HELMET (HEADERS SÉCURITÉ)
========================= */

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: [
  "'self'",
  "https://cdn.jsdelivr.net"
],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

/* =========================
   BODY PARSER (AVEC LIMITE)
========================= */

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* =========================
   STATIC FILES
========================= */

app.use(express.static(path.join(__dirname, 'public')));

/* =========================
   SESSION (AVANT CSRF)
========================= */

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 minutes
    },
  })
);

/* =========================
   CSRF (NON GLOBAL)
========================= */

const csrfProtection = csrf();
app.set('csrfProtection', csrfProtection);

/* =========================
   ROUTES
========================= */

app.use('/', require('./routes/publicRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/auth', require('./routes/authRoutes'));

/* =========================
   404
========================= */

app.use((req, res) => {
  res.status(404).send('Page introuvable');
});

/* =========================
   ERREURS GLOBAL
========================= */

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Formulaire invalide ou session expirée.');
  }

  console.error('[SERVER ERROR]', err);
  res.status(500).send('Erreur serveur');
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});