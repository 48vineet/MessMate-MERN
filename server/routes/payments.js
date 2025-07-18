// routes/payments.js
const express = require('express');
const router = express.Router();
const {
  generateUPIPayment,
  verifyPayment,
  getPayments,
  approvePayment,
  rejectPayment,
  getUPIDetails
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Student and Admin routes
router.post('/generate-upi', generateUPIPayment);
router.post('/verify', verifyPayment);
router.get('/upi-details', getUPIDetails);
router.get('/', getPayments);

// Admin only routes
router.patch('/:id/approve', authorize('admin'), approvePayment);
router.patch('/:id/reject', authorize('admin'), rejectPayment);

module.exports = router;
