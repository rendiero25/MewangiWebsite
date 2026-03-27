const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, getMe, resendVerification } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);
router.post('/resend-verification', protect, resendVerification);

module.exports = router;
