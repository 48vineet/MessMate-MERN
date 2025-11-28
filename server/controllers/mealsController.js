// controllers/mealsController.js
const Booking = require("../models/Booking");
const Feedback = require("../models/Feedback");

// @desc    Get meal history for user
// @route   GET /api/meals/history
// @access  Private
exports.getMealHistory = async (req, res) => {
  try {
    const { range = "month" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (range) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch real meal history from database
    const meals = await Booking.find({
      user: req.user._id,
      bookingDate: { $gte: startDate, $lte: now },
      status: { $in: ["served", "completed"] },
    })
      .populate("menuItem", "name items price")
      .sort({ bookingDate: -1 })
      .lean();

    // Format the meals data
    const formattedMeals = meals.map((booking) => ({
      _id: booking._id,
      mealName: booking.menuItem?.name || `${booking.mealType} Meal`,
      mealType: booking.mealType,
      status: booking.status,
      date: booking.bookingDate,
      bookedAt: booking.createdAt,
      price: booking.finalAmount || booking.totalAmount,
      userRating: booking.rating || null,
      feedback: booking.feedback || null,
      items: booking.menuItem?.items || [],
    }));

    res.json({
      success: true,
      data: {
        meals: formattedMeals,
        total: formattedMeals.length,
        range,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in getMealHistory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch meal history",
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

    // Fetch real recent meals from database
    const recentBookings = await Booking.find({
      user: userId,
      status: { $in: ["served", "completed"] },
    })
      .populate("menuItem", "name items price")
      .sort({ bookingDate: -1 })
      .limit(limit)
      .lean();

    // Format the meals data
    const meals = recentBookings.map((booking) => ({
      _id: booking._id,
      mealName: booking.menuItem?.name || `${booking.mealType} Meal`,
      mealType: booking.mealType,
      status: booking.status,
      date: booking.bookingDate,
      bookedAt: booking.createdAt,
      price: booking.finalAmount || booking.totalAmount,
      userRating: booking.rating || null,
      feedback: booking.feedback || null,
      items: booking.menuItem?.items || [],
    }));

    res.json({
      success: true,
      meals,
    });
  } catch (error) {
    console.error("Error in getRecentMeals:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch recent meals" });
  }
};

// @desc    Get last completed meal
// @route   GET /api/meals/last-completed
// @access  Private
exports.getLastCompletedMeal = async (req, res) => {
  try {
    // Fetch real last completed meal from database
    const lastBooking = await Booking.findOne({
      user: req.user._id,
      status: { $in: ["served", "completed"] },
    })
      .populate("menuItem", "name items price")
      .sort({ bookingDate: -1 })
      .lean();

    if (!lastBooking) {
      return res.json({
        success: true,
        meal: null,
      });
    }

    // Format the meal data
    const lastMeal = {
      _id: lastBooking._id,
      mealName: lastBooking.menuItem?.name || `${lastBooking.mealType} Meal`,
      mealType: lastBooking.mealType,
      status: lastBooking.status,
      date: lastBooking.bookingDate,
      bookedAt: lastBooking.createdAt,
      price: lastBooking.finalAmount || lastBooking.totalAmount,
      userRating: lastBooking.rating || null,
      feedback: lastBooking.feedback || null,
      items: lastBooking.menuItem?.items || [],
    };

    res.json({
      success: true,
      meal: lastMeal,
    });
  } catch (error) {
    console.error("Error in getLastCompletedMeal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch last completed meal",
    });
  }
};
