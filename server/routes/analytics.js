// routes/analytics.js
const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getSalesAnalytics,
  getUserAnalytics,
  getAttendanceAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getDashboardOverview);
router.get('/sales', getSalesAnalytics);
router.get('/users', getUserAnalytics);
router.get('/attendance', getAttendanceAnalytics);

module.exports = router;
