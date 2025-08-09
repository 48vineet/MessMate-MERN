const express = require('express');
const router = express.Router();
const { 
  getWalletDetails, 
  requestRecharge, 
  getPendingRecharges, 
  approveRecharge, 
  rejectRecharge, 
  getAllWallets, 
  updateWalletSettings,
  generateQRCode
} = require('../controllers/walletController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.get('/details', protect, getWalletDetails);
router.post('/recharge', protect, requestRecharge);
router.post('/generate-qr', protect, generateQRCode);

// Admin routes
router.get('/admin/pending-recharges', protect, authorize('admin'), getPendingRecharges);
router.post('/admin/approve-recharge', protect, authorize('admin'), approveRecharge);
router.post('/admin/reject-recharge', protect, authorize('admin'), rejectRecharge);
router.get('/admin/all-wallets', protect, authorize('admin'), getAllWallets);
router.put('/admin/settings', protect, authorize('admin'), updateWalletSettings);

module.exports = router;
