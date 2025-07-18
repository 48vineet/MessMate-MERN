// controllers/inventoryController.js
const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private/Admin
exports.getInventoryItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { status: 'active' };
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.stockStatus) {
      // Filter by stock status
      switch (req.query.stockStatus) {
        case 'low':
          query.$expr = { $lte: ['$currentStock', '$reorderLevel'] };
          break;
        case 'out-of-stock':
          query.currentStock = 0;
          break;
        case 'overstock':
          query.$expr = { $gte: ['$currentStock', '$maximumStock'] };
          break;
      }
    }
    
    if (req.query.search) {
      query.$or = [
        { itemName: { $regex: req.query.search, $options: 'i' } },
        { itemCode: { $regex: req.query.search, $options: 'i' } },
        { 'supplier.name': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const inventoryItems = await Inventory.find(query)
      .populate('createdBy', 'name')
      .populate('lastUpdatedBy', 'name')
      .sort({ itemName: 1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Inventory.countDocuments(query);

    // Get stock status summary
    const stockSummary = await Inventory.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          lowStock: {
            $sum: {
              $cond: [{ $lte: ['$currentStock', '$reorderLevel'] }, 1, 0]
            }
          },
          outOfStock: {
            $sum: {
              $cond: [{ $eq: ['$currentStock', 0] }, 1, 0]
            }
          },
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: inventoryItems.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      summary: stockSummary[0] || {
        totalItems: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0
      },
      data: inventoryItems
    });
  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching inventory items'
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private/Admin
exports.getInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('lastUpdatedBy', 'name')
      .populate('stockMovements.handledBy', 'name');

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: inventoryItem
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching inventory item'
    });
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private/Admin
exports.createInventoryItem = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const inventoryItem = await Inventory.create(req.body);

    // Check and create alerts for new item
    await inventoryItem.checkAndCreateAlerts();

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: inventoryItem
    });
  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating inventory item',
      error: error.message
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private/Admin
exports.updateInventoryItem = async (req, res) => {
  try {
    let inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    req.body.lastUpdatedBy = req.user.id;

    inventoryItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Check and create alerts after update
    await inventoryItem.checkAndCreateAlerts();

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: inventoryItem
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating inventory item',
      error: error.message
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
exports.deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting inventory item'
    });
  }
};

// @desc    Add stock
// @route   POST /api/inventory/:id/add-stock
// @access  Private/Admin
exports.addStock = async (req, res) => {
  try {
    const { quantity, reason, reference } = req.body;

    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await inventoryItem.addStock(quantity, reason, req.user.id, reference);

    res.status(200).json({
      success: true,
      message: 'Stock added successfully',
      data: {
        itemName: inventoryItem.itemName,
        previousStock: inventoryItem.stockMovements[inventoryItem.stockMovements.length - 1].previousStock,
        addedQuantity: quantity,
        newStock: inventoryItem.currentStock
      }
    });
  } catch (error) {
    console.error('Add stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding stock'
    });
  }
};

// @desc    Consume stock
// @route   POST /api/inventory/:id/consume-stock
// @access  Private/Admin
exports.consumeStock = async (req, res) => {
  try {
    const { quantity, reason, reference } = req.body;

    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await inventoryItem.consumeStock(quantity, reason, req.user.id, reference);

    res.status(200).json({
      success: true,
      message: 'Stock consumed successfully',
      data: {
        itemName: inventoryItem.itemName,
        previousStock: inventoryItem.stockMovements[inventoryItem.stockMovements.length - 1].previousStock,
        consumedQuantity: quantity,
        newStock: inventoryItem.currentStock
      }
    });
  } catch (error) {
    console.error('Consume stock error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error consuming stock'
    });
  }
};

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts
// @access  Private/Admin
exports.getLowStockAlerts = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      status: 'active',
      $expr: { $lte: ['$currentStock', '$reorderLevel'] }
    }).select('itemName currentStock reorderLevel unit category');

    const outOfStockItems = await Inventory.find({
      status: 'active',
      currentStock: 0
    }).select('itemName unit category');

    const expiringItems = await Inventory.find({
      status: 'active',
      expiryDate: {
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    }).select('itemName expiryDate unit category');

    res.status(200).json({
      success: true,
      alerts: {
        lowStock: lowStockItems,
        outOfStock: outOfStockItems,
        expiringSoon: expiringItems
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching alerts'
    });
  }
};

module.exports = exports;
