const express = require('express');
const router = express.Router();

const publicController = require('../controllers/publicController');

// Pages publiques
router.get('/', publicController.home);
router.get('/services', publicController.services);
router.get('/apropos', publicController.about);
router.get('/contact', publicController.contact);
router.post('/contact', publicController.sendContact);

// (La route POST /contact viendra juste après, quand on fera le formulaire)
module.exports = router;

