// routes/bookings.js
const express = require('express');
const router = express.Router();
const {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  addFeedback
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Student and Admin routes
router.get('/', getBookings);
router.get('/:id', getBooking);
router.post('/', createBooking);
router.delete('/:id', cancelBooking);
router.post('/:id/feedback', addFeedback);

// Admin only routes
router.patch('/:id/status', authorize('admin'), updateBookingStatus);

module.exports = router;
