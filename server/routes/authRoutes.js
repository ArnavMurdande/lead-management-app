const express = require('express');
const router = express.Router();
const { login, register, googleLogin } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.post('/google', googleLogin); // New route for Google Auth

module.exports = router;