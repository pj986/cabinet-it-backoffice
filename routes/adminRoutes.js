const express = require('express');
const router = express.Router();

const { requireAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.get('/api/unread-count', requireAdmin, adminController.getUnreadCount);

router.get('/messages', adminController.messagesPage);
router.post('/messages/:id/read', adminController.markMessageRead);
router.post('/messages/:id/delete', adminController.deleteMessage);

router.get('/dashboard', adminController.dashboardPage);

router.get('/settings', adminController.settingsPage);
router.post('/settings', adminController.settingsSave);

module.exports = router;
