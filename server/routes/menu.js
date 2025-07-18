// routes/menu.js
const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateAvailability,
  getTodayMenu
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getMenuItems);
router.get('/today', getTodayMenu);
router.get('/:id', getMenuItem);

// Protected routes
router.use(protect);

// Admin only routes
router.post('/', authorize('admin'), createMenuItem);
router.put('/:id', authorize('admin'), updateMenuItem);
router.delete('/:id', authorize('admin'), deleteMenuItem);
router.patch('/:id/availability', authorize('admin'), updateAvailability);

module.exports = router;
