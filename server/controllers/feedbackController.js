// controllers/feedbackController.js
const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const Menu = require('../models/Menu');

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private
exports.getAllFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.user.role === 'student') {
      query.user = req.user.id;
    }

    if (req.query.feedbackType) {
      query.feedbackType = req.query.feedbackType;
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    if (req.query.rating) {
      query['rating.overall'] = parseInt(req.query.rating);
    }

    const feedback = await Feedback.find(query)
      .populate('user', 'name email studentId')
      .populate('booking', 'bookingId mealType')
      .populate('menuItem', 'name mealType')
      .populate('adminResponse.respondedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feedback'
    });
  }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'name email studentId')
      .populate('booking', 'bookingId mealType bookingDate')
      .populate('menuItem', 'name description mealType')
      .populate('adminResponse.respondedBy', 'name')
      .populate('resolution.resolvedBy', 'name');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && feedback.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this feedback'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feedback'
    });
  }
};

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private
exports.createFeedback = async (req, res) => {
  try {
    const {
      feedbackType,
      rating,
      title,
      comment,
      category,
      booking,
      menuItem,
      isAnonymous
    } = req.body;

    // Validate booking if provided
    if (booking) {
      const bookingDoc = await Booking.findById(booking);
      if (!bookingDoc) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if user owns the booking
      if (bookingDoc.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to give feedback for this booking'
        });
      }
    }

    // Create feedback
    const feedback = await Feedback.create({
      user: req.user.id,
      feedbackType,
      rating,
      title,
      comment,
      category,
      booking,
      menuItem,
      isAnonymous: isAnonymous || false,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        source: 'web'
      }
    });

    // Update menu item rating if feedback is for a menu item
    if (menuItem && rating.overall) {
      const menuItemDoc = await Menu.findById(menuItem);
      if (menuItemDoc) {
        await menuItemDoc.updateRatings(rating.overall);
      }
    }

    // Populate feedback for response
    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('menuItem', 'name mealType')
      .populate('booking', 'bookingId mealType');

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: populatedFeedback
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating feedback',
      error: error.message
    });
  }
};

// @desc    Respond to feedback (Admin only)
// @route   POST /api/feedback/:id/respond
// @access  Private/Admin
exports.respondToFeedback = async (req, res) => {
  try {
    const { response } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await feedback.addAdminResponse(response, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: feedback.adminResponse
    });
  } catch (error) {
    console.error('Respond to feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error responding to feedback'
    });
  }
};

// @desc    Mark feedback as resolved (Admin only)
// @route   PATCH /api/feedback/:id/resolve
// @access  Private/Admin
exports.resolveFeedback = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await feedback.markResolved(req.user.id, resolutionNotes);

    res.status(200).json({
      success: true,
      message: 'Feedback marked as resolved',
      data: feedback.resolution
    });
  } catch (error) {
    console.error('Resolve feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resolving feedback'
    });
  }
};

// @desc    Add helpful vote to feedback
// @route   POST /api/feedback/:id/vote
// @access  Private
exports.addHelpfulVote = async (req, res) => {
  try {
    const { vote } = req.body; // 'helpful' or 'not-helpful'

    if (!['helpful', 'not-helpful'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await feedback.addHelpfulVote(req.user.id, vote);

    res.status(200).json({
      success: true,
      message: 'Vote added successfully',
      data: {
        helpful: feedback.helpfulVotes.helpful,
        notHelpful: feedback.helpfulVotes.notHelpful
      }
    });
  } catch (error) {
    console.error('Add helpful vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding vote'
    });
  }
};

// @desc    Get feedback statistics (Admin only)
// @route   GET /api/feedback/stats
// @access  Private/Admin
exports.getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$rating.overall' },
          pendingFeedback: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          resolvedFeedback: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          positiveCount: {
            $sum: { $cond: [{ $eq: ['$sentiment.label', 'positive'] }, 1, 0] }
          },
          negativeCount: {
            $sum: { $cond: [{ $eq: ['$sentiment.label', 'negative'] }, 1, 0] }
          }
        }
      }
    ]);

    // Rating distribution
    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating.overall',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Category breakdown
    const categoryStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating.overall' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalFeedback: 0,
          averageRating: 0,
          pendingFeedback: 0,
          resolvedFeedback: 0,
          positiveCount: 0,
          negativeCount: 0
        },
        ratingDistribution,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feedback statistics'
    });
  }
};

module.exports = exports;
