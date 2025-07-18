// hooks/useToast.js
import { useState, useCallback, useRef } from 'react';

const TOAST_DURATION = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  loading: 0 // Infinite until dismissed
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // Generate unique toast ID
  const generateToastId = useCallback(() => {
    toastIdRef.current += 1;
    return `toast-${toastIdRef.current}-${Date.now()}`;
  }, []);

  // Add new toast
  const showToast = useCallback((message, type = 'info', options = {}) => {
    const id = generateToastId();
    const duration = options.duration ?? TOAST_DURATION[type];
    
    const toast = {
      id,
      message,
      type,
      timestamp: Date.now(),
      duration,
      dismissible: options.dismissible ?? true,
      action: options.action,
      persistent: options.persistent ?? false,
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Auto-dismiss toast after duration (if not persistent)
    if (duration > 0 && !toast.persistent) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  }, [generateToastId]);

  // Dismiss specific toast
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Dismiss all toasts
  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Update toast
  const updateToast = useCallback((id, updates) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id 
          ? { ...toast, ...updates }
          : toast
      )
    );
  }, []);

  // Specific toast type methods
  const success = useCallback((message, options = {}) => {
    return showToast(message, 'success', {
      icon: '✅',
      ...options
    });
  }, [showToast]);

  const error = useCallback((message, options = {}) => {
    return showToast(message, 'error', {
      icon: '❌',
      persistent: true,
      ...options
    });
  }, [showToast]);

  const warning = useCallback((message, options = {}) => {
    return showToast(message, 'warning', {
      icon: '⚠️',
      ...options
    });
  }, [showToast]);

  const info = useCallback((message, options = {}) => {
    return showToast(message, 'info', {
      icon: 'ℹ️',
      ...options
    });
  }, [showToast]);

  const loading = useCallback((message, options = {}) => {
    return showToast(message, 'loading', {
      icon: '⏳',
      persistent: true,
      dismissible: false,
      ...options
    });
  }, [showToast]);

  // Promise-based toast for async operations
  const promise = useCallback(async (promise, messages, options = {}) => {
    const loadingId = loading(messages.loading || 'Loading...', options.loading);
    
    try {
      const result = await promise;
      dismissToast(loadingId);
      
      if (messages.success) {
        success(messages.success, options.success);
      }
      
      return result;
    } catch (error) {
      dismissToast(loadingId);
      
      if (messages.error) {
        error(messages.error, options.error);
      }
      
      throw error;
    }
  }, [loading, success, error, dismissToast]);

  // Custom toast with action
  const actionToast = useCallback((message, actionText, actionHandler, options = {}) => {
    return showToast(message, 'info', {
      action: {
        text: actionText,
        handler: actionHandler
      },
      persistent: true,
      ...options
    });
  }, [showToast]);

  // Undo toast
  const undoToast = useCallback((message, undoHandler, options = {}) => {
    return actionToast(message, 'Undo', undoHandler, {
      type: 'warning',
      duration: 8000,
      ...options
    });
  }, [actionToast]);

  return {
    // State
    toasts,
    
    // Main methods
    showToast,
    dismissToast,
    dismissAllToasts,
    updateToast,
    
    // Type-specific methods
    success,
    error,
    warning,
    info,
    loading,
    
    // Advanced methods
    promise,
    actionToast,
    undoToast
  };
};

// Global toast hook (for use across the app)
let globalToastHandler = null;

export const setGlobalToastHandler = (handler) => {
  globalToastHandler = handler;
};

export const toast = {
  success: (message, options) => globalToastHandler?.success(message, options),
  error: (message, options) => globalToastHandler?.error(message, options),
  warning: (message, options) => globalToastHandler?.warning(message, options),
  info: (message, options) => globalToastHandler?.info(message, options),
  loading: (message, options) => globalToastHandler?.loading(message, options),
  dismiss: (id) => globalToastHandler?.dismissToast(id),
  dismissAll: () => globalToastHandler?.dismissAllToasts(),
  promise: (promise, messages, options) => globalToastHandler?.promise(promise, messages, options)
};

export default useToast;
