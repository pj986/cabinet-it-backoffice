function requireAdmin(req, res, next) {

  if (!req.session.admin) {

    // Sauvegarde uniquement si pas déjà définie
    if (!req.session.redirectAfterLogin) {
      req.session.redirectAfterLogin = req.originalUrl;
    }

    return res.redirect('/auth/login');
  }

  // Gestion expiration
  const now = Date.now();
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  if (req.session.lastActivity && (now - req.session.lastActivity > SESSION_TIMEOUT)) {

    req.session.destroy(() => {
      return res.redirect('/auth/login?expired=1');
    });

    return;
  }

  req.session.lastActivity = now;

  next();
}

module.exports = { requireAdmin };
