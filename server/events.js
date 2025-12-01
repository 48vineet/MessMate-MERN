// server/events.js
// Centralized Socket.IO event name constants (versioned)
module.exports = {
  VERSION: "v1",
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  NOTIFICATION: "notification",
  ADMIN_ANNOUNCEMENT: "admin_announcement",
  BOOKING_UPDATE: "booking_update",
  BOOKING_STATUS: "booking_status_update",
  PAYMENT_STATUS: "payment_status",
  MENU_UPDATE: "menu_update",
  INVENTORY_ALERT: "inventory_alert",
  EMERGENCY_ALERT: "emergency_alert",
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  SOCKET_ERROR: "socket_error",
};
