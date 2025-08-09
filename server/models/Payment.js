// server/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      // required: true (removed to make optional)
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    currency: {
      type: String,
      default: 'INR'
    },
    provider: {
      // e.g. 'razorpay', 'stripe', 'cash', 'upi'
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'cash'],
      default: 'upi'
    },
    paymentType: {
      type: String,
      enum: ['wallet-recharge', 'meal-booking', 'refund', 'other'],
      default: 'wallet-recharge'
    },
    providerPaymentId: String,   // ID returned by the payment gateway
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending'
    },
    upiDetails: {
      upiId: String,
      merchantName: String,
      merchantTransactionId: String,
      upiTransactionId: String
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
      source: String
    },
    receiptEmail: String,
    meta: mongoose.Schema.Types.Mixed // any gateway-specific data
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
