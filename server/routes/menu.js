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
  getTodayMenu,
  getDailyMenus,
  createDailyMenu,
  updateDailyMenu,
  deleteDailyMenu,
  updateDailyMenuAvailability,
  getMenuTemplates,
  createMenuTemplate,
  updateMenuTemplate,
  deleteMenuTemplate,
  quickAddMenuItem,
  searchMenus
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getMenuItems);
router.get('/today', getTodayMenu);
router.get('/search', searchMenus); // Add search route
router.get('/daily', getDailyMenus); // Public daily menu endpoint

// Admin menu template routes (must come before /:id routes)
router.get('/templates', protect, authorize('admin'), getMenuTemplates);
router.post('/templates', protect, authorize('admin'), createMenuTemplate);
router.put('/templates/:id', protect, authorize('admin'), updateMenuTemplate);
router.delete('/templates/:id', protect, authorize('admin'), deleteMenuTemplate);

// Admin daily menu management routes
router.get('/admin/daily', protect, authorize('admin'), getDailyMenus);
router.post('/admin/daily', protect, authorize('admin'), createDailyMenu);
router.put('/admin/daily/:id', protect, authorize('admin'), updateDailyMenu);
router.delete('/admin/daily/:id', protect, authorize('admin'), deleteDailyMenu);
router.patch('/admin/daily/:id/availability', protect, authorize('admin'), updateDailyMenuAvailability);

router.get('/:id', getMenuItem);

// Protected routes
router.use(protect);

// Admin only routes
router.post('/', authorize('admin'), createMenuItem);
router.post('/quick-add', protect, authorize('admin'), quickAddMenuItem);
router.put('/:id', authorize('admin'), updateMenuItem);
router.delete('/:id', authorize('admin'), deleteMenuItem);
router.patch('/:id/availability', authorize('admin'), updateAvailability);

module.exports = router;
