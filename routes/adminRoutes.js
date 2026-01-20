const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const requireAuth = require('../middleware/authMiddleware');

router.get('/messages', requireAuth, adminController.messagesPage);
router.post('/messages/delete/:id', requireAuth, adminController.deleteMessage);

router.get('/services', requireAuth, adminController.servicesPage);
router.get('/services/new', requireAuth, adminController.newServicePage);
router.post('/services/new', requireAuth, adminController.createService);

router.get('/services/edit/:id', requireAuth, adminController.editServicePage);
router.post('/services/edit/:id', requireAuth, adminController.updateService);

router.post('/services/delete/:id', requireAuth, adminController.deleteService);
router.get('/services/view/:id', requireAuth, adminController.viewServicePage);
router.post('/services/move-up/:id', requireAuth, adminController.moveUpService);
router.post('/services/move-down/:id', requireAuth, adminController.moveDownService);
router.post('/services/duplicate/:id', requireAuth, adminController.duplicateService);


module.exports = router;
