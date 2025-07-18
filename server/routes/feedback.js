// routes/feedback.js
const express = require('express');
const router = express.Router();
const {
  getAllFeedback,
  getFeedback,
  createFeedback,
  respondToFeedback,
  resolveFeedback,
  addHelpfulVote,
  getFeedbackStats
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Student and Admin routes
router.get('/', getAllFeedback);
router.get('/:id', getFeedback);
router.post('/', createFeedback);
router.post('/:id/vote', addHelpfulVote);

// Admin only routes
router.get('/admin/stats', authorize('admin'), getFeedbackStats);
router.post('/:id/respond', authorize('admin'), respondToFeedback);
router.patch('/:id/resolve', authorize('admin'), resolveFeedback);

module.exports = router;
