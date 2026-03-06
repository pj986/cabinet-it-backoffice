const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf();

const publicController = require('../controllers/publicController');

router.get('/', publicController.home);
router.get('/services', publicController.services);
router.get('/apropos', publicController.about);

router.get('/contact', csrfProtection, publicController.contact);
router.post('/contact', csrfProtection, publicController.sendContact);

module.exports = router;