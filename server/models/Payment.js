// server/models/Payment.js
import mongoose from 'mongoose';

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
      required: true
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
      // e.g. 'razorpay', 'stripe', 'cash'
      type: String,
      required: true
    },
    providerPaymentId: String,   // ID returned by the payment gateway
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending'
    },
    receiptEmail: String,
    meta: mongoose.Schema.Types.Mixed // any gateway-specific data
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
