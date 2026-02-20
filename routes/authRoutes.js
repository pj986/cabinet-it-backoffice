const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter');

router.get('/login', authController.loginPage);

// 🔐 Protection brute-force uniquement sur POST login
router.post('/login', loginLimiter, authController.login);

router.post('/logout', authController.logout);

module.exports = router;
