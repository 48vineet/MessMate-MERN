const Wallet = require('../models/Wallet');
const User = require('../models/User');
const { generateGenericQR, generateAmountQR } = require('../utils/qrGenerator');

// Get wallet details for a user
exports.getWalletDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = new Wallet({ userId });
      await wallet.save();
    }

    // Generate QR code for the UPI ID (always use the correct UPI ID)
    const qrResult = await generateGenericQR('7038738012-2@ybl');

    res.json({
      success: true,
      wallet: {
        balance: wallet.balance,
        monthlySpent: wallet.monthlySpent,
        totalRecharged: wallet.totalRecharged,
        totalSpent: wallet.totalSpent,
        recentTransactions: wallet.recentTransactions.slice(-10), // Last 10 transactions
        upiId: '7038738012-2@ybl',
        qrCode: qrResult.success ? qrResult.qrDataUrl : null
      }
    });
  } catch (error) {
    console.error('Error fetching wallet details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wallet details' });
  }
};

// Request wallet recharge
exports.requestRecharge = async (req, res) => {
  try {
    const { amount, paymentMethod, upiId } = req.body;
    console.log("Console 3 ", req.body);
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
    }

    // Create recharge transaction
    const transaction = {
      type: 'recharge',
      amount: amount,
      description: `Wallet recharge of ₹${amount}`,
      status: 'pending',
      paymentMethod: paymentMethod || 'upi',
      upiId: upiId || '7038738012-2@ybl',
      createdAt: new Date()
    };

    wallet.recentTransactions.push(transaction);
    await wallet.save();

    res.json({
      success: true,
      message: 'Recharge request submitted successfully',
      transaction: transaction,
      wallet: {
        balance: wallet.balance,
        totalRecharged: wallet.totalRecharged
      }
    });
  } catch (error) {
    console.error('Error requesting recharge:', error);
    res.status(500).json({ success: false, message: 'Failed to submit recharge request' });
  }
};

// Admin: Get all pending recharge requests
exports.getPendingRecharges = async (req, res) => {
  try {
    const wallets = await Wallet.find({
      'recentTransactions.status': 'pending',
      'recentTransactions.type': 'recharge'
    }).populate('userId', 'name email phone');

    const pendingRecharges = [];
    wallets.forEach(wallet => {
      const pendingTransactions = wallet.recentTransactions.filter(
        t => t.status === 'pending' && t.type === 'recharge'
      );
      
      pendingTransactions.forEach(transaction => {
        pendingRecharges.push({
          id: transaction._id,
          userId: wallet.userId,
          userName: wallet.userId.name,
          userEmail: wallet.userId.email,
          userPhone: wallet.userId.phone,
          amount: transaction.amount,
          paymentMethod: transaction.paymentMethod,
          upiId: transaction.upiId || '7038738012-2@ybl',
          description: transaction.description,
          createdAt: transaction.createdAt
        });
      });
    });

    res.json({
      success: true,
      pendingRecharges: pendingRecharges.sort((a, b) => b.createdAt - a.createdAt)
    });
  } catch (error) {
    console.error('Error fetching pending recharges:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending recharges' });
  }
};

// Admin: Approve recharge request
exports.approveRecharge = async (req, res) => {
  try {
    const { transactionId, userId } = req.body;
    const adminId = req.user.id;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    const transaction = wallet.recentTransactions.id(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Transaction is not pending' });
    }

    // Update transaction
    transaction.status = 'completed';
    transaction.adminApproved = true;
    transaction.approvedBy = adminId;
    transaction.approvedAt = new Date();

    // Update wallet balance
    wallet.balance += transaction.amount;
    wallet.totalRecharged += transaction.amount;

    await wallet.save();

    res.json({
      success: true,
      message: 'Recharge approved successfully',
      wallet: {
        balance: wallet.balance,
        totalRecharged: wallet.totalRecharged
      }
    });
  } catch (error) {
    console.error('Error approving recharge:', error);
    res.status(500).json({ success: false, message: 'Failed to approve recharge' });
  }
};

// Admin: Reject recharge request
exports.rejectRecharge = async (req, res) => {
  try {
    const { transactionId, userId, reason } = req.body;
    const adminId = req.user.id;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    const transaction = wallet.recentTransactions.id(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Transaction is not pending' });
    }

    // Update transaction
    transaction.status = 'cancelled';
    transaction.description = reason || 'Recharge request rejected by admin';

    await wallet.save();

    res.json({
      success: true,
      message: 'Recharge rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting recharge:', error);
    res.status(500).json({ success: false, message: 'Failed to reject recharge' });
  }
};

// Admin: Get all wallets with statistics
exports.getAllWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find().populate('userId', 'name email phone');
    
    const walletStats = wallets.map(wallet => ({
      userId: wallet.userId._id,
      userName: wallet.userId.name,
      userEmail: wallet.userId.email,
      userPhone: wallet.userId.phone,
      balance: wallet.balance,
      totalRecharged: wallet.totalRecharged,
      totalSpent: wallet.totalSpent,
      monthlySpent: wallet.monthlySpent,
      transactionCount: wallet.recentTransactions.length,
      isActive: wallet.isActive
    }));

    res.json({
      success: true,
      wallets: walletStats,
      totalWallets: walletStats.length,
      totalBalance: walletStats.reduce((sum, w) => sum + w.balance, 0),
      totalRecharged: walletStats.reduce((sum, w) => sum + w.totalRecharged, 0)
    });
  } catch (error) {
    console.error('Error fetching all wallets:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wallets' });
  }
};

// Generate QR code for specific amount
exports.generateQRCode = async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    const userId = req.user.id;

    // Always use the correct UPI ID
    let targetUpiId = upiId || '7038738012-2@ybl';

    // Generate QR code
    const qrResult = await generateAmountQR(targetUpiId, amount, `Wallet Recharge - ₹${amount}`);

    if (!qrResult.success) {
      return res.status(500).json({ success: false, message: 'Failed to generate QR code' });
    }

    res.json({
      success: true,
      qrCode: qrResult.qrDataUrl,
      upiId: targetUpiId,
      amount: amount
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR code' });
  }
};

// Admin: Update wallet settings (UPI ID, QR Code)
exports.updateWalletSettings = async (req, res) => {
  try {
    const { upiId } = req.body;

    // Always use the correct UPI ID
    const correctUpiId = upiId || '7038738012-2@ybl';

    // Update all wallets with correct UPI ID
    await Wallet.updateMany({}, { upiId: correctUpiId });

    // Generate new QR code for the updated UPI ID
    const qrResult = await generateGenericQR(correctUpiId);

    res.json({
      success: true,
      message: 'Wallet settings updated successfully',
      settings: { 
        upiId: correctUpiId, 
        qrCode: qrResult.success ? qrResult.qrDataUrl : null 
      }
    });
  } catch (error) {
    console.error('Error updating wallet settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update wallet settings' });
  }
};
  