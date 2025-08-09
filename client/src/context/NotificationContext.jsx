import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import api from '../utils/api';

// Context
const NotificationContext = createContext();

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  settings: {}
};

// Actions
const NOTIFICATION_ACTIONS = {
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SETTINGS: 'SET_SETTINGS'
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    case NOTIFICATION_ACTIONS.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0
      };
    case NOTIFICATION_ACTIONS.DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification._id !== action.payload
        )
      };
    case NOTIFICATION_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case NOTIFICATION_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case NOTIFICATION_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case NOTIFICATION_ACTIONS.SET_SETTINGS:
      return { ...state, settings: action.payload };
    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const rateLimitedRef = useRef(false);
  const rateLimitTimerRef = useRef(null);
  const isAuthenticatedRef = useRef(false);

  // Check if user is authenticated
  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem('token');
    isAuthenticatedRef.current = !!token;
    return !!token;
  }, []);

  // Fetch notifications (with rate-limit handling)
  const fetchNotifications = useCallback(async (limit = 50) => {
    if (rateLimitedRef.current || !checkAuthStatus()) return { success: false, error: 'Not authenticated or rate limited.' };
    
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR });

      const response = await api.get(`/notifications?limit=${limit}`);
      if (response.data.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS,
          payload: response.data.notifications || []
        });
        return { success: true, notifications: response.data.notifications || [] };
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch notifications';

      if (status === 429) {
        if (!rateLimitedRef.current) {
          rateLimitedRef.current = true;
          console.warn('Rate limit hit: pausing notifications polling for 10 minutes.');
          if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current);
          rateLimitTimerRef.current = setTimeout(() => {
            rateLimitedRef.current = false;
          }, 10 * 60 * 1000); // 10 minutes pause
        }
      }
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: false });
    }
  }, [checkAuthStatus]);

  // Fetch unread count (with rate-limit handling)
  const fetchUnreadCount = useCallback(async () => {
    if (rateLimitedRef.current || !checkAuthStatus()) return { success: false, error: 'Not authenticated or rate limited.' };
    
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        dispatch({
          type: NOTIFICATION_ACTIONS.SET_UNREAD_COUNT,
          payload: response.data.count || 0
        });
        return { success: true, count: response.data.count || 0 };
      } else {
        throw new Error(response.data.message || 'Failed to fetch unread count');
      }
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch unread count';
      if (status === 429) {
        if (!rateLimitedRef.current) {
          rateLimitedRef.current = true;
          if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current);
          rateLimitTimerRef.current = setTimeout(() => {
            rateLimitedRef.current = false;
          }, 10 * 60 * 1000); // 10 minutes pause
        }
      }
      return { success: false, error: errorMessage };
    }
  }, [checkAuthStatus]);

  // Other methods unchanged...
  const markAsRead = useCallback(async (notificationId) => {
    if (!checkAuthStatus()) return { success: false, error: 'Not authenticated.' };
    
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_AS_READ, payload: notificationId });
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to mark notification as read');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to mark notification as read';
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [checkAuthStatus]);

  const markAllAsRead = useCallback(async () => {
    if (!checkAuthStatus()) return { success: false, error: 'Not authenticated.' };
    
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
      const response = await api.patch('/notifications/mark-all-read');
      if (response.data.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to mark all notifications as read');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to mark all notifications as read';
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: false });
    }
  }, [checkAuthStatus]);

  const deleteNotification = useCallback(async (notificationId) => {
    if (!checkAuthStatus()) return { success: false, error: 'Not authenticated.' };
    
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        dispatch({ type: NOTIFICATION_ACTIONS.DELETE_NOTIFICATION, payload: notificationId });
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to delete notification');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete notification';
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [checkAuthStatus]);

  const fetchSettings = useCallback(async () => {
    if (!checkAuthStatus()) return { success: false, error: 'Not authenticated.' };
    
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
      const response = await api.get('/notifications/settings');
      if (response.data.success) {
        const settings = response.data.settings || {};
        dispatch({ type: NOTIFICATION_ACTIONS.SET_SETTINGS, payload: settings });
        return { success: true, settings };
      } else {
        throw new Error(response.data.message || 'Failed to fetch notification settings');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch notification settings';
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [checkAuthStatus]);

  const updateSettings = useCallback(async (newSettings) => {
    if (!checkAuthStatus()) return { success: false, error: 'Not authenticated.' };
    
    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR });
      const response = await api.put('/notifications/settings', newSettings);
      if (response.data.success) {
        const settings = response.data.settings || {};
        dispatch({ type: NOTIFICATION_ACTIONS.SET_SETTINGS, payload: settings });
        return { success: true, settings };
      } else {
        throw new Error(response.data.message || 'Failed to update notification settings');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update notification settings';
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [checkAuthStatus]);

  const addNotification = useCallback((notification) => {
    dispatch({ type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION, payload: notification });
  }, []);

  const clearError = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ERROR });
  };

  // --- Only run when authenticated ---
  useEffect(() => {
    // Check authentication status
    const isAuthenticated = checkAuthStatus();
    
    if (isAuthenticated) {
      // Only fetch if authenticated
      fetchNotifications();
      setTimeout(() => {
        fetchUnreadCount();
      }, 3000); // 3 seconds later

      // Poll every 5 minutes (300 seconds) to avoid rate limiting
      const interval = setInterval(() => {
        if (!rateLimitedRef.current && checkAuthStatus()) {
          fetchNotifications();
          setTimeout(() => {
            fetchUnreadCount();
          }, 3000);
        }
      }, 300000);

      // Clean up polling on unmount
      return () => clearInterval(interval);
    }
  }, [checkAuthStatus]); // Removed fetchNotifications and fetchUnreadCount from dependencies

  const value = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    settings: state.settings,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchSettings,
    updateSettings,
    addNotification,
    clearError
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
