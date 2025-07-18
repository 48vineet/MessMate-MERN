// client/src/utils/socketClient.js
import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(import.meta.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('🔌 Connected to MessMate server');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
    });
  }

  // Notification methods
  onNotification(callback) {
    this.socket?.on('notification', callback);
  }

  onUserOnline(callback) {
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback) {
    this.socket?.on('user_offline', callback);
  }

  // Booking methods
  sendBooking(bookingData) {
    this.socket?.emit('new_booking', bookingData);
  }

  onBookingUpdate(callback) {
    this.socket?.on('booking_update', callback);
  }

  onBookingConfirmed(callback) {
    this.socket?.on('booking_confirmed', callback);
  }

  // Menu methods
  onMenuUpdate(callback) {
    this.socket?.on('menu_update', callback);
  }

  // Payment methods
  onPaymentStatus(callback) {
    this.socket?.on('payment_status', callback);
  }

  sendPaymentUpdate(paymentData) {
    this.socket?.emit('payment_update', paymentData);
  }

  // Admin methods
  onAdminAnnouncement(callback) {
    this.socket?.on('admin_announcement', callback);
  }

  sendAdminBroadcast(message) {
    this.socket?.emit('admin_broadcast', message);
  }

  // Room management
  joinRoom(room) {
    this.socket?.emit('join_room', room);
  }

  leaveRoom(room) {
    this.socket?.emit('leave_room', room);
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Generic event listener
  on(event, callback) {
    this.socket?.on(event, callback);
  }

  // Generic event emitter
  emit(event, data) {
    this.socket?.emit(event, data);
  }

  // Remove listener
  off(event, callback) {
    this.socket?.off(event, callback);
  }
}

// Export singleton instance
export default new SocketClient();
