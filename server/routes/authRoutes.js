const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register); // Open for initial setup, usually should be protected or removed

module.exports = router;
