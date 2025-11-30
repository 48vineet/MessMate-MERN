// src/hooks/useNotifications.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useNotification as useNotificationContext } from "../context/NotificationContext";

const useNotifications = () => {
  return useNotificationContext();
};

export const useUnreadCount = () => {
  const { unreadCount, fetchUnreadCount } = useNotificationContext();
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchUnreadCount();
      return result;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [fetchUnreadCount]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { unreadCount, loading, refetch };
};

export const useRealtimeNotifications = () => {
  const { addNotification, fetchUnreadCount } = useNotificationContext();
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    try {
      // Build a robust WS base URL:
      // 1) Prefer explicit VITE_WS_URL
      // 2) Derive from VITE_API_URL by switching http->ws and stripping trailing /api
      // 3) Fallback to localhost only in dev
      const deriveFromApi = () => {
        const api = import.meta.env.VITE_API_URL;
        if (!api) return null;
        const base = api.replace(/\/?api\/?$/, "");
        return base.replace(/^http/i, "ws");
      };

      const defaultDev = "ws://localhost:5000";
      const wsBase =
        import.meta.env.VITE_WS_URL ||
        deriveFromApi() ||
        (import.meta.env.DEV ? defaultDev : null);

      if (!wsBase) {
        throw new Error("WebSocket base URL is not configured");
      }

      const wsUrl = `${wsBase}/notifications`;
      const token = localStorage.getItem("messmate_token");

      if (!token) {
        setConnectionError("No authentication token found");
        return;
      }

      wsRef.current = new WebSocket(`${wsUrl}?token=${token}`);

      wsRef.current.onopen = () => {
        setConnected(true);
        setConnectionError(null);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "notification") {
            addNotification(data.notification);
            fetchUnreadCount();
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("Connection error");
      };

      wsRef.current.onclose = () => {
        setConnected(false);
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      setConnectionError(error.message);
    }
  }, [addNotification, fetchUnreadCount]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      disconnect();
    };
  }, [connectWebSocket, disconnect]);

  return {
    connected,
    connectionError,
    disconnect,
    reconnect: connectWebSocket,
  };
};

export const useNotificationActions = () => {
  const { markAsRead, markAllAsRead, deleteNotification } =
    useNotificationContext();
  const [actionLoading, setActionLoading] = useState({});

  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      setActionLoading((prev) => ({ ...prev, [notificationId]: "reading" }));

      try {
        const result = await markAsRead(notificationId);
        return result;
      } catch (error) {
        const errorMessage =
          error.message || "Failed to mark notification as read";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setActionLoading((prev) => ({ ...prev, [notificationId]: null }));
      }
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    setActionLoading((prev) => ({ ...prev, all: "reading" }));

    try {
      const result = await markAllAsRead();
      if (result.success) {
        toast.success("All notifications marked as read");
      }
      return result;
    } catch (error) {
      const errorMessage =
        error.message || "Failed to mark all notifications as read";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading((prev) => ({ ...prev, all: null }));
    }
  }, [markAllAsRead]);

  const handleDeleteNotification = useCallback(
    async (notificationId) => {
      setActionLoading((prev) => ({ ...prev, [notificationId]: "deleting" }));

      try {
        const result = await deleteNotification(notificationId);
        if (result.success) {
          toast.success("Notification deleted");
        }
        return result;
      } catch (error) {
        const errorMessage = error.message || "Failed to delete notification";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setActionLoading((prev) => ({ ...prev, [notificationId]: null }));
      }
    },
    [deleteNotification]
  );

  return {
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    actionLoading,
  };
};

export const useNotificationSettings = () => {
  const { settings, fetchSettings, updateSettings } = useNotificationContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchSettings();

      if (!result.success) {
        setError(result.error || "Failed to fetch notification settings");
      }

      return result;
    } catch (error) {
      const errorMessage =
        error.message || "Failed to fetch notification settings";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchSettings]);

  const saveSettings = useCallback(
    async (newSettings) => {
      setLoading(true);
      setError(null);

      try {
        const result = await updateSettings(newSettings);

        if (result.success) {
          toast.success("Notification settings updated");
        } else {
          setError(result.error || "Failed to update notification settings");
        }

        return result;
      } catch (error) {
        const errorMessage =
          error.message || "Failed to update notification settings";
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [updateSettings]
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return { settings, loading, error, saveSettings, refetch: loadSettings };
};

export default useNotifications;
