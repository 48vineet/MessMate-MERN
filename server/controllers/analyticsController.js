// controllers/analyticsController.js
const User = require('../models/User');
const Menu = require('../models/Menu');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');

// @desc    Get dashboard overview
// @route   GET /api/analytics/overview
// @access  Private/Admin
exports.getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Basic counts
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalMenuItems = await Menu.countDocuments({ status: 'active' });
    
    // Today's stats
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    
    const todayRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startOfToday }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // This week's stats
    const weeklyBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    // This month's stats
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Active users (logged in within last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo }
    });

    // Pending items
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const pendingPayments = await Payment.countDocuments({ status: 'processing' });
    const pendingFeedback = await Feedback.countDocuments({ status: 'pending' });

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
          monthlyRevenue: monthlyRevenue[0]?.total || 0
        },
        pending: {
          bookings: pendingBookings,
          payments: pendingPayments,
          feedback: pendingFeedback
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard overview'
    });
  }
};

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private/Admin
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Daily sales data
    const dailySales = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$completedAt" }
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top menu items by revenue
    const topMenuItems = await Booking.aggregate([
      {
        $match: {
          status: 'served',
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'menus',
          localField: 'menuItem',
          foreignField: '_id',
          as: 'menuDetails'
        }
      },
      { $unwind: '$menuDetails' },
      {
        $group: {
          _id: '$menuItem',
          name: { $first: '$menuDetails.name' },
          totalRevenue: { $sum: '$finalAmount' },
          totalOrders: { $sum: '$quantity' },
          averageOrderValue: { $avg: '$finalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Meal type distribution
    const mealTypeDistribution = await Booking.aggregate([
      {
        $match: {
          status: 'served',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$mealType',
          revenue: { $sum: '$finalAmount' },
          orders: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailySales,
        topMenuItems,
        mealTypeDistribution,
        period
      }
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sales analytics'
    });
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private/Admin
exports.getUserAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // User engagement metrics
    const engagementMetrics = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          },
          activeUsers: {
            $sum: {
              $cond: [
                { $gte: ['$lastLogin', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Top users by bookings
    const topUsers = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$user',
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$finalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          name: '$userDetails.name',
          email: '$userDetails.email',
          totalBookings: 1,
          totalSpent: 1
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userRegistrations,
        engagementMetrics: engagementMetrics[0] || {
          totalUsers: 0,
          verifiedUsers: 0,
          activeUsers: 0
        },
        topUsers,
        period
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user analytics'
    });
  }
};

// @desc    Get attendance analytics
// @route   GET /api/analytics/attendance
// @access  Private/Admin
exports.getAttendanceAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Daily attendance trends
    const dailyAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          totalStudents: { $sum: 1 },
          averageAttendance: { $avg: '$summary.attendancePercentage' },
          breakfastAttendance: {
            $sum: { $cond: ['$meals.breakfast.isPresent', 1, 0] }
          },
          lunchAttendance: {
            $sum: { $cond: ['$meals.lunch.isPresent', 1, 0] }
          },
          dinnerAttendance: {
            $sum: { $cond: ['$meals.dinner.isPresent', 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Meal-wise attendance
    const mealWiseAttendance = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          breakfastAttendance: {
            $sum: { $cond: ['$meals.breakfast.isPresent', 1, 0] }
          },
          lunchAttendance: {
            $sum: { $cond: ['$meals.lunch.isPresent', 1, 0] }
          },
          dinnerAttendance: {
            $sum: { $cond: ['$meals.dinner.isPresent', 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        dailyAttendance,
        mealWiseAttendance: mealWiseAttendance[0] || {
          totalRecords: 0,
          breakfastAttendance: 0,
          lunchAttendance: 0,
          dinnerAttendance: 0
        },
        period
      }
    });
  } catch (error) {
    console.error('Get attendance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attendance analytics'
    });
  }
};

module.exports = exports;
