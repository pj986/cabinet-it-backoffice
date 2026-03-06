const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const { body, param } = require('express-validator');

const { requireAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

/* =========================
   RATE LIMIT ADMIN
========================= */

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

/* =========================
   MIDDLEWARE GLOBAL ADMIN
========================= */

router.use(requireAdmin);
router.use(adminLimiter);
router.use(csrf());

// Logs admin
router.use((req, res, next) => {
  console.log(
    `[ADMIN] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | User: ${req.session?.admin?.email || 'unknown'}`
  );
  next();
});

/* ================= DASHBOARD ================= */

router.get('/dashboard', adminController.dashboardPage);

/* ================= API ================= */

router.get('/api/unread-count', adminController.getUnreadCount);

/* ================= MESSAGES ================= */

// IMPORTANT : routes fixes AVANT dynamiques

router.get('/messages', adminController.messagesPage);

router.get('/messages/create', adminController.createMessagePage);

router.get(
  '/messages/:id',
  param('id').isInt(),
  adminController.messageDetailPage
);
router.post(
  '/messages/create',
  [
    body('nom').trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('message').trim().isLength({ min: 5 })
  ],
  adminController.createMessage
);
router.post(
  '/messages/:id/read',
  param('id').isInt(),
  adminController.markMessageRead
);

router.post(
  '/messages/:id/delete',
  param('id').isInt(),
  adminController.deleteMessage
);

/* ================= SETTINGS ================= */

router.get('/settings', adminController.settingsPage);

router.post(
  '/settings',
  [
    body('name').trim().isLength({ min: 2 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim().isLength({ min: 6 })
  ],
  adminController.settingsSave
);

/* ================= SERVICES ================= */

router.get('/services', adminController.servicesPage);

router.get('/services/create', adminController.createServicePage);

router.post(
  '/services/create',
  [
    body('title')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Titre trop court'),
    body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description trop courte')
  ],
  adminController.createService
);

router.get(
  '/services/edit/:id',
  param('id').isInt(),
  adminController.editServicePage
);

router.post(
  '/services/edit/:id',
  [
    param('id').isInt(),
    body('title').trim().isLength({ min: 3 }),
    body('description').trim().isLength({ min: 10 })
  ],
  adminController.updateService
);

router.post(
  '/services/delete/:id',
  param('id').isInt(),
  adminController.deleteService
);

module.exports = router;