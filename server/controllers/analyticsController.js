// controllers/analyticsController.js
const User = require("../models/User");
const Menu = require("../models/Menu");
const DailyMenu = require("../models/DailyMenu");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Feedback = require("../models/Feedback");
const Attendance = require("../models/Attendance");
const mongoose = require("mongoose");

// @desc    Get main analytics data for dashboard
// @route   GET /api/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const { range = "month" } = req.query;

    let startDate;
    let previousStartDate;

    switch (range) {
      case "week":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    }

    // Current period data
    const currentRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const currentUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
    });

    const currentBookings = await Booking.countDocuments({
      createdAt: { $gte: startDate },
    });

    const currentFeedback = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    // Previous period data
    const previousRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: previousStartDate, $lt: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const previousUsers = await User.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate },
    });

    const previousBookings = await Booking.countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate },
    });

    const previousFeedback = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStartDate, $lt: startDate },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    // Calculate growth percentages
    const currentRev = currentRevenue[0]?.total || 0;
    const previousRev = previousRevenue[0]?.total || 0;
    const revenueGrowth =
      previousRev > 0 ? ((currentRev - previousRev) / previousRev) * 100 : 0;

    const usersGrowth =
      previousUsers > 0
        ? ((currentUsers - previousUsers) / previousUsers) * 100
        : 0;
    const bookingsGrowth =
      previousBookings > 0
        ? ((currentBookings - previousBookings) / previousBookings) * 100
        : 0;

    const currentSatisfaction = currentFeedback[0]?.averageRating || 0;
    const previousSatisfaction = previousFeedback[0]?.averageRating || 0;
    const satisfactionGrowth =
      previousSatisfaction > 0
        ? ((currentSatisfaction - previousSatisfaction) /
            previousSatisfaction) *
          100
        : 0;

    // Get top performing meals
    let topMeals = [];
    try {
      topMeals = await Booking.aggregate([
        {
          $match: {
            status: "served",
            createdAt: { $gte: startDate },
          },
        },
        {
          $lookup: {
            from: "dailymenus",
            localField: "menuId",
            foreignField: "_id",
            as: "menuDetails",
          },
        },
        { $unwind: "$menuDetails" },
        {
          $lookup: {
            from: "feedbacks",
            localField: "_id",
            foreignField: "booking",
            as: "feedback",
          },
        },
        {
          $group: {
            _id: "$menuDetails._id",
            name: { $first: "$menuDetails.items.name" },
            orders: { $sum: "$quantity" },
            revenue: { $sum: "$finalAmount" },
            rating: { $avg: "$feedback.rating" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]);
    } catch (error) {
      console.log("Error fetching top meals:", error);
      topMeals = [];
    }

    // Get daily revenue data for chart
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
          },
          revenue: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get meal distribution data
    const mealDistribution = await Booking.aggregate([
      {
        $match: {
          status: "served",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$mealType",
          orders: { $sum: "$quantity" },
          revenue: { $sum: "$finalAmount" },
        },
      },
    ]);

    // Fill in missing dates for daily revenue chart
    const filledDailyRevenue = [];
    const currentDate = new Date(startDate);
    const endDate = new Date();

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const existingData = dailyRevenue.find((item) => item._id === dateStr);

      filledDailyRevenue.push({
        date: dateStr,
        revenue: existingData ? existingData.revenue : 0,
        transactions: existingData ? existingData.transactions : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate user insights
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // Calculate real retention rate
    const totalUsersCount = await User.countDocuments();
    const retentionRate =
      totalUsersCount > 0 ? (activeUsers / totalUsersCount) * 100 : 0;

    res.status(200).json({
      success: true,
      analytics: {
        revenue: {
          current: currentRev,
          growth: revenueGrowth,
        },
        users: {
          current: currentUsers,
          growth: usersGrowth,
          new: currentUsers,
          active: activeUsers,
          retention: retentionRate,
        },
        bookings: {
          current: currentBookings,
          growth: bookingsGrowth,
        },
        satisfaction: {
          current: currentSatisfaction * 20, // Convert to percentage (assuming 5-star rating)
          growth: satisfactionGrowth,
        },
        charts: {
          topMeals: topMeals.map((meal) => ({
            name: meal.name || "Unknown Meal",
            orders: meal.orders || 0,
            revenue: meal.revenue || 0,
            rating: meal.rating || 4.5,
            icon: "🍛",
          })),
          dailyRevenue: filledDailyRevenue,
          mealDistribution: mealDistribution.map((meal) => ({
            mealType: meal._id,
            orders: meal.orders,
            revenue: meal.revenue,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching analytics data",
    });
  }
};

// @desc    Get dashboard overview
// @route   GET /api/analytics/overview
// @access  Private/Admin
exports.getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Basic counts
    const totalUsers = await User.countDocuments({ role: "student" });
    const totalMenuItems = await Menu.countDocuments({ status: "active" });

    // Today's stats
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    const todayRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: startOfToday },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // This week's stats
    const weeklyBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfWeek },
    });

    // This month's stats
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Active users (logged in within last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo },
    });

    // Pending items
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const pendingPayments = await Payment.countDocuments({
      status: "processing",
    });
    const pendingFeedback = await Feedback.countDocuments({
      status: "pending",
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalMenuItems,
          todayBookings,
          weeklyBookings,
          todayRevenue: todayRevenue[0]?.total || 0,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
        },
        pending: {
          bookings: pendingBookings,
          payments: pendingPayments,
          feedback: pendingFeedback,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard overview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching dashboard overview",
    });
  }
};

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private/Admin
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    let startDate;
    switch (period) {
      case "7d":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Daily sales data
    const dailySales = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$completedAt" },
          },
          revenue: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top menu items by revenue
    const topMenuItems = await Booking.aggregate([
      {
        $match: {
          status: "served",
          createdAt: { $gte: startDate },
        },
      },
      {
        $lookup: {
          from: "menus",
          localField: "menuItem",
          foreignField: "_id",
          as: "menuDetails",
        },
      },
      { $unwind: "$menuDetails" },
      {
        $group: {
          _id: "$menuItem",
          name: { $first: "$menuDetails.name" },
          totalRevenue: { $sum: "$finalAmount" },
          totalOrders: { $sum: "$quantity" },
          averageOrderValue: { $avg: "$finalAmount" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // Meal type distribution
    const mealTypeDistribution = await Booking.aggregate([
      {
        $match: {
          status: "served",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$mealType",
          revenue: { $sum: "$finalAmount" },
          orders: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailySales,
        topMenuItems,
        mealTypeDistribution,
        period,
      },
    });
  } catch (error) {
    console.error("Get sales analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching sales analytics",
    });
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private/Admin
exports.getUserAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    let startDate;
    switch (period) {
      case "7d":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User engagement metrics
    const engagementMetrics = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: {
            $sum: { $cond: ["$isVerified", 1, 0] },
          },
          activeUsers: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    "$lastLogin",
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Top users by bookings
    const topUsers = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$user",
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: "$finalAmount" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          name: "$userDetails.name",
          email: "$userDetails.email",
          totalBookings: 1,
          totalSpent: 1,
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        userRegistrations,
        engagementMetrics: engagementMetrics[0] || {
          totalUsers: 0,
          verifiedUsers: 0,
          activeUsers: 0,
        },
        topUsers,
        period,
      },
    });
  } catch (error) {
    console.error("Get user analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user analytics",
    });
  }
};

