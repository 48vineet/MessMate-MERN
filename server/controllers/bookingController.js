// controllers/bookingController.js
const Booking = require('../models/Booking');
const Menu = require('../models/Menu');
const User = require('../models/User');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'student') {
      query.user = req.user.id;
    }

    // Filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.mealType) {
      query.mealType = req.query.mealType;
    }
    
    if (req.query.date) {
      const date = new Date(req.query.date);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      query.bookingDate = {
        $gte: date,
        $lt: nextDate
      };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email studentId')
      .populate('menuItem', 'name price mealType')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching bookings'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email studentId phone')
      .populate('menuItem', 'name description price mealType')
      .populate('handledBy', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching booking'
    });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { menuItem, quantity, bookingDate, mealTime, specialRequests } = req.body;

    // Get menu item details
    const menuItemDoc = await Menu.findById(menuItem);
    if (!menuItemDoc) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check availability
    if (!menuItemDoc.checkAvailability(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Menu item not available or insufficient quantity'
      });
    }

    // Get user
    const user = await User.findById(req.user.id);
    
    // Calculate pricing
    const itemPrice = menuItemDoc.effectivePrice;
    const totalAmount = itemPrice * quantity;
    const finalAmount = totalAmount; // Add any discounts here

    // Check wallet balance
    if (user.wallet.balance < finalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      menuItem,
      quantity,
      mealType: menuItemDoc.mealType,
      bookingDate: new Date(bookingDate),
      mealTime,
      itemPrice,
      totalAmount,
      finalAmount,
      specialRequests,
      paymentMethod: 'wallet'
    });

    // Deduct money from wallet
    await user.deductMoney(finalAmount, `Meal booking - ${booking.bookingId}`);

    // Reduce menu item quantity
    await menuItemDoc.reduceQuantity(quantity);

    // Update user stats
    user.stats.totalBookings += 1;
    user.stats.totalSpent += finalAmount;
    await user.save();

    // Generate QR code
    await booking.generateQRCode();

    // Populate booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('menuItem', 'name price mealType')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking based on status
    booking.status = status;
    booking.handledBy = req.user.id;
    
    if (adminNotes) {
      booking.adminNotes = adminNotes;
    }

    // Handle specific status updates
    switch (status) {
      case 'confirmed':
        await booking.confirm();
        break;
      case 'prepared':
        await booking.markPrepared();
        booking.preparationStartTime = new Date();
        break;
      case 'served':
        await booking.markServed();
        break;
      case 'cancelled':
        await booking.cancel(adminNotes || 'Cancelled by admin', req.user.id);
        
        // Refund money if payment was made
        if (booking.paymentStatus === 'paid') {
          const user = await User.findById(booking.user);
          await user.addMoney(
            booking.finalAmount, 
            `Refund for booking ${booking.bookingId}`,
            `REFUND_${booking.bookingId}`
          );
          booking.paymentStatus = 'refunded';
        }
        break;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating booking status'
    });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (['served', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }

    // Cancel booking
    await booking.cancel(req.body.reason || 'Cancelled by user', req.user.id);

    // Refund money
    const user = await User.findById(booking.user);
    await user.addMoney(
      booking.finalAmount,
      `Refund for cancelled booking ${booking.bookingId}`,
      `CANCEL_${booking.bookingId}`
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling booking'
    });
  }
};

// @desc    Add feedback to booking
// @route   POST /api/bookings/:id/feedback
// @access  Private
exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add feedback to this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'served') {
      return res.status(400).json({
        success: false,
        message: 'Can only add feedback to completed bookings'
      });
    }

    // Add feedback
    await booking.addFeedback(rating, comment);

    // Update menu item rating
    const menuItem = await Menu.findById(booking.menuItem);
    if (menuItem) {
      await menuItem.updateRatings(rating);
    }

    res.status(200).json({
      success: true,
      message: 'Feedback added successfully',
      data: booking.feedback
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding feedback'
    });
  }
};

module.exports = exports;
