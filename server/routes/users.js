// routes/users.js
const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  addMoney,
  getUserStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Public user routes (authenticated users)
router.get('/me', getUser);
router.put('/me', updateUser);
router.get('/:id/stats', getUserStats);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.post('/:id/wallet/add', addMoney);

module.exports = router;
