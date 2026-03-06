const express = require('express');
const router = express.Router();

const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');

/* =========================
   CSRF PROTECTION (LOCAL)
========================= */
const csrfProtection = csrf();

/* =========================
   ANTI BRUTE-FORCE LOGIN
========================= */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  skipSuccessfulRequests: true,
  message: `
    <h3>Trop de tentatives.</h3>
    <p>Réessayez dans 15 minutes.</p>
  `,
  standardHeaders: true,
  legacyHeaders: false,
});

/* =========================
   ROUTES
========================= */

// Page login
router.get('/login', csrfProtection, authController.loginPage);

// Traitement login
router.post('/login', loginLimiter, csrfProtection, authController.login);

router.post('/logout', authController.logout);
module.exports = router;