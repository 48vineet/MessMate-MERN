// routes/analytics.js
const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getSalesAnalytics,
  getUserAnalytics,
  getAttendanceAnalytics,
  getMenuAnalytics,
  getAdminStats,
  getRecentActivity,
  getAlerts,
  getChartsData,
  getAnalytics,
  getAnalyticsExport
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Main analytics route for dashboard
router.get('/', authorize('admin'), getAnalytics);
router.get('/export', authorize('admin'), getAnalyticsExport);

// Admin only routes
router.get('/overview', authorize('admin'), getDashboardOverview);
router.get('/sales', authorize('admin'), getSalesAnalytics);
router.get('/users', authorize('admin'), getUserAnalytics);
router.get('/attendance', authorize('admin'), getAttendanceAnalytics);
router.get('/menu', authorize('admin'), getMenuAnalytics);

// Admin dashboard routes (with /admin prefix)
router.get('/admin/stats', authorize('admin'), getAdminStats);
router.get('/admin/recent-activity', authorize('admin'), getRecentActivity);
router.get('/admin/alerts', authorize('admin'), getAlerts);
router.get('/admin/charts', authorize('admin'), getChartsData);

// Frontend expected routes (without /admin prefix)
router.get('/stats', authorize('admin'), getAdminStats);
router.get('/recent-activity', authorize('admin'), getRecentActivity);
router.get('/alerts', authorize('admin'), getAlerts);
router.get('/charts', authorize('admin'), getChartsData);

module.exports = router;
