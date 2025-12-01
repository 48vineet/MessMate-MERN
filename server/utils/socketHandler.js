// server/utils/socketHandler.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const EVENTS = require("../events");

const socketHandler = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        throw new Error("No token provided");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.isActive) {
        throw new Error("User account is deactivated");
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on(EVENTS.CONNECTION, (socket) => {
    // Simple per-socket rate limiting (burst + sustained)
    const limits = { windowMs: 60000, max: 120 }; // 120 events/minute
    let eventCount = 0;
    let windowStart = Date.now();

    const checkRate = () => {
      const now = Date.now();
      if (now - windowStart > limits.windowMs) {
        windowStart = now;
        eventCount = 0;
      }
      eventCount++;
      if (eventCount > limits.max) {
        socket.emit(EVENTS.SOCKET_ERROR, {
          code: "RATE_LIMIT",
          message: "Too many realtime events; slow down.",
        });
        return false;
      }
      return true;
    };

    // Store user connection
    connectedUsers.set(socket.user.id.toString(), {
      socketId: socket.id,
      user: socket.user,
      connectedAt: new Date(),
    });

    // Join user-specific room
    socket.join(`user_${socket.user.id}`);

    // Join role-specific room
    socket.join(`role_${socket.user.role}`);

    // Update user's online status
    socket.broadcast.emit(EVENTS.USER_ONLINE, {
      userId: socket.user.id,
      userName: socket.user.name,
      userRole: socket.user.role,
      timestamp: new Date(),
    });

    // Handle joining custom rooms
    socket.on("join_room", (room) => {
      socket.join(room);
      socket.emit("joined_room", { room, timestamp: new Date() });
    });

    // Handle leaving custom rooms
    socket.on("leave_room", (room) => {
      socket.leave(room);
      socket.emit("left_room", { room, timestamp: new Date() });
    });

    // Handle sending notifications
    socket.on("send_notification", (data) => {
      if (!checkRate()) return;

      const notification = {
        ...data.notification,
        id: `notif_${Date.now()}`,
        from: {
          id: socket.user.id,
          name: socket.user.name,
          role: socket.user.role,
        },
        timestamp: new Date(),
        read: false,
      };

      io.to(`user_${data.recipientId}`).emit(EVENTS.NOTIFICATION, notification);
    });

    // Handle broadcasting to role
    socket.on("broadcast_to_role", (data) => {
      if (!checkRate()) return;

      const message = {
        ...data.message,
        id: `broadcast_${Date.now()}`,
        from: {
          id: socket.user.id,
          name: socket.user.name,
          role: socket.user.role,
        },
        timestamp: new Date(),
        type: "broadcast",
      };

      socket.to(`role_${data.role}`).emit(EVENTS.ADMIN_ANNOUNCEMENT, message);
    });

    // Handle meal booking updates
    socket.on("new_booking", (data) => {
      if (!checkRate()) return;

      const bookingUpdate = {
        ...data,
        user: {
          id: socket.user.id,
          name: socket.user.name,
          studentId: socket.user.studentId,
        },
        timestamp: new Date(),
        type: "new_booking",
      };

      // Notify all admins
      io.to("role_admin").emit(EVENTS.BOOKING_UPDATE, bookingUpdate);

      // Confirm to user
      socket.emit("booking_confirmed", {
        bookingId: data.bookingId,
        message: "Your booking has been submitted successfully",
        timestamp: new Date(),
      });
    });

    // Handle attendance marking
    socket.on("mark_attendance", (data) => {
      if (!checkRate()) return;

      const attendanceData = {
        ...data,
        user: {
          id: socket.user.id,
          name: socket.user.name,
          studentId: socket.user.studentId,
        },
        timestamp: new Date(),
        type: "attendance_marked",
      };

      // Notify admins
      io.to("role_admin").emit("attendance_update", attendanceData);
    });

    // Handle user status updates
    socket.on("update_user_status", (data) => {
      if (!checkRate()) return;

      const statusUpdate = {
        userId: socket.user.id,
        userName: socket.user.name,
        status: data.status,
        timestamp: new Date(),
      };

      socket.broadcast.emit("user_status_updated", statusUpdate);
    });

    // Handle menu updates (Admin only)
    socket.on("menu_updated", (data) => {
      if (!checkRate()) return;

      if (socket.user.role === "admin") {
        const menuUpdate = {
          ...data,
          updatedBy: {
            id: socket.user.id,
            name: socket.user.name,
          },
          timestamp: new Date(),
          type: "menu_update",
        };

        socket.broadcast.emit(EVENTS.MENU_UPDATE, menuUpdate);
      }
    });

    // Handle inventory alerts (Admin only)
    socket.on("inventory_alert", (data) => {
      if (!checkRate()) return;

      if (socket.user.role === "admin") {
        const alertData = {
          ...data,
          alertedBy: {
            id: socket.user.id,
            name: socket.user.name,
          },
          timestamp: new Date(),
          type: "inventory_alert",
        };

        io.to("role_admin").emit(EVENTS.INVENTORY_ALERT, alertData);
      }
    });

    // Handle payment updates
    socket.on("payment_update", (data) => {
      if (!checkRate()) return;

      const paymentUpdate = {
        ...data,
        user: {
          id: socket.user.id,
          name: socket.user.name,
        },
        timestamp: new Date(),
        type: "payment_update",
      };

      // Notify user
      io.to(`user_${socket.user.id}`).emit(
        EVENTS.PAYMENT_STATUS,
        paymentUpdate
      );

      // Notify admins
      io.to("role_admin").emit(EVENTS.PAYMENT_STATUS, paymentUpdate);
    });

    // Handle admin broadcasts
    socket.on("admin_broadcast", (data) => {
      if (!checkRate()) return;

      if (socket.user.role === "admin") {
        const broadcast = {
          ...data,
          from: {
            id: socket.user.id,
            name: socket.user.name,
          },
          timestamp: new Date(),
          type: "admin_announcement",
        };

        // Broadcast to all connected users
        socket.broadcast.emit(EVENTS.ADMIN_ANNOUNCEMENT, broadcast);
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      socket.to(data.room).emit("user_typing", {
        userId: socket.user.id,
        userName: socket.user.name,
        isTyping: true,
      });
    });

    socket.on("typing_stop", (data) => {
      socket.to(data.room).emit("user_typing", {
        userId: socket.user.id,
        userName: socket.user.name,
        isTyping: false,
      });
    });

    // Handle emergency alerts (Admin only)
    socket.on("emergency_alert", (data) => {
      if (!checkRate()) return;

      if (socket.user.role === "admin") {
        const emergencyAlert = {
          ...data,
          alertedBy: {
            id: socket.user.id,
            name: socket.user.name,
          },
          timestamp: new Date(),
          type: "emergency",
          priority: "critical",
        };

        // Send to all connected users
        io.emit(EVENTS.EMERGENCY_ALERT, emergencyAlert);
      }
    });

    // Handle disconnect
    socket.on(EVENTS.DISCONNECT, (reason) => {
      // Remove from connected users
      connectedUsers.delete(socket.user.id.toString());

      // Update user's offline status
      socket.broadcast.emit(EVENTS.USER_OFFLINE, {
        userId: socket.user.id,
        userName: socket.user.name,
        userRole: socket.user.role,
        timestamp: new Date(),
        reason: reason,
      });
    });

    // Handle connection errors
    socket.on("error", (error) => {
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
    getUserConnectionInfo,
  };
};

module.exports = socketHandler;
