// src/context/SocketContext.js
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [liveUpdates, setLiveUpdates] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(import.meta.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id,
          userRole: user.role
        },
        transports: ['websocket', 'polling']
      });

      setSocket(newSocket);

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Join user-specific room
      newSocket.emit('join_user_room', user.id);

      // Join role-specific room
      newSocket.emit('join_role_room', user.role);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  // Set up event listeners
  useEffect(() => {
    if (socket) {
      // Real-time notifications
      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo192.png'
          });
        }
      });

      // Menu updates
      socket.on('menu_updated', (menuData) => {
        setLiveUpdates(prev => ({
          ...prev,
          menu: menuData
        }));
      });

      // Booking updates
      socket.on('booking_updated', (bookingData) => {
        setLiveUpdates(prev => ({
          ...prev,
          booking: bookingData
        }));
      });

      // Inventory updates
      socket.on('inventory_updated', (inventoryData) => {
        setLiveUpdates(prev => ({
          ...prev,
          inventory: inventoryData
        }));
      });

      // User status updates
      socket.on('user_status_updated', (userStatusData) => {
        setLiveUpdates(prev => ({
          ...prev,
          userStatus: userStatusData
        }));
      });

      // Online users update
      socket.on('online_users_updated', (users) => {
        setOnlineUsers(users);
      });

      // System announcements
      socket.on('system_announcement', (announcement) => {
        setNotifications(prev => [{
          id: Date.now(),
          type: 'system',
          title: 'System Announcement',
          message: announcement.message,
          timestamp: new Date().toISOString(),
          priority: announcement.priority || 'normal'
        }, ...prev]);
      });

      // Meal availability updates
      socket.on('meal_availability_updated', (mealData) => {
        setLiveUpdates(prev => ({
          ...prev,
          mealAvailability: mealData
        }));
      });

      return () => {
        socket.off('notification');
        socket.off('menu_updated');
        socket.off('booking_updated');
        socket.off('inventory_updated');
        socket.off('user_status_updated');
        socket.off('online_users_updated');
        socket.off('system_announcement');
        socket.off('meal_availability_updated');
      };
    }
  }, [socket]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Send notification
  const sendNotification = useCallback((recipientId, notification) => {
    if (socket && isConnected) {
      socket.emit('send_notification', {
        recipientId,
        notification: {
          ...notification,
          senderId: user?.id,
          senderName: user?.name,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [socket, isConnected, user]);

  // Broadcast to role
  const broadcastToRole = useCallback((role, message) => {
    if (socket && isConnected) {
      socket.emit('broadcast_to_role', {
        role,
        message: {
          ...message,
          senderId: user?.id,
          senderName: user?.name,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [socket, isConnected, user]);

  // Join room
  const joinRoom = useCallback((roomId) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
    }
  }, [socket, isConnected]);

  // Leave room
  const leaveRoom = useCallback((roomId) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomId);
    }
  }, [socket, isConnected]);

  // Send message to room
  const sendToRoom = useCallback((roomId, message) => {
    if (socket && isConnected) {
      socket.emit('send_to_room', {
        roomId,
        message: {
          ...message,
          senderId: user?.id,
          senderName: user?.name,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [socket, isConnected, user]);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread notifications count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Update user status
  const updateUserStatus = useCallback((status) => {
    if (socket && isConnected) {
      socket.emit('update_user_status', {
        userId: user?.id,
        status
      });
    }
  }, [socket, isConnected, user]);

  // Real-time meal booking
  const bookMeal = useCallback((mealData) => {
    if (socket && isConnected) {
      socket.emit('book_meal', {
        ...mealData,
        userId: user?.id
      });
    }
  }, [socket, isConnected, user]);

  // Real-time attendance marking
  const markAttendance = useCallback((attendanceData) => {
    if (socket && isConnected) {
      socket.emit('mark_attendance', {
        ...attendanceData,
        userId: user?.id
      });
    }
  }, [socket, isConnected, user]);

  const value = {
    socket,
    isConnected,
    notifications,
    liveUpdates,
    onlineUsers,
    
    // Functions
    sendNotification,
    broadcastToRole,
    joinRoom,
    leaveRoom,
    sendToRoom,
    markNotificationAsRead,
    clearAllNotifications,
    getUnreadCount,
    updateUserStatus,
    bookMeal,
    markAttendance,
    
    // Computed values
    unreadCount: getUnreadCount(),
    hasUnreadNotifications: getUnreadCount() > 0,
    recentNotifications: notifications.slice(0, 5)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
