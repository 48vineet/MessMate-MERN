// routes/bookings.js
const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  addFeedback,
  quickBook,
  getCurrentQR,
  testBookings,
  testQRGeneration,
  debugBookings,
  testCreateBooking,
  testWallet,
  searchBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// Test routes (no auth required)
router.get('/test', testBookings);
router.get('/test-qr', testQRGeneration);
router.get('/test-wallet', testWallet);
router.post('/test-create', testCreateBooking);

// Public routes
router.get('/current-qr', getCurrentQR);

// Protected routes
router.use(protect);

// User routes
router.post('/', createBooking);
router.post('/quick-book', quickBook);
router.get('/my-bookings', getBookings);
router.get('/search', searchBookings); // Add search route
router.get('/:id', getBooking);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', cancelBooking);
router.post('/:id/feedback', addFeedback);

// Admin routes
router.get('/', authorize('admin'), getBookings);
router.get('/debug', authorize('admin'), debugBookings);

module.exports = router;
