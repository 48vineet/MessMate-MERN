// hooks/useSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const reconnectAttempts = useRef(0);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(import.meta.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id,
          userRole: user.role
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('🔌 Connected to MessMate server');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        showToast('Connected to live updates', 'success');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Connection error:', error);
        setIsConnected(false);
        reconnectAttempts.current++;
        
        if (reconnectAttempts.current > 3) {
          showToast('Connection issues. Some features may not work.', 'error');
        }
      });

      // User status events
      newSocket.on('user_online', (data) => {
        setOnlineUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
      });

      newSocket.on('user_offline', (data) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user, showToast]);

  // Generic event listener
  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
  }, [socket]);

  // Generic event emitter
  const emit = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [socket, isConnected]);

  // Notification methods
  const onNotification = useCallback((callback) => {
    return on('notification', callback);
  }, [on]);

  const sendNotification = useCallback((recipientId, notification) => {
    emit('send_notification', { recipientId, notification });
  }, [emit]);

  // Booking methods
  const onBookingUpdate = useCallback((callback) => {
    return on('booking_update', callback);
  }, [on]);

  const sendBookingUpdate = useCallback((bookingData) => {
    emit('new_booking', bookingData);
  }, [emit]);

  // Menu methods
  const onMenuUpdate = useCallback((callback) => {
    return on('menu_update', callback);
  }, [on]);

  const sendMenuUpdate = useCallback((menuData) => {
    emit('menu_updated', menuData);
  }, [emit]);

  // Payment methods
  const onPaymentUpdate = useCallback((callback) => {
    return on('payment_status', callback);
  }, [on]);

  const sendPaymentUpdate = useCallback((paymentData) => {
    emit('payment_update', paymentData);
  }, [emit]);

  // Admin methods
  const onAdminAnnouncement = useCallback((callback) => {
    return on('admin_announcement', callback);
  }, [on]);

  const sendAdminBroadcast = useCallback((message) => {
    emit('admin_broadcast', message);
  }, [emit]);

  // Room management
  const joinRoom = useCallback((room) => {
    emit('join_room', room);
  }, [emit]);

  const leaveRoom = useCallback((room) => {
    emit('leave_room', room);
  }, [emit]);

  return {
    socket,
    isConnected,
    onlineUsers,
    // Generic methods
    on,
    emit,
    // Specific methods
    onNotification,
    sendNotification,
    onBookingUpdate,
    sendBookingUpdate,
    onMenuUpdate,
    sendMenuUpdate,
    onPaymentUpdate,
    sendPaymentUpdate,
    onAdminAnnouncement,
    sendAdminBroadcast,
    joinRoom,
    leaveRoom
  };
};

export default useSocket;
