// routes/settings.js
const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  testNotification
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Get system settings
router.get('/', getSettings);

// Update system settings
router.put('/', updateSettings);

// Test notification
router.post('/test-notification', testNotification);

module.exports = router; 