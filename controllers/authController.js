const bcrypt = require('bcrypt');
const AdminModel = require('../models/AdminModel');

/* =========================
   PAGE LOGIN
========================= */
exports.loginPage = (req, res) => {

  const expired = req.query.expired === '1';
  const error = req.query.error === '1';

  let message = '';

  if (expired) {
    message = '<div class="alert">Session expirée (30 min d’inactivité).</div>';
  }

  if (error) {
    message = '<div class="alert">Email ou mot de passe incorrect.</div>';
  }

  const token = req.csrfToken ? req.csrfToken() : '';

  res.send(`
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <title>Cabinet IT - Admin</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script src="https://cdn.jsdelivr.net/npm/tsparticles@2/tsparticles.bundle.min.js"></script>

    <style>
      * { box-sizing: border-box; }

      body {
        margin: 0;
        height: 100vh;
        font-family: 'Segoe UI', sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        background: #0f2027;
      }

      #tsparticles {
        position: fixed;
        width: 100%;
        height: 100%;
        z-index: 0;
      }

      .glass-card {
        position: relative;
        z-index: 1;
        width: 380px;
        padding: 45px 35px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(15px);
        border: 1px solid rgba(255,255,255,0.2);
        box-shadow: 0 25px 50px rgba(0,0,0,0.4);
        color: white;
        text-align: center;
        animation: fadeIn 1s ease forwards;
        opacity: 0;
      }

      @keyframes fadeIn {
        to { opacity: 1; }
      }

      h2 { margin-bottom: 25px; }

      input {
        width: 100%;
        padding: 12px;
        margin-bottom: 15px;
        border-radius: 8px;
        border: none;
        outline: none;
        font-size: 14px;
      }

      input:focus {
        box-shadow: 0 0 0 2px #00c6ff;
      }

      button {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: none;
        background: linear-gradient(135deg, #00c6ff, #0072ff);
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
      }

      button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
      }

      .alert {
        background: rgba(255,0,0,0.2);
        border: 1px solid rgba(255,0,0,0.4);
        padding: 8px;
        border-radius: 6px;
        margin-bottom: 15px;
        font-size: 13px;
      }

      .brand {
        font-size: 13px;
        letter-spacing: 2px;
        margin-bottom: 10px;
        opacity: 0.8;
      }
    </style>
  </head>

  <body>

    <div id="tsparticles"></div>

    <div class="glass-card">
      <div class="brand">CABINET IT • ADMIN</div>
      <h2>Connexion sécurisée</h2>

      ${message}

      <form method="POST" action="/auth/login">
        ${token ? `<input type="hidden" name="_csrf" value="${token}" />` : ''}
        <input type="email" name="email" placeholder="Adresse email" required />
        <input type="password" name="password" placeholder="Mot de passe" required />
        <button type="submit">Se connecter</button>
      </form>
    </div>

    <script>
      tsParticles.load("tsparticles", {
        background: { color: { value: "#0f2027" } },
        particles: {
          number: { value: 60 },
          color: { value: "#00c6ff" },
          shape: { type: "circle" },
          opacity: { value: 0.5 },
          size: { value: 3 },
          move: {
            enable: true,
            speed: 1,
            outModes: { default: "out" }
          },
          links: {
            enable: true,
            distance: 150,
            color: "#00c6ff",
            opacity: 0.3,
            width: 1
          }
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" }
          },
          modes: {
            repulse: { distance: 100 }
          }
        }
      });
    </script>

  </body>
  </html>
  `);
};



/* =========================
   LOGIN
========================= */
exports.login = (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.redirect('/auth/login?error=1');
  }

  AdminModel.findByEmail(email, async (err, admin) => {

    if (err) {
      console.error(err);
      return res.status(500).send('Erreur serveur');
    }

    if (!admin) {
      return res.redirect('/auth/login?error=1');
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.redirect('/auth/login?error=1');
    }

    req.session.regenerate((err) => {

      if (err) {
        console.error(err);
        return res.status(500).send('Erreur session');
      }

      req.session.admin = {
        id: admin.id,
        email: admin.email
      };

      req.session.lastActivity = Date.now();

      // 🔥 IMPORTANT : on stocke puis on nettoie
      const redirectTo = req.session.redirectAfterLogin || '/admin/dashboard';

      req.session.redirectAfterLogin = null;

      res.redirect(redirectTo);
    });

  });
};



/* =========================
   LOGOUT
========================= */
exports.logout = (req, res) => {

  req.session.destroy((err) => {

    if (err) {
      console.error(err);
      return res.status(500).send('Erreur lors de la déconnexion');
    }

    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
};
