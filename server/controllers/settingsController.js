// controllers/settingsController.js

// Default system settings
const defaultSettings = {
  general: {
    messName: 'MessMate',
    contactEmail: 'admin@messmate.com',
    contactPhone: '+91 98765 43210',
    timezone: 'Asia/Kolkata',
    address: 'University Campus, City, State - PIN'
  },
  meals: {
    breakfastTime: '08:00',
    lunchTime: '13:00',
    dinnerTime: '20:00',
    bookingDeadline: '18:00',
    maxAdvanceBookings: 7,
    allowCancellation: true,
    cancellationDeadline: '12:00'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingReminders: true,
    menuUpdates: true,
    paymentReminders: true,
    feedbackRequests: true
  },
  payments: {
    currency: 'INR',
    upiEnabled: true,
    cardEnabled: true,
    walletEnabled: true,
    autoRecharge: false,
    minRechargeAmount: 100,
    maxRechargeAmount: 5000
  },
  system: {
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365
  }
};

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    // For now, return default settings
    // In a real application, you would store these in a database
    res.status(200).json({
      success: true,
      data: {
        settings: defaultSettings
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching settings'
    });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const updatedSettings = req.body;
    
    // Validate settings structure
    if (!updatedSettings || typeof updatedSettings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings data'
      });
    }

    // Merge with default settings to ensure all required fields exist
    const mergedSettings = {
      ...defaultSettings,
      ...updatedSettings
    };

    // In a real application, you would save these to a database
    // For now, we'll just return the merged settings

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: mergedSettings
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating settings'
    });
  }
};

// @desc    Test notification
// @route   POST /api/settings/test-notification
// @access  Private/Admin
exports.testNotification = async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Notification type is required'
      });
    }

    // Simulate sending a test notification
    
    // In a real application, you would actually send the notification
    // based on the type (email, SMS, push, etc.)

    res.status(200).json({
      success: true,
      message: `Test ${type} notification sent successfully`
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending test notification'
    });
  }
}; 