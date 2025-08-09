// controllers/mealsController.js

// @desc    Get meal history for user
// @route   GET /api/meals/history
// @access  Private
exports.getMealHistory = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // For now, return demo data
    const meals = [
      {
        _id: 'demo123',
        mealName: 'Sample Meal',
        mealType: 'lunch',
        status: 'completed',
        date: new Date(),
        bookedAt: new Date(),
        price: 100,
        userRating: 4,
        feedback: 'Good!',
        items: [{ name: 'Rice' }, { name: 'Dal' }]
      },
      {
        _id: 'demo124',
        mealName: 'Breakfast',
        mealType: 'breakfast',
        status: 'completed',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        bookedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        price: 80,
        userRating: 5,
        feedback: 'Excellent!',
        items: [{ name: 'Bread' }, { name: 'Eggs' }]
      }
    ];

    res.json({
      success: true,
      data: {
        meals,
        total: meals.length,
        range,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in getMealHistory:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch meal history' 
    });
  }
};

// @desc    Get recent meals for user
// @route   GET /api/meals/recent
// @access  Private
exports.getRecentMeals = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    
    // For now, return demo data
    res.json({
      success: true,
      meals: [
        {
          _id: 'recent1',
          mealName: 'Recent Meal 1',
          mealType: 'breakfast',
          status: 'completed',
          date: new Date(),
          bookedAt: new Date(),
          price: 80,
          userRating: 5,
          feedback: 'Excellent!',
          items: [{ name: 'Bread' }, { name: 'Eggs' }]
        },
        {
          _id: 'recent2',
          mealName: 'Recent Meal 2',
          mealType: 'dinner',
          status: 'completed',
          date: new Date(),
          bookedAt: new Date(),
          price: 120,
          userRating: 4,
          feedback: 'Very good!',
          items: [{ name: 'Chicken' }, { name: 'Rice' }]
        }
      ]
    });
  } catch (error) {
    console.error('Error in getRecentMeals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent meals' });
  }
};

// @desc    Get last completed meal
// @route   GET /api/meals/last-completed
// @access  Private
exports.getLastCompletedMeal = async (req, res) => {
  try {
    // For now, return demo data
    const lastMeal = {
      _id: 'last1',
      mealName: 'South Indian Thali',
      mealType: 'lunch',
      status: 'completed',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      bookedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      price: 100,
      userRating: null, // No rating yet
      feedback: null,
      items: [
        { name: 'Idli', icon: '🍛' },
        { name: 'Sambar', icon: '🥘' },
        { name: 'Chatni', icon: '🥣' }
      ]
    };

    res.json({
      success: true,
      meal: lastMeal
    });
  } catch (error) {
    console.error('Error in getLastCompletedMeal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch last completed meal' 
    });
  }
};
