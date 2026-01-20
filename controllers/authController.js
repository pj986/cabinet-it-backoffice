const path = require('path');
const bcrypt = require('bcrypt');
const AdminModel = require('../models/AdminModel');

const adminViewsRoot = path.join(__dirname, '..', 'views', 'admin');

exports.loginPage = (req, res) => {
  res.sendFile(path.join(adminViewsRoot, 'login.html'));
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email et mot de passe obligatoires.");
  }

  AdminModel.findByEmail(email, async (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Erreur serveur.");
    }

    if (!rows || rows.length === 0) {
      return res.status(401).send("Identifiants invalides.");
    }

    const admin = rows[0];
    const ok = await bcrypt.compare(password, admin.password);

    if (!ok) {
      return res.status(401).send("Identifiants invalides.");
    }

    // On “loge” l’admin en session
    req.session.admin = { id: admin.id, email: admin.email };
    return res.redirect('/admin/messages');
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
