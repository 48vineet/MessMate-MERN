// controllers/menuController.js
const Menu = require('../models/Menu');
const DailyMenu = require('../models/DailyMenu');

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

    // Get today's daily menus from DailyMenu collection
    const dailyMenus = await DailyMenu.find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      isAvailable: true,
      isTemplate: { $ne: true } // Exclude templates
    }).sort({ mealType: 1 });

    // Group by meal type and format for frontend
    const groupedMenu = {
      breakfast: {
        items: [],
        price: 0,
        available: false,
        time: '7:00 AM - 10:00 AM'
      },
      lunch: {
        items: [],
        price: 0,
        available: false,
        time: '12:00 PM - 3:00 PM'
      },
      dinner: {
        items: [],
        price: 0,
        available: false,
        time: '7:00 PM - 10:00 PM'
      }
    };

    // Populate the grouped menu with actual daily menu data
    dailyMenus.forEach(menu => {
      if (groupedMenu[menu.mealType]) {
        groupedMenu[menu.mealType] = {
          items: menu.items || [],
          price: menu.price || 0,
          available: menu.isAvailable !== false,
          time: menu.mealType === 'breakfast' ? '7:00 AM - 10:00 AM' :
                menu.mealType === 'lunch' ? '12:00 PM - 3:00 PM' :
                '7:00 PM - 10:00 PM'
        };
      }
    });

    res.status(200).json({
      success: true,
      date: today.toISOString().split('T')[0],
      menu: groupedMenu
    });
  } catch (error) {
    console.error('Get today menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching today\'s menu'
    });
  }
};

// @desc    Get daily menus for admin (by date)
// @route   GET /api/menu/admin/daily
// @access  Private/Admin
exports.getDailyMenus = async (req, res) => {
  try {
    const { date, mealType } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
    const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate() + 1);

    let query = {
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      isAvailable: true // Only show available menus
    };

    // Filter by meal type if provided
    if (mealType) {
      query.mealType = mealType;
    }

    const menus = await DailyMenu.find(query)
      .sort({ mealType: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: menus
    });
  } catch (error) {
    console.error('Get daily menus error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching daily menus'
    });
  }
};

// @desc    Create daily menu
// @route   POST /api/menu/admin/daily
// @access  Private/Admin
exports.createDailyMenu = async (req, res) => {
  try {
    const { date, mealType, items, price, description, isAvailable } = req.body;
    
    // Validate required fields
    if (!date || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'Date and meal type are required'
      });
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one menu item is required'
      });
    }

    // Filter out invalid items
    const validItems = items.filter(item => 
      item && item.name && item.name.trim() !== ''
    );

    if (validItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid menu item is required'
      });
    }

    // Convert date string to Date object
    const menuDate = new Date(date);
    
    // Check if menu already exists for this date and meal type (excluding templates)
    const startOfDay = new Date(menuDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(menuDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingMenu = await DailyMenu.findOne({ 
      date: { $gte: startOfDay, $lte: endOfDay },
      mealType, 
      isTemplate: { $ne: true } 
    });
    
    if (existingMenu) {
      return res.status(400).json({
        success: false,
        message: `Menu for ${mealType} on ${date} already exists`
      });
    }
    
    const menu = await DailyMenu.create({
      date: menuDate,
      mealType,
      items: validItems,
      price: price ? parseFloat(price) : undefined,
      description,
      isAvailable,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Daily menu created successfully',
      data: menu
    });
  } catch (error) {
    console.error('Create daily menu error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating daily menu',
      error: error.message
    });
  }
};

// @desc    Update daily menu
// @route   PUT /api/menu/admin/daily/:id
// @access  Private/Admin
exports.updateDailyMenu = async (req, res) => {
  try {
    const { date, mealType, items, price, description, isAvailable } = req.body;
    
    let menu = await DailyMenu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one menu item is required'
      });
    }

    // Filter out invalid items
    const validItems = items.filter(item => 
      item && item.name && item.name.trim() !== ''
    );

    if (validItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid menu item is required'
      });
    }

    // Convert date string to Date object
    const menuDate = new Date(date);
    
    // Check if another menu exists for the same date and meal type (excluding current menu and templates)
    const startOfDay = new Date(menuDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(menuDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingMenu = await DailyMenu.findOne({ 
      date: { $gte: startOfDay, $lte: endOfDay },
      mealType, 
      _id: { $ne: req.params.id },
      isTemplate: { $ne: true }
    });
    
    if (existingMenu) {
      return res.status(400).json({
        success: false,
        message: `Menu for ${mealType} on ${date} already exists`
      });
    }

    menu = await DailyMenu.findByIdAndUpdate(req.params.id, {
      date: menuDate,
      mealType,
      items: validItems,
      price: price ? parseFloat(price) : undefined,
      description,
      isAvailable,
      lastUpdatedBy: req.user.id
    }, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: 'Daily menu updated successfully',
      data: menu
    });
  } catch (error) {
    console.error('Update daily menu error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating daily menu',
      error: error.message
    });
  }
};

