// controllers/bookingController.js
const Booking = require("../models/Booking");
const Menu = require("../models/Menu");
const DailyMenu = require("../models/DailyMenu");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

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

    if (req.user.role === "student") {
      query.user = req.user.id;
    }

    // Filters
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.mealType) {
      query.mealType = req.query.mealType;
    }

    // Handle date filtering properly
    if (req.query.date && req.user.role !== "admin") {
      let startDate, endDate;

      if (req.query.date === "today") {
        // Get today's date range
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Parse specific date
        startDate = new Date(req.query.date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(req.query.date);
        endDate.setHours(23, 59, 59, 999);
      }

      query.bookingDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // For admin, temporarily show all bookings
    if (req.user.role === "admin") {
    }

    // Simple query without population to avoid issues
    const bookings = await Booking.find(query)
      .populate("user", "name email studentId phone")
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
        pages: Math.ceil(total / limit),
      },
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching bookings",
      error: error.message,
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email studentId phone")
      .populate("menuItem", "name description price mealType")
      .populate("handledBy", "name");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      booking.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this booking",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching booking",
    });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const {
      menuItem,
      selectedItemIndex,
      quantity,
      bookingDate,
      mealTime,
      specialRequests,
    } = req.body;

    // Get menu item details
    const menuItemDoc = await DailyMenu.findById(menuItem);
    if (!menuItemDoc) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Check availability (simplified for DailyMenu)
    if (!menuItemDoc.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Menu item not available",
      });
    }

    // Get the specific item from the items array
    let itemPrice;
    let itemName;

    if (
      selectedItemIndex !== undefined &&
      menuItemDoc.items &&
      menuItemDoc.items.length > 0
    ) {
      const selectedItem = menuItemDoc.items[selectedItemIndex];
      if (!selectedItem) {
        return res.status(400).json({
          success: false,
          message: "Selected item not found in menu",
        });
      }

      if (selectedItem.isAvailable === false) {
        return res.status(400).json({
          success: false,
          message: `${selectedItem.name} is not available`,
        });
      }

      itemPrice = selectedItem.price || menuItemDoc.price || 80;
      itemName = selectedItem.name;
    } else {
      // Fallback to menu-level price if no specific item selected
      itemPrice = menuItemDoc.price || 80;
      itemName = menuItemDoc.name || menuItemDoc.items[0]?.name || "Meal";
    }

    // Get user and wallet
    const user = await User.findById(req.user.id);
    let wallet = await Wallet.findOne({ userId: req.user.id });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = new Wallet({ userId: req.user.id });
      await wallet.save();
    }

    // Calculate pricing
    const totalAmount = itemPrice * quantity;
    const finalAmount = totalAmount; // Add any discounts here

    // Check wallet balance
    if (wallet.balance < finalAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You have ₹${wallet.balance} but need ₹${finalAmount}`,
        userBalance: wallet.balance,
        requiredAmount: finalAmount,
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      menuItem,
      selectedItemIndex:
        selectedItemIndex !== undefined ? selectedItemIndex : 0,
      itemName,
      quantity,
      mealType: menuItemDoc.mealType,
      bookingDate: new Date(bookingDate),
      mealTime,
      itemPrice,
      totalAmount,
      finalAmount,
      specialRequests,
      paymentMethod: "wallet",
      paymentStatus: "paid", // Mark as paid since we're deducting from wallet
    });

    try {
      // Deduct money from wallet
      wallet.balance -= finalAmount;
      wallet.totalSpent += finalAmount;

      const transaction = {
        type: "debit",
        amount: finalAmount,
        description: `Meal booking - ${booking.bookingId}`,
        status: "completed",
        paymentMethod: "wallet",
        transactionId: `BOOKING_${booking.bookingId}`,
        createdAt: new Date(),
      };

      wallet.recentTransactions.push(transaction);

      await wallet.save();

      // Update user stats
      user.stats.totalBookings += 1;
      user.stats.totalSpent += finalAmount;
      await user.save();
    } catch (walletError) {
      console.error("Wallet deduction failed:", walletError);
      console.error("Error details:", {
        message: walletError.message,
        stack: walletError.stack,
        walletId: wallet._id,
        userId: req.user.id,
      });
      // If wallet deduction fails, delete the booking
      await Booking.findByIdAndDelete(booking._id);
      return res.status(400).json({
        success: false,
        message: "Failed to process payment. Please try again.",
        error: walletError.message,
      });
    }

    // Generate QR code
    await booking.generateQRCode();

    // Populate booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("menuItem", "name price mealType description")
      .populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(400).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
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
        message: "Booking not found",
      });
    }

    // Check if booking is already in the target status
    if (booking.status === status) {
      return res.status(200).json({
        success: true,
        message: `Booking is already ${status}`,
        data: booking,
      });
    }

    // Handle specific status updates
    switch (status) {
      case "confirmed":
        booking.handledBy = req.user.id;
        if (adminNotes) booking.adminNotes = adminNotes;
        await booking.confirm();
        break;

      case "prepared":
        booking.handledBy = req.user.id;
        if (adminNotes) booking.adminNotes = adminNotes;
        booking.preparationStartTime = new Date();
        await booking.markPrepared();
        break;

      case "served":
        booking.handledBy = req.user.id;
        if (adminNotes) booking.adminNotes = adminNotes;
        await booking.markServed();
        break;

      case "cancelled":
        // Refund 50% of the amount if payment was made (service charge deduction)
        if (booking.paymentStatus === "paid") {
          const refundAmount = booking.finalAmount * 0.5; // 50% refund

          const wallet = await Wallet.findOne({ userId: booking.user });

          if (wallet) {
            wallet.balance += refundAmount;
            wallet.recentTransactions.push({
              type: "credit",
              amount: refundAmount,
              description: `Refund for cancelled booking ${booking.bookingId} (50% - service charge applied)`,
              status: "completed",
              paymentMethod: "wallet",
              transactionId: `REFUND_${booking.bookingId}`,
            });
            await wallet.save();
          }
        }

        booking.handledBy = req.user.id;
        await booking.cancel(adminNotes || "Cancelled by admin", req.user.id);
        break;

      default:
        // For any other status, just update and save
        booking.status = status;
        booking.handledBy = req.user.id;
        if (adminNotes) booking.adminNotes = adminNotes;
        await booking.save();
    }

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      bookingId: req.params.id,
      requestedStatus: req.body.status,
    });
    res.status(500).json({
      success: false,
      message: "Server error updating booking status",
      error: error.message,
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
        message: "Booking not found",
      });
    }

    // Check authorization
    if (req.user.role !== "admin" && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Check if booking can be cancelled
    if (["served", "cancelled"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel this booking",
      });
    }

    // Capture original payment status before any mutations
    const wasPaid = booking.paymentStatus === "paid";

    // Cancel booking
    try {
      // Safely get cancellation reason (req.body might be undefined for DELETE requests)
      const cancellationReason =
        (req.body && req.body.reason) || "Cancelled by user";

      // Try using the cancel method first
      try {
        await booking.cancel(cancellationReason, req.user.id);
      } catch (methodError) {
        console.error(
          "Cancel method failed, trying manual update:",
          methodError
        );
        // Fallback: manually update fields
        booking.status = "cancelled";
        booking.cancellationReason = cancellationReason;
        booking.cancelledAt = new Date();
        if (req.user.id) {
          booking.cancelledBy = req.user.id;
        }
        if (booking.paymentStatus === "paid") {
          booking.paymentStatus = "refunded";
        }
        await booking.save();
      }
    } catch (cancelError) {
      console.error("Error cancelling booking:", cancelError);
      console.error("Error stack:", cancelError.stack);
      console.error("Error name:", cancelError.name);
      if (cancelError.errors) {
        console.error(
          "Validation errors:",
          JSON.stringify(cancelError.errors, null, 2)
        );
      }
      return res.status(500).json({
        success: false,
        message: "Failed to cancel booking",
        error: cancelError.message,
        details: cancelError.errors
          ? Object.keys(cancelError.errors).map((key) => ({
              field: key,
              message: cancelError.errors[key].message,
            }))
          : undefined,
      });
    }

    // Refund 50% of the amount if payment was made (service charge deduction)
    // Use original status captured before cancellation to avoid race with model method updates
    if (wasPaid) {
      try {
        const refundAmount = booking.finalAmount * 0.5; // 50% refund

        const wallet = await Wallet.findOne({ userId: booking.user });

        if (wallet) {
          wallet.balance += refundAmount;
          wallet.recentTransactions.push({
            type: "credit",
            amount: refundAmount,
            description: `Refund for cancelled booking ${booking.bookingId} (50% - service charge applied)`,
            status: "completed",
            paymentMethod: "wallet",
            transactionId: `CANCEL_${booking.bookingId}`,
          });
          await wallet.save();
        } else {
          // Create wallet if doesn't exist
          await Wallet.create({
            userId: booking.user,
            balance: refundAmount,
            recentTransactions: [
              {
                type: "credit",
                amount: refundAmount,
                description: `Refund for cancelled booking ${booking.bookingId} (50% - service charge applied)`,
                status: "completed",
                paymentMethod: "wallet",
                transactionId: `CANCEL_${booking.bookingId}`,
              },
            ],
          });
        }
      } catch (walletError) {
        console.error("Error refunding to wallet:", walletError);
        // Don't fail the cancellation if wallet update fails
        // Log it for admin review
      }
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error cancelling booking",
      error: error.message,
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
        message: "Booking not found",
      });
    }

    // Check authorization
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add feedback to this booking",
      });
    }

    // Check if booking is completed
    if (booking.status !== "served") {
      return res.status(400).json({
        success: false,
        message: "Can only add feedback to completed bookings",
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
      message: "Feedback added successfully",
      data: booking.feedback,
    });
  } catch (error) {
    console.error("Add feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Server error adding feedback",
    });
  }
};

// @desc    Quick book meal
// @route   POST /api/bookings/quick-book
// @access  Private
exports.quickBook = async (req, res) => {
  try {
    const { mealType, date } = req.body;

    // Find today's menu for the specified meal type
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let dailyMenu = await DailyMenu.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
      mealType,
      isTemplate: { $ne: true },
      isAvailable: true,
    });

    if (!dailyMenu) {
      // Create a default menu if none exists
      try {
        dailyMenu = await DailyMenu.create({
          date: new Date(date),
          mealType,
          items: [
            {
              name: "Default Meal",
              description: "Quick booking meal",
              icon: "🍛",
            },
          ],
          price: 80,
          description: `Default ${mealType} menu`,
          isAvailable: true,
          createdBy: req.user.id,
        });
      } catch (menuError) {
        console.error("Error creating default menu:", menuError);
        return res.status(500).json({
          success: false,
          message: "Failed to create menu for booking",
        });
      }
    }

    // Check if user already has a booking for this meal
    const existingBooking = await Booking.findOne({
      user: req.user.id,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      mealType,
      status: { $nin: ["cancelled"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: `You already have a booking for ${mealType} on ${date}`,
      });
    }

    // Get user and wallet
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      wallet = new Wallet({ userId: req.user.id });
      await wallet.save();
    }

    // Calculate pricing
    const itemPrice = dailyMenu.price || 80;
    const quantity = 1;
    const totalAmount = itemPrice * quantity;
    const finalAmount = totalAmount;

    // Check wallet balance
    if (wallet.balance < finalAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You have ₹${wallet.balance} but need ₹${finalAmount}`,
        userBalance: wallet.balance,
        requiredAmount: finalAmount,
      });
    }

    // Create booking with all required fields
    const bookingData = {
      user: req.user.id,
      menuItem: dailyMenu._id,
      quantity,
      mealType,
      bookingDate: new Date(date),
      mealTime: `${mealType} time`,
      itemPrice,
      totalAmount,
      finalAmount,
      paymentMethod: "wallet",
      status: "confirmed",
      paymentStatus: "paid",
    };

    const booking = await Booking.create(bookingData);

    // Deduct money from wallet
    try {
      wallet.balance -= finalAmount;
      wallet.totalSpent += finalAmount;
      wallet.recentTransactions.push({
        type: "debit",
        amount: finalAmount,
        description: `Quick booking - ${booking.bookingId}`,
        status: "completed",
        paymentMethod: "wallet",
        transactionId: `QUICK_${booking.bookingId}`,
      });
      await wallet.save();

      // Update user stats
      user.stats.totalBookings += 1;
      user.stats.totalSpent += finalAmount;
      await user.save();
    } catch (walletError) {
      console.error("Wallet deduction failed for quick booking:", walletError);
      // If wallet deduction fails, delete the booking
      await Booking.findByIdAndDelete(booking._id);
      return res.status(400).json({
        success: false,
        message: "Failed to process payment. Please try again.",
        error: walletError.message,
      });
    }

    // Generate QR code for the booking
    try {
      await booking.generateQRCode();
    } catch (qrError) {
      console.error("QR generation error (non-critical):", qrError);
      // Continue without QR code if generation fails
    }

    res.status(201).json({
      success: true,
      message: `${mealType} booked successfully!`,
      data: booking,
    });
  } catch (error) {
    console.error("Quick booking error:", error);
    res.status(400).json({
      success: false,
      message: "Error creating quick booking",
      error: error.message,
    });
  }
};