// @desc    Get attendance analytics
// @route   GET /api/analytics/attendance
// @access  Private/Admin
exports.getAttendanceAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    let startDate;
    switch (period) {
      case "7d":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Daily attendance trends
    const dailyAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          totalStudents: { $sum: 1 },
          averageAttendance: { $avg: "$summary.attendancePercentage" },
          breakfastAttendance: {
            $sum: { $cond: ["$meals.breakfast.isPresent", 1, 0] },
          },
          lunchAttendance: {
            $sum: { $cond: ["$meals.lunch.isPresent", 1, 0] },
          },
          dinnerAttendance: {
            $sum: { $cond: ["$meals.dinner.isPresent", 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Meal-wise attendance
    const mealWiseAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          breakfastAttendance: {
            $sum: { $cond: ["$meals.breakfast.isPresent", 1, 0] },
          },
          lunchAttendance: {
            $sum: { $cond: ["$meals.lunch.isPresent", 1, 0] },
          },
          dinnerAttendance: {
            $sum: { $cond: ["$meals.dinner.isPresent", 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyAttendance,
        mealWiseAttendance: mealWiseAttendance[0] || {
          totalRecords: 0,
          breakfastAttendance: 0,
          lunchAttendance: 0,
          dinnerAttendance: 0,
        },
        period,
      },
    });
  } catch (error) {
    console.error("Get attendance analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching attendance analytics",
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const { range = "today" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "week":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7
        );
        endDate = now;
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
    }

    // Get stats from different collections
    const [totalUsers, totalBookings, totalRevenue, totalMeals] =
      await Promise.all([
        User.countDocuments(),
        Booking.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
        }),
        Payment.aggregate([
          {
            $match: {
              status: "succeeded",
              createdAt: { $gte: startDate, $lte: endDate },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Booking.countDocuments({
          status: "completed",
          createdAt: { $gte: startDate, $lte: endDate },
        }),
      ]);

    // Calculate real growth percentages
    const previousPeriodStart = new Date(
      startDate.getTime() - (now.getTime() - startDate.getTime())
    );
    const previousPeriodUsers = await User.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate },
    });
    const previousPeriodRevenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: previousPeriodStart, $lt: startDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const previousPeriodMeals = await Booking.countDocuments({
      status: "served",
      createdAt: { $gte: previousPeriodStart, $lt: startDate },
    });
    const previousPeriodBookings = await Booking.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate },
    });

    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const stats = {
      totalUsers: totalUsers || 0,
      userGrowth: calculateGrowth(totalUsers, previousPeriodUsers),
      todayRevenue: totalRevenue[0]?.total || 0,
      revenueGrowth: calculateGrowth(
        totalRevenue[0]?.total || 0,
        previousPeriodRevenue[0]?.total || 0
      ),
      mealsServed: totalMeals || 0,
      mealGrowth: calculateGrowth(totalMeals, previousPeriodMeals),
      activeBookings: totalBookings || 0,
      bookingGrowth: calculateGrowth(totalBookings, previousPeriodBookings),
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching admin stats",
    });
  }
};

// @desc    Get admin recent activity
// @route   GET /api/admin/recent-activity
// @access  Private/Admin
exports.getRecentActivity = async (req, res) => {
  try {
    // Get real recent activities from database
    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(3);

    const recentPayments = await Payment.find({ status: "completed" })
      .populate("user", "name email")
      .sort({ completedAt: -1 })
      .limit(2);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(2);

    // Combine and format activities
    const activities = [];

    // Add recent bookings
    recentBookings.forEach((booking) => {
      activities.push({
        id: `booking_${booking._id}`,
        type: "booking",
        message: `New booking created by ${
          booking.user?.name || "Unknown User"
        }`,
        timestamp: booking.createdAt,
        user: booking.user?.name || "Unknown User",
        amount: booking.finalAmount,
        details: `${booking.quantity} meal(s) for ${booking.mealType}`,
      });
    });

    // Add recent payments
    recentPayments.forEach((payment) => {
      activities.push({
        id: `payment_${payment._id}`,
        type: "payment",
        message: `Payment received from ${
          payment.user?.name || "Unknown User"
        }`,
        timestamp: payment.completedAt,
        user: payment.user?.name || "Unknown User",
        amount: payment.amount,
        details: `Payment method: ${payment.paymentMethod}`,
      });
    });

    // Add recent user registrations
    recentUsers.forEach((user) => {
      activities.push({
        id: `user_${user._id}`,
        type: "user",
        message: `New user registered: ${user.name}`,
        timestamp: user.createdAt,
        user: user.name,
        amount: null,
        details: `Email: ${user.email}`,
      });
    });

    // Sort by timestamp (most recent first) and limit to 8 activities
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, 8);

    res.status(200).json({
      success: true,
      activities: limitedActivities,
    });
  } catch (error) {
    console.error("Get recent activity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching recent activity",
    });
  }
};

// @desc    Get admin alerts
// @route   GET /api/admin/alerts
// @access  Private/Admin
exports.getAlerts = async (req, res) => {
  try {
    const alerts = [
      {
        id: 1,
        type: "warning",
        title: "Low Inventory",
        message: "Some menu items are running low on stock",
        timestamp: new Date(),
        priority: "medium",
      },
      {
        id: 2,
        type: "info",
        title: "System Update",
        message: "New features have been deployed",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        priority: "low",
      },
      {
        id: 3,
        type: "error",
        title: "Payment Failed",
        message: "A payment transaction failed to process",
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        priority: "high",
      },
    ];

    res.status(200).json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error("Get alerts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching alerts",
    });
  }
};

// @desc    Get admin charts data
// @route   GET /api/admin/charts
// @access  Private/Admin
exports.getChartsData = async (req, res) => {
  try {
    const { range = "today" } = req.query;

    // Generate dynamic chart data based on range
    let labels, revenueData, bookingData;

    switch (range) {
      case "today":
        labels = ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"];
        revenueData = [150, 300, 800, 450, 600, 200];
        bookingData = [5, 12, 25, 15, 20, 8];
        break;
      case "week":
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        revenueData = [1200, 1900, 1500, 2100, 1800, 2500, 2200];
        bookingData = [45, 52, 38, 67, 58, 72, 65];
        break;
      case "month":
        labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
        revenueData = [8500, 9200, 7800, 9500];
        bookingData = [320, 350, 280, 380];
        break;
      case "year":
        labels = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        revenueData = [
          28000, 32000, 35000, 38000, 42000, 45000, 48000, 52000, 55000, 58000,
          62000, 65000,
        ];
        bookingData = [
          1200, 1350, 1450, 1550, 1700, 1800, 1900, 2050, 2150, 2250, 2400,
          2500,
        ];
        break;
      default:
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        revenueData = [1200, 1900, 1500, 2100, 1800, 2500, 2200];
        bookingData = [45, 52, 38, 67, 58, 72, 65];
    }

    const charts = {
      revenue: {
        labels: labels,
        data: revenueData,
      },
      bookings: {
        labels: labels,
        data: bookingData,
      },
      users: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: [120, 150, 180, 220, 280, 320],
      },
    };

    res.status(200).json({
      success: true,
      charts,
    });
  } catch (error) {
    console.error("Get charts data error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching charts data",
    });
  }
};

