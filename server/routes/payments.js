// routes/payments.js
const express = require('express');
const router = express.Router();
const {
  generateUPIPayment,
  generateQR,
  verifyPayment,
  getPayments,
  approvePayment,
  rejectPayment,
  getUPIDetails,
  getPaymentHistory
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Student and Admin routes
router.post('/generate-upi', generateUPIPayment);
router.post('/generate-qr', generateQR);
router.post('/verify', verifyPayment);
router.get('/upi-details', getUPIDetails);
router.get('/', getPayments);
router.get('/history', getPaymentHistory);
router.get('/status/:id', require('../controllers/paymentController').getPaymentStatus);

// Admin only routes
router.patch('/:id/approve', authorize('admin'), approvePayment);
router.patch('/:id/reject', authorize('admin'), rejectPayment);

module.exports = router;
