const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/register (admin only)
router.post('/register', protect, authorize('admin'), authController.register);

// GET /api/auth/me
router.get('/me', protect, authController.getMe);

// GET /api/auth/users (admin only)
router.get('/users', protect, authorize('admin'), authController.getAllUsers);

module.exports = router;
