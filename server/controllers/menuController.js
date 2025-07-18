// controllers/menuController.js
const Menu = require('../models/Menu');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { status: 'active' };
    
    if (req.query.mealType) {
      query.mealType = req.query.mealType;
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.isVegetarian !== undefined) {
      query['dietary.isVegetarian'] = req.query.isVegetarian === 'true';
    }
    
    if (req.query.isAvailable !== undefined) {
      query.isAvailable = req.query.isAvailable === 'true';
    }
    
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { ingredients: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseInt(req.query.maxPrice);
    }

    // Sort options
    let sort = {};
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price-low':
          sort.price = 1;
          break;
        case 'price-high':
          sort.price = -1;
          break;
        case 'rating':
          sort['ratings.average'] = -1;
          break;
        case 'popular':
          sort['stats.totalOrders'] = -1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    const menuItems = await Menu.find(query)
      .populate('createdBy', 'name')
      .sort(sort)
      .limit(limit)
      .skip(startIndex);

    const total = await Menu.countDocuments(query);

    res.status(200).json({
      success: true,
      count: menuItems.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: menuItems
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching menu items'
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching menu item'
    });
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Admin
exports.createMenuItem = async (req, res) => {
  try {
    // Add user to body
    req.body.createdBy = req.user.id;

    const menuItem = await Menu.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating menu item',
      error: error.message
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
exports.updateMenuItem = async (req, res) => {
  try {
    let menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    req.body.lastUpdatedBy = req.user.id;

    menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await Menu.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting menu item'
    });
  }
};

// @desc    Update menu item availability
// @route   PATCH /api/menu/:id/availability
// @access  Private/Admin
exports.updateAvailability = async (req, res) => {
  try {
    const { isAvailable, currentQuantity } = req.body;

    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      { 
        isAvailable,
        currentQuantity,
        lastUpdatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        id: menuItem._id,
        name: menuItem.name,
        isAvailable: menuItem.isAvailable,
        currentQuantity: menuItem.currentQuantity
      }
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating availability'
    });
  }
};

// @desc    Get today's menu
// @route   GET /api/menu/today
// @access  Public
exports.getTodayMenu = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const menuItems = await Menu.find({
      status: 'active',
      availableFrom: { $lte: endOfDay },
      availableUntil: { $gte: startOfDay }
    }).sort({ mealType: 1, name: 1 });

    // Group by meal type
    const groupedMenu = {
      breakfast: menuItems.filter(item => item.mealType === 'breakfast'),
      lunch: menuItems.filter(item => item.mealType === 'lunch'),
      dinner: menuItems.filter(item => item.mealType === 'dinner'),
      snacks: menuItems.filter(item => item.mealType === 'snacks')
    };

    res.status(200).json({
      success: true,
      date: today.toISOString().split('T')[0],
      data: groupedMenu
    });
  } catch (error) {
    console.error('Get today menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching today\'s menu'
    });
  }
};

module.exports = exports;