// @desc    Update daily menu availability
// @route   PATCH /api/menu/admin/daily/:id/availability
// @access  Private/Admin
exports.updateDailyMenuAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    const menu = await DailyMenu.findByIdAndUpdate(
      req.params.id,
      { 
        isAvailable,
        lastUpdatedBy: req.user.id
      },
      { new: true, runValidators: true }
    );

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Daily menu not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Daily menu availability updated successfully',
      data: {
        id: menu._id,
        mealType: menu.mealType,
        isAvailable: menu.isAvailable
      }
    });
  } catch (error) {
    console.error('Update daily menu availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating daily menu availability'
    });
  }
};

// @desc    Delete daily menu
// @route   DELETE /api/menu/admin/daily/:id
// @access  Private/Admin
exports.deleteDailyMenu = async (req, res) => {
  try {
    const menu = await DailyMenu.findById(req.params.id);
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Daily menu not found'
      });
    }

    // Check if it's a template (shouldn't be deleted via this endpoint)
    if (menu.isTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete template via daily menu endpoint'
      });
    }

    await DailyMenu.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Daily menu deleted successfully'
    });
  } catch (error) {
    console.error('Delete daily menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting daily menu'
    });
  }
};

// @desc    Get all menu templates
// @route   GET /api/menu/templates
// @access  Private/Admin
exports.getMenuTemplates = async (req, res) => {
  try {
    const templates = await DailyMenu.find({ isTemplate: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get menu templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching menu templates',
      error: error.message
    });
  }
};

// @desc    Create menu template
// @route   POST /api/menu/templates
// @access  Private/Admin
exports.createMenuTemplate = async (req, res) => {
  try {
    const { name, description, mealType, items, estimatedPrice, category } = req.body;
    
    const template = await DailyMenu.create({
      name,
      description,
      mealType,
      items,
      estimatedPrice,
      category,
      isTemplate: true,
      date: new Date(), // Set a default date for templates
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Menu template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Create menu template error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating menu template',
      error: error.message
    });
  }
};

// @desc    Update menu template
// @route   PUT /api/menu/templates/:id
// @access  Private/Admin
exports.updateMenuTemplate = async (req, res) => {
  try {
    const { name, description, mealType, items, estimatedPrice, category } = req.body;
    
    let template = await DailyMenu.findById(req.params.id);
    if (!template || !template.isTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Menu template not found'
      });
    }

    template = await DailyMenu.findByIdAndUpdate(req.params.id, {
      name,
      description,
      mealType,
      items,
      estimatedPrice,
      category,
      lastUpdatedBy: req.user.id
    }, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: 'Menu template updated successfully',
      data: template
    });
  } catch (error) {
    console.error('Update menu template error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating menu template',
      error: error.message
    });
  }
};

// @desc    Delete menu template
// @route   DELETE /api/menu/templates/:id
// @access  Private/Admin
exports.deleteMenuTemplate = async (req, res) => {
  try {
    const template = await DailyMenu.findById(req.params.id);
    
    if (!template || !template.isTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Menu template not found'
      });
    }

    await DailyMenu.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Menu template deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting menu template'
    });
  }
};

// @desc    Create menu item (simplified for testing)
// @route   POST /api/menu/quick-add
// @access  Private/Admin
exports.quickAddMenuItem = async (req, res) => {
  try {
    const { name, description, mealType, price, icon } = req.body;
    
    // Validate required fields
    if (!name || !description || !mealType || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, mealType, and price are required'
      });
    }

    // Set availability for today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const menuItem = await Menu.create({
      name,
      description,
      mealType,
      category: 'main-course',
      price: parseFloat(price),
      icon: icon || '🍽️',
      availableFrom: startOfDay,
      availableUntil: endOfDay,
      createdBy: req.user.id,
      ratings: { average: 4.5, count: 0 }
    });

    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      data: menuItem
    });
  } catch (error) {
    console.error('Quick add menu item error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating menu item',
      error: error.message
    });
  }
};

// @desc    Search menus
// @route   GET /api/menu/search
// @access  Private
exports.searchMenus = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchQuery = {
      $or: [
        // Search in meal items
        { 'meals.items': { $regex: q, $options: 'i' } },
        // Search in meal types
        { 'meals.type': { $regex: q, $options: 'i' } },
        // Search in date (if it's a date string)
        { date: { $regex: q, $options: 'i' } }
      ]
    };

    const menus = await Menu.find(searchQuery)
      .sort({ date: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        menus,
        total: menus.length
      }
    });
  } catch (error) {
    console.error('Menu search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during menu search'
    });
  }
};
  
module.exports = exports;
