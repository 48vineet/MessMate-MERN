// routes/reports.js
const express = require('express');
const router = express.Router();
const {
  generateReport,
  getReportsHistory,
  downloadReport,
  scheduleReport,
  downloadUserReport
} = require('../controllers/reportsController');
const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);
router.use(authorize('admin')); // Only admins can access reports

// Report generation and management
router.post('/generate', generateReport);
router.get('/history', getReportsHistory);
router.get('/users/download', downloadUserReport);
router.get('/:id/download', downloadReport);
router.post('/schedule', scheduleReport);

module.exports = router; 