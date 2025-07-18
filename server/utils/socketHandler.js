// server/utils/socketHandler.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        throw new Error('No token provided');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('User account is deactivated');
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User ${socket.user.name} connected: ${socket.id}`);
    
    // Store user connection
    connectedUsers.set(socket.user.id.toString(), {
      socketId: socket.id,
      user: socket.user,
      connectedAt: new Date()
    });
    
    // Join user-specific room
    socket.join(`user_${socket.user.id}`);
    
    // Join role-specific room
    socket.join(`role_${socket.user.role}`);
    
    // Update user's online status
    socket.broadcast.emit('user_online', {
      userId: socket.user.id,
      userName: socket.user.name,
      userRole: socket.user.role,
      timestamp: new Date()
    });

    // Handle joining custom rooms
    socket.on('join_room', (room) => {
      socket.join(room);
      socket.emit('joined_room', { room, timestamp: new Date() });
      console.log(`User ${socket.user.name} joined room: ${room}`);
    });

    // Handle leaving custom rooms
    socket.on('leave_room', (room) => {
      socket.leave(room);
      socket.emit('left_room', { room, timestamp: new Date() });
      console.log(`User ${socket.user.name} left room: ${room}`);
    });

    // Handle sending notifications
    socket.on('send_notification', (data) => {
      const notification = {
        ...data.notification,
        id: `notif_${Date.now()}`,
        from: {
          id: socket.user.id,
          name: socket.user.name,
          role: socket.user.role
        },
        timestamp: new Date(),
        read: false
      };

      io.to(`user_${data.recipientId}`).emit('notification', notification);
      console.log(`Notification sent from ${socket.user.name} to user ${data.recipientId}`);
    });

    // Handle broadcasting to role
    socket.on('broadcast_to_role', (data) => {
      const message = {
        ...data.message,
        id: `broadcast_${Date.now()}`,
        from: {
          id: socket.user.id,
          name: socket.user.name,
          role: socket.user.role
        },
        timestamp: new Date(),
        type: 'broadcast'
      };

      socket.to(`role_${data.role}`).emit('broadcast_message', message);
      console.log(`Broadcast sent to role ${data.role} by ${socket.user.name}`);
    });

    // Handle meal booking updates
    socket.on('new_booking', (data) => {
      const bookingUpdate = {
        ...data,
        user: {
          id: socket.user.id,
          name: socket.user.name,
          studentId: socket.user.studentId
        },
        timestamp: new Date(),
        type: 'new_booking'
      };

      // Notify all admins
      io.to('role_admin').emit('booking_update', bookingUpdate);
      
      // Confirm to user
      socket.emit('booking_confirmed', {
        bookingId: data.bookingId,
        message: 'Your booking has been submitted successfully',
        timestamp: new Date()
      });

      console.log(`New booking by ${socket.user.name}: ${data.bookingId}`);
    });

    // Handle attendance marking
    socket.on('mark_attendance', (data) => {
      const attendanceData = {
        ...data,
        user: {
          id: socket.user.id,
          name: socket.user.name,
          studentId: socket.user.studentId
        },
        timestamp: new Date(),
        type: 'attendance_marked'
      };

      // Notify admins
      io.to('role_admin').emit('attendance_update', attendanceData);

      console.log(`Attendance marked by ${socket.user.name} for ${data.mealType}`);
    });

    // Handle user status updates
    socket.on('update_user_status', (data) => {
      const statusUpdate = {
        userId: socket.user.id,
        userName: socket.user.name,
        status: data.status,
        timestamp: new Date()
      };

      socket.broadcast.emit('user_status_updated', statusUpdate);
      console.log(`Status updated by ${socket.user.name}: ${data.status}`);
    });

    // Handle menu updates (Admin only)
    socket.on('menu_updated', (data) => {
      if (socket.user.role === 'admin') {
        const menuUpdate = {
          ...data,
          updatedBy: {
            id: socket.user.id,
            name: socket.user.name
          },
          timestamp: new Date(),
          type: 'menu_update'
        };

        socket.broadcast.emit('menu_update', menuUpdate);
        console.log(`Menu updated by admin ${socket.user.name}`);
      }
    });

    // Handle inventory alerts (Admin only)
    socket.on('inventory_alert', (data) => {
      if (socket.user.role === 'admin') {
        const alertData = {
          ...data,
          alertedBy: {
            id: socket.user.id,
            name: socket.user.name
          },
          timestamp: new Date(),
          type: 'inventory_alert'
        };

        io.to('role_admin').emit('inventory_alert', alertData);
        console.log(`Inventory alert by admin ${socket.user.name}`);
      }
    });

    // Handle payment updates
    socket.on('payment_update', (data) => {
      const paymentUpdate = {
        ...data,
        user: {
          id: socket.user.id,
          name: socket.user.name
        },
        timestamp: new Date(),
        type: 'payment_update'
      };

      // Notify user
      io.to(`user_${socket.user.id}`).emit('payment_status', paymentUpdate);
      
      // Notify admins
      io.to('role_admin').emit('payment_notification', paymentUpdate);

      console.log(`Payment update for ${socket.user.name}: ${data.status}`);
    });

    // Handle admin broadcasts
    socket.on('admin_broadcast', (data) => {
      if (socket.user.role === 'admin') {
        const broadcast = {
          ...data,
          from: {
            id: socket.user.id,
            name: socket.user.name
          },
          timestamp: new Date(),
          type: 'admin_announcement'
        };

        // Broadcast to all connected users
        socket.broadcast.emit('admin_announcement', broadcast);
        console.log(`Admin broadcast by ${socket.user.name}`);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(data.room).emit('user_typing', {
        userId: socket.user.id,
        userName: socket.user.name,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.room).emit('user_typing', {
        userId: socket.user.id,
        userName: socket.user.name,
        isTyping: false
      });
    });

    // Handle emergency alerts (Admin only)
    socket.on('emergency_alert', (data) => {
      if (socket.user.role === 'admin') {
        const emergencyAlert = {
          ...data,
          alertedBy: {
            id: socket.user.id,
            name: socket.user.name
          },
          timestamp: new Date(),
          type: 'emergency',
          priority: 'critical'
        };

        // Send to all connected users
        io.emit('emergency_alert', emergencyAlert);
        console.log(`🚨 Emergency alert by admin ${socket.user.name}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User ${socket.user.name} disconnected: ${socket.id} (${reason})`);
      
      // Remove from connected users
      connectedUsers.delete(socket.user.id.toString());
      
      // Update user's offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.user.id,
        userName: socket.user.name,
        userRole: socket.user.role,
        timestamp: new Date(),
        reason: reason
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user.name}:`, error);
    });
  });

  // Utility functions for broadcasting
  const broadcastToRole = (role, event, data) => {
    io.to(`role_${role}`).emit(event, data);
  };

  const broadcastToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
  };

  const broadcastToAll = (event, data) => {
    io.emit(event, data);
  };

  const getConnectedUsers = () => {
    return Array.from(connectedUsers.values());
  };

  const getUserConnectionInfo = (userId) => {
    return connectedUsers.get(userId.toString());
  };

  // Export utility functions
  return {
    broadcastToRole,
    broadcastToUser,
    broadcastToAll,
    getConnectedUsers,
    getUserConnectionInfo
  };
};

module.exports = socketHandler;
