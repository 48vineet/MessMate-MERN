// routes/users.js
const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  addMoney,
  getUserStats,
  updateUserStatus,
  bulkUserAction
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Public user routes (authenticated users)
router.get('/me', getUser);
router.put('/me', updateUser);
router.get('/stats', getUserStats); // Add this route for current user stats
router.get('/:id/stats', getUserStats);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.post('/:id/wallet/add', addMoney);

// Admin user management routes
router.patch('/:id/status', authorize('admin'), updateUserStatus);
router.patch('/bulk-action', authorize('admin'), bulkUserAction);

module.exports = router;