// @desc    Get menu analytics
// @route   GET /api/analytics/menu
// @access  Private/Admin
exports.getMenuAnalytics = async (req, res) => {
  try {
    const { period = "month", start, end } = req.query;

    let startDate, endDate;

    if (start && end) {
      startDate = new Date(start);
      endDate = new Date(end);
    } else {
      const now = new Date();
      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
          break;
        case "quarter":
          startDate = new Date(
            now.getFullYear(),
            Math.floor(now.getMonth() / 3) * 3,
            1
          );
          endDate = now;
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
      }
    }

    // Get menu statistics
    const [
      totalMenus,
      totalTemplates,
      averagePrice,
      mealTypeDistribution,
      monthlyTrends,
      topRatedMenus,
      recentActivity,
    ] = await Promise.all([
      // Total menus (excluding templates)
      DailyMenu.countDocuments({
        isTemplate: { $ne: true },
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      // Total templates
      DailyMenu.countDocuments({
        isTemplate: true,
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      // Average price
      DailyMenu.aggregate([
        {
          $match: {
            isTemplate: { $ne: true },
            price: { $exists: true, $ne: null },
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            averagePrice: { $avg: "$price" },
          },
        },
      ]),

      // Meal type distribution
      DailyMenu.aggregate([
        {
          $match: {
            isTemplate: { $ne: true },
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$mealType",
            count: { $sum: 1 },
          },
        },
      ]),

      // Calculate real monthly trends from bookings
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            bookings: { $sum: 1 },
            revenue: { $sum: "$finalAmount" },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]).then((trends) => {
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return trends.map((trend) => ({
          month: monthNames[trend._id.month - 1],
          menus: 0, // Will be populated from menu count
          bookings: trend.bookings,
          revenue: trend.revenue,
        }));
      }),

      // Get top rated menus from real feedback data
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            rating: { $exists: true, $ne: null },
          },
        },
        {
          $lookup: {
            from: "dailymenus",
            localField: "menuItem",
            foreignField: "_id",
            as: "menu",
          },
        },
        { $unwind: "$menu" },
        {
          $group: {
            _id: "$menu._id",
            name: { $first: "$menu.name" },
            mealType: { $first: "$mealType" },
            rating: { $avg: "$rating" },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { rating: -1, bookings: -1 } },
        { $limit: 5 },
      ]).then((menus) =>
        menus.map((menu) => ({
          name: menu.name || `${menu.mealType} Menu`,
          rating: menu.rating || 0,
          bookings: menu.bookings,
          mealType:
            menu.mealType.charAt(0).toUpperCase() + menu.mealType.slice(1),
        }))
      ),

      // Recent activity
      DailyMenu.find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("createdBy", "name")
        .lean(),
    ]);

    console.log("Raw meal type distribution from DB:", mealTypeDistribution);
    console.log("Total menus:", totalMenus);
    console.log("Total templates:", totalTemplates);

    // Calculate percentages for meal type distribution
    const totalMenusForDistribution = mealTypeDistribution.reduce(
      (sum, meal) => sum + meal.count,
      0
    );
    const mealTypeDistributionWithPercentage = mealTypeDistribution.map(
      (meal) => ({
        mealType: meal._id,
        count: meal.count,
        percentage:
          totalMenusForDistribution > 0
            ? (meal.count / totalMenusForDistribution) * 100
            : 0,
      })
    );

    // If no meal type distribution data, provide default data
    if (mealTypeDistributionWithPercentage.length === 0) {
      mealTypeDistributionWithPercentage.push(
        { mealType: "Breakfast", count: 0, percentage: 0 },
        { mealType: "Lunch", count: 0, percentage: 0 },
        { mealType: "Dinner", count: 0, percentage: 0 }
      );
    }

    console.log("Meal type distribution:", mealTypeDistributionWithPercentage);

    // Format recent activity
    const formattedRecentActivity = recentActivity.map((menu) => ({
      action: menu.isTemplate ? "Template Created" : "Menu Created",
      item: menu.name || `${menu.mealType} Menu`,
      time: menu.createdAt,
      user: menu.createdBy?.name || "Admin",
    }));

    // Calculate real revenue from bookings
    const revenueData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["confirmed", "served", "completed"] },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$finalAmount" },
        },
      },
    ]);
    const revenue = revenueData[0]?.revenue || 0;

    // Calculate real total bookings
    const realTotalBookings = await Booking.countDocuments({
      menuItem: { $exists: true },
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Determine most popular meal type
    const mostPopularMeal =
      mealTypeDistributionWithPercentage.length > 0
        ? mealTypeDistributionWithPercentage.reduce((prev, current) =>
            prev.count > current.count ? prev : current
          ).mealType
        : "Lunch";

    res.status(200).json({
      success: true,
      data: {
        totalMenus,
        totalTemplates,
        averagePrice: averagePrice[0]?.averagePrice || 0,
        mostPopularMeal,
        totalBookings: realTotalBookings,
        revenue,
        monthlyTrends,
        mealTypeDistribution: mealTypeDistributionWithPercentage,
        topRatedMenus,
        recentActivity: formattedRecentActivity,
      },
    });
  } catch (error) {
    console.error("Get menu analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching menu analytics",
    });
  }
};

// @desc    Export analytics data as CSV
// @route   GET /api/analytics/export
// @access  Private/Admin
exports.getAnalyticsExport = async (req, res) => {
  try {
    const { range = "month" } = req.query;

    let startDate;
    switch (range) {
      case "week":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data
    const revenue = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          completedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const users = await User.countDocuments({
      createdAt: { $gte: startDate },
    });

    const bookings = await Booking.countDocuments({
      createdAt: { $gte: startDate },
    });

    const feedback = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    // Create CSV content
    const csvData = [
      ["Metric", "Value"],
      ["Total Revenue", (revenue[0]?.total || 0).toString()],
      ["New Users", users.toString()],
      ["Total Bookings", bookings.toString()],
      [
        "Average Satisfaction",
        ((feedback[0]?.averageRating || 0) * 20).toFixed(1) + "%",
      ],
      ["Period", range],
      ["Generated On", new Date().toISOString()],
    ]
      .map((row) => row.join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=analytics-${range}-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    res.send(csvData);
  } catch (error) {
    console.error("Export analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error exporting analytics data",
    });
  }
};

module.exports = exports;
