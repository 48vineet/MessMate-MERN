// controllers/paymentController.js
const Payment = require('../models/Payment');
const User = require('../models/User');
const QRCode = require('qrcode');
const crypto = require('crypto');

// @desc    Generate UPI payment
// @route   POST /api/payments/generate-upi
// @access  Private
exports.generateUPIPayment = async (req, res) => {
  try {
    const { amount, orderId, customerName, customerEmail } = req.body;
    
    // Generate transaction reference
    const transactionRef = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create UPI payment URL
    const upiUrl = `upi://pay?pa=${process.env.UPI_ID}&pn=${encodeURIComponent(process.env.UPI_MERCHANT_NAME)}&tr=${transactionRef}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${process.env.UPI_TRANSACTION_NOTE} - Order: ${orderId}`)}`;
    
    // Generate QR code for the UPI URL
    const qrCodeData = await QRCode.toDataURL(upiUrl);
    
    // Create payment record
    const payment = await Payment.create({
      transactionId: transactionRef,
      user: req.user.id,
      amount: amount,
      paymentMethod: 'upi',
      paymentType: 'wallet-recharge',
      status: 'pending',
      upiDetails: {
        upiId: process.env.UPI_ID,
        merchantName: process.env.UPI_MERCHANT_NAME,
        merchantTransactionId: transactionRef
      },
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        source: 'web'
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        upiId: process.env.UPI_ID,
        merchantName: process.env.UPI_MERCHANT_NAME,
        amount: amount,
        transactionRef: transactionRef,
        orderId: orderId,
        upiUrl: upiUrl,
        qrCode: qrCodeData,
        paymentInstructions: {
          mobile: "Open any UPI app and scan the QR code or use the UPI ID",
          desktop: "Scan the QR code with your mobile UPI app"
        }
      }
    });
  } catch (error) {
    console.error('Generate UPI payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate UPI payment',
      error: error.message,
    });
  }
};

// @desc    Verify payment (manual)
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionRef, upiTransactionId, status } = req.body;
    
    // Find payment by transaction reference
    const payment = await Payment.findOne({ transactionId: transactionRef });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this payment'
      });
    }

    // Update payment with UPI transaction ID
    payment.upiDetails.upiTransactionId = upiTransactionId;
    payment.status = 'processing';
    payment.verification.verificationMethod = 'manual';
    
    await payment.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment verification submitted successfully',
      data: {
        paymentId: payment._id,
        transactionRef: transactionRef,
        upiTransactionId: upiTransactionId,
        status: payment.status,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

// @desc    Get all payments (Admin only)
// @route   GET /api/payments
// @access  Private/Admin
exports.getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.user.role === 'student') {
      query.user = req.user.id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }
    
    if (req.query.paymentType) {
      query.paymentType = req.query.paymentType;
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email studentId')
      .populate('booking', 'bookingId mealType')
      .sort({ initiatedAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments'
    });
  }
};

// @desc    Approve payment (Admin only)
// @route   PATCH /api/payments/:id/approve
// @access  Private/Admin
exports.approvePayment = async (req, res) => {
  try {
    const { notes } = req.body;
    
    const payment = await Payment.findById(req.params.id).populate('user');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not in processing status'
      });
    }

    // Mark payment as completed
    await payment.verifyManually(req.user.id, notes);

    // Add money to user's wallet if it's a wallet recharge
    if (payment.paymentType === 'wallet-recharge') {
      await payment.user.addMoney(
        payment.amount,
        `Wallet recharge - ${payment.transactionId}`,
        payment.transactionId
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment approved successfully',
      data: payment
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving payment'
    });
  }
};

// @desc    Reject payment (Admin only)
// @route   PATCH /api/payments/:id/reject
// @access  Private/Admin
exports.rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Mark payment as failed
    await payment.markFailed('ADMIN_REJECTED', reason || 'Payment rejected by admin');

    res.status(200).json({
      success: true,
      message: 'Payment rejected successfully',
      data: payment
    });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting payment'
    });
  }
};

// @desc    Get UPI details
// @route   GET /api/payments/upi-details
// @access  Private
exports.getUPIDetails = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        upiId: process.env.UPI_ID,
        merchantName: process.env.UPI_MERCHANT_NAME,
        supportedApps: [
          {
            name: 'PhonePe',
            icon: '📱',
            color: 'bg-purple-500',
            url: 'phonepe://'
          },
          {
            name: 'Google Pay',
            icon: '🌐',
            color: 'bg-green-500',
            url: 'gpay://'
          },
          {
            name: 'Paytm',
            icon: '💳',
            color: 'bg-blue-500',
            url: 'paytm://'
          },
          {
            name: 'BHIM UPI',
            icon: '🏦',
            color: 'bg-orange-500',
            url: 'bhim://'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Get UPI details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get UPI details',
      error: error.message,
    });
  }
};

module.exports = exports;