// @desc    Get current QR code
// @route   GET /api/bookings/current-qr
// @access  Private
exports.getCurrentQR = async (req, res) => {
  try {
    // Find the user's most recent active booking
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const booking = await Booking.findOne({
      user: req.user.id,
      bookingDate: { $gte: startOfDay, $lt: endOfDay },
      status: { $nin: ["cancelled", "no-show"] },
    }).sort({ createdAt: -1 });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "No active booking found for today. Please create a booking first.",
      });
    }

    // Generate QR code for the actual booking
    const qrData = {
      bookingId: booking.bookingId,
      userId: booking.user.toString(),
      mealType: booking.mealType,
      timestamp: booking.createdAt.getTime(),
      bookingDate: booking.bookingDate.toISOString(),
    };

    // Generate actual QR code
    const QRCode = require("qrcode");
    const qrString = JSON.stringify(qrData);
    const qrUrl = await QRCode.toDataURL(qrString, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    const qrCode = {
      data: qrString,
      url: qrUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    res.status(200).json({
      success: true,
      qrCode: qrCode,
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        mealType: booking.mealType,
        status: booking.status,
        bookingDate: booking.bookingDate,
        createdAt: booking.createdAt,
        menuName: "Today's Meal",
      },
    });
  } catch (error) {
    console.error("Get current QR error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching QR code",
      error: error.message,
    });
  }
};

