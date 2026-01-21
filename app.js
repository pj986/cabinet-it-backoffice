require('dotenv').config();

const express = require('express');
const path = require('path');
require('./config/db');

const session = require('express-session');


const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Fichiers statiques (css, js front, images)
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'change-moi-en-une-phrase-longue',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true
    // secure: true, // à activer seulement en HTTPS
  }
}));


// Routes
const publicRoutes = require('./routes/publicRoutes');
app.use('/', publicRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Lancement serveur
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

