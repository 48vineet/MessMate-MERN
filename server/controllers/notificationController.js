const Notification = require('../models/Notification');

// GET /api/notifications?limit=50
exports.getNotifications = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(200).json({ 
        success: true, 
        notifications: [] 
      });
    }

    const limit = parseInt(req.query.limit) || 50;
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error('Error in getNotifications:', err.stack);
    res.status(200).json({ 
      success: true, 
      notifications: [] 
    });
  }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(200).json({ 
        success: true, 
        count: 0 
      });
    }

    const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.status(200).json({ success: true, count });
  } catch (err) {
    console.error('Error in getUnreadCount:', err.stack);
    res.status(200).json({ 
      success: true, 
      count: 0 
    });
  }
};

// GET /api/notifications/recent
exports.getRecentNotifications = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(200).json({ 
        success: true, 
        notifications: [] 
      });
    }
    
    const limit = parseInt(req.query.limit) || 5;
    
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    console.error('Error in getRecentNotifications:', err.stack);
    res.status(200).json({ 
      success: true, 
      notifications: [] 
    });
  }
};

// PATCH /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const notificationId = req.params.id;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.status(200).json({ success: true, notification });
  } catch (err) {
    console.error('Error in markAsRead:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark notification as read', 
      error: err.message 
    });
  }
};

// PATCH /api/notifications/mark-all-read
exports.markAllAsRead = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error in markAllAsRead:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark all notifications as read', 
      error: err.message 
    });
  }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const notificationId = req.params.id;
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    console.error('Error in deleteNotification:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete notification', 
      error: err.message 
    });
  }
};

// GET /api/notifications/settings
exports.getSettings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // For now, return default settings
    const settings = {
      email: true,
      push: true,
      sms: false,
      mealReminders: true,
      bookingConfirmations: true,
      paymentNotifications: true
    };

    res.status(200).json({ success: true, settings });
  } catch (err) {
    console.error('Error in getSettings:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notification settings', 
      error: err.message 
    });
  }
};

// PUT /api/notifications/settings
exports.updateSettings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const newSettings = req.body;
    const settings = {
      email: newSettings.email ?? true,
      push: newSettings.push ?? true,
      sms: newSettings.sms ?? false,
      mealReminders: newSettings.mealReminders ?? true,
      bookingConfirmations: newSettings.bookingConfirmations ?? true,
      paymentNotifications: newSettings.paymentNotifications ?? true
    };

    res.status(200).json({ success: true, settings });
  } catch (err) {
    console.error('Error in updateSettings:', err.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update notification settings', 
      error: err.message 
    });
  }
};