// @desc    Debug: Get all bookings without filters
// @route   GET /api/bookings/debug
// @access  Private/Admin
exports.debugBookings = async (req, res) => {
  try {
    // Get all bookings without any filters
    const allBookings = await Booking.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalBookings: allBookings.length,
      bookings: allBookings,
    });
  } catch (error) {
    console.error("Debug bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in debug endpoint",
      error: error.message,
    });
  }
};

// @desc    Test: Check wallet balance (for debugging)
// @route   GET /api/bookings/test-wallet
// @access  Public
exports.testWallet = async (req, res) => {
  try {
    // Find a user
    const user = await User.findOne({});
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No users found in database",
      });
    }

    // Find or create wallet
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = new Wallet({ userId: user._id });
      await wallet.save();
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
      },
      wallet: {
        balance: wallet.balance,
        totalSpent: wallet.totalSpent,
        totalRecharged: wallet.totalRecharged,
        transactionsCount: wallet.recentTransactions.length,
        recentTransactions: wallet.recentTransactions.slice(-5),
      },
    });
  } catch (error) {
    console.error("Test wallet error:", error);
    res.status(500).json({
      success: false,
      message: "Error testing wallet",
      error: error.message,
    });
  }
};

// @desc    Test: Create a booking without auth (for debugging)
// @route   POST /api/bookings/test-create
// @access  Public
exports.testCreateBooking = async (req, res) => {
  try {
    // Find a user to create booking for
    const user = await User.findOne({});
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No users found in database",
      });
    }

    // Find a daily menu item to use
    const dailyMenu = await DailyMenu.findOne({ isAvailable: true });
    if (!dailyMenu) {
      return res.status(400).json({
        success: false,
        message: "No available daily menu items found",
      });
    }

    // Test wallet operations
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = new Wallet({ userId: user._id });
      await wallet.save();
    }

    // Add some money to wallet for testing
    if (wallet.balance < 100) {
      wallet.balance += 500;
      wallet.totalRecharged += 500;
      wallet.recentTransactions.push({
        type: "credit",
        amount: 500,
        description: "Test wallet recharge",
        status: "completed",
        paymentMethod: "cash",
        transactionId: `TEST_RECHARGE_${Date.now()}`,
      });
      await wallet.save();
    }

    // Create a test booking with menu item
    const testBooking = await Booking.create({
      user: user._id,
      menuItem: dailyMenu._id,
      quantity: 1,
      mealType: dailyMenu.mealType,
      bookingDate: new Date(),
      mealTime: "12:00",
      itemPrice: dailyMenu.price || 80,
      totalAmount: dailyMenu.price || 80,
      finalAmount: dailyMenu.price || 80,
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "wallet",
    });

    // Test wallet deduction
    try {
      const finalAmount = dailyMenu.price || 80;
      wallet.balance -= finalAmount;
      wallet.totalSpent += finalAmount;
      wallet.recentTransactions.push({
        type: "debit",
        amount: finalAmount,
        description: `Test booking - ${testBooking.bookingId}`,
        status: "completed",
        paymentMethod: "wallet",
        transactionId: `TEST_${testBooking.bookingId}`,
        createdAt: new Date(),
      });
      await wallet.save();
    } catch (walletError) {
      console.error("Wallet deduction failed for test booking:", walletError);
    }

    // Check all bookings
    const allBookings = await Booking.find({});

    res.status(201).json({
      success: true,
      message: "Test booking created successfully",
      booking: testBooking,
      dailyMenu: {
        id: dailyMenu._id,
        name: dailyMenu.name,
        mealType: dailyMenu.mealType,
        price: dailyMenu.price,
      },
      wallet: {
        balance: wallet.balance,
        totalSpent: wallet.totalSpent,
        transactionsCount: wallet.recentTransactions.length,
      },
      totalBookings: allBookings.length,
    });
  } catch (error) {
    console.error("Test create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating test booking",
      error: error.message,
    });
  }
};

// @desc    Search bookings
// @route   GET /api/bookings/search
// @access  Private
exports.searchBookings = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = {
      user: req.user.id,
      $or: [
        // Search in booking ID
        { bookingId: { $regex: q, $options: "i" } },
        // Search in meal type
        { mealType: { $regex: q, $options: "i" } },
        // Search in status
        { status: { $regex: q, $options: "i" } },
        // Search in date
        { date: { $regex: q, $options: "i" } },
      ],
    };

    const bookings = await Booking.find(searchQuery)
      .populate("menu", "date meals")
      .sort({ date: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        total: bookings.length,
      },
    });
  } catch (error) {
    console.error("Booking search error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during booking search",
    });
  }
};

module.exports = exports;
