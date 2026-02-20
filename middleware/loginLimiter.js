const rateLimit = require('express-rate-limit');

/*
  Protection anti brute-force pour la route POST /auth/login

  - 5 tentatives maximum
  - Fenêtre de 15 minutes
  - Les connexions réussies ne sont pas comptabilisées
  - Headers standards activés
*/

const loginLimiter = rateLimit({

  // 15 minutes
  windowMs: 15 * 60 * 1000,

  // 5 tentatives max par IP
  max: 5,

  // Ne compte PAS les requêtes réussies (status < 400)
  skipSuccessfulRequests: true,

  // Message renvoyé si limite atteinte
  message: `
    <h3>Trop de tentatives de connexion.</h3>
    <p>Veuillez réessayer dans 15 minutes.</p>
  `,

  standardHeaders: true,
  legacyHeaders: false,

  // Log optionnel (utile en debug)
  handler: (req, res) => {
    console.warn(`Brute-force détecté depuis IP: ${req.ip}`);
    res.status(429).send(`
      <h3>Trop de tentatives de connexion.</h3>
      <p>Votre accès est temporairement bloqué pendant 15 minutes.</p>
    `);
  }

});

module.exports = loginLimiter;
