const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['credit', 'debit', 'recharge', 'refund'], 
    required: true 
  },
  amount: { type: Number, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['upi', 'qr', 'bank_transfer', 'cash', 'wallet'], 
    default: 'upi' 
  },
  transactionId: String,
  upiId: String,
  qrCode: String,
  adminApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, default: 0 },
  monthlySpent: { type: Number, default: 0 },
  totalRecharged: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  recentTransactions: [transactionSchema],
  upiId: { type: String, default: '7038738012-2@ybl' },
  qrCode: { type: String, default: 'https://example.com/messmate-qr.png' },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Wallet', walletSchema);
