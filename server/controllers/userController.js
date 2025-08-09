// controllers/userController.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { studentId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users: users, // Changed from 'data' to 'users' to match frontend expectation
      count: users.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can access this profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this profile'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Fields that can be updated
    const allowedFields = ['name', 'phone', 'preferences', 'avatar'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Admin can update additional fields
    if (req.user.role === 'admin') {
      const adminFields = ['role', 'isActive', 'isVerified'];
      adminFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting other admins
    if (user.role === 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete other admin users'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};

// @desc    Add money to wallet
// @route   POST /api/users/:id/wallet/add
// @access  Private
exports.addMoney = async (req, res) => {
  try {
    const { amount, transactionId, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this wallet'
      });
    }

    await user.addMoney(amount, description || 'Wallet recharge', transactionId);

    res.status(200).json({
      success: true,
      message: 'Money added to wallet successfully',
      wallet: user.wallet
    });
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding money to wallet'
    });
  }
};

// @desc    Update user status (Admin only)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deactivating other admins
    if (user.role === 'admin' && !isActive && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate other admin users'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
};

// @desc    Bulk user actions (Admin only)
// @route   PATCH /api/users/bulk-action
// @access  Private/Admin
exports.bulkUserAction = async (req, res) => {
  try {
    const { userIds, action } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs are required'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        message = 'Users activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        message = 'Users deactivated successfully';
        break;
      case 'delete':
        // Don't allow deleting admins
        const usersToDelete = await User.find({ _id: { $in: userIds } });
        const adminUsers = usersToDelete.filter(user => user.role === 'admin');
        
        if (adminUsers.length > 0) {
          return res.status(403).json({
            success: false,
            message: 'Cannot delete admin users'
          });
        }
        
        await User.deleteMany({ _id: { $in: userIds } });
        res.status(200).json({
          success: true,
          message: 'Users deleted successfully'
        });
        return;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    await User.updateMany(
      { _id: { $in: userIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Bulk user action error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error performing bulk action'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats or GET /api/users/stats (current user)
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    // Debug logging
    console.log('DEBUG getUserStats - req.user:', req.user);
    console.log('DEBUG getUserStats - req.params:', req.params);
    // If no ID parameter, use current user
    const userId = req.params.id || req.user.id;
    console.log('DEBUG getUserStats - userId:', userId);

    // Check authorization
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these statistics'
      });
    }

    const user = await User.findById(userId).select('-password');
    console.log('DEBUG getUserStats - user:', user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Always use ObjectId for aggregation
    const objectUserId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    // Get booking statistics
    const totalBookings = await Booking.countDocuments({ user: objectUserId });
    const confirmedBookings = await Booking.countDocuments({ 
      user: objectUserId, 
      status: 'confirmed' 
    });
    const cancelledBookings = await Booking.countDocuments({ 
      user: objectUserId, 
      status: 'cancelled' 
    });

    // Get payment statistics
    const totalSpent = await Payment.aggregate([
      { $match: { user: objectUserId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get attendance statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const attendanceStats = await Attendance.getUserAttendanceSummary(
      objectUserId, 
      thirtyDaysAgo, 
      new Date()
    );

    const stats = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        joinDate: user.createdAt,
        lastLogin: user.lastLogin
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        successRate: totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : 0
      },
      financial: {
        totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0,
        walletBalance: user.wallet?.balance || 0,
        averageOrderValue: totalBookings > 0 ? 
          ((totalSpent.length > 0 ? totalSpent[0].total : 0) / totalBookings).toFixed(2) : 0
      },
      attendance: attendanceStats,
      preferences: user.preferences
    };

    res.status(200).json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error, error?.stack);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user statistics',
      error: error.message
    });
  }
};

module.exports = exports;
