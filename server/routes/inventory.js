// routes/inventory.js
const express = require('express');
const router = express.Router();
const {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addStock,
  consumeStock,
  getLowStockAlerts
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/', getInventoryItems);
router.get('/alerts', getLowStockAlerts);
router.get('/:id', getInventoryItem);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);
router.post('/:id/add-stock', addStock);
router.post('/:id/consume-stock', consumeStock);

module.exports = router;
