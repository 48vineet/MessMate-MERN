import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNotification } from "../context/NotificationContext";

const NotificationsPage = () => {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead: markAsReadServer,
    markAllAsRead: markAllAsReadServer,
    deleteNotification: deleteNotificationServer,
  } = useNotification();
  const [localNotifications, setLocalNotifications] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications(50);
  }, [fetchNotifications]);

  useEffect(() => {
    const mapped = (notifications || []).map((n) => ({
      id: n._id,
      title: n.title || "Notification",
      message: n.message || "",
      type: n.type || "info",
      read: n.isRead || false,
      createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
    }));
    setLocalNotifications(mapped);
  }, [notifications]);

  const markAsRead = async (notificationId) => {
    const res = await markAsReadServer(notificationId);
    if (res?.success) {
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      toast.success("Marked as read");
    }
  };

  const markAllAsRead = async () => {
    const res = await markAllAsReadServer();
    if (res?.success) {
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    const res = await deleteNotificationServer(notificationId);
    if (res?.success) {
      setLocalNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      toast.success("Notification deleted");
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "success":
        return CheckCircleIcon;
      case "warning":
        return ExclamationTriangleIcon;
      case "error":
        return ExclamationTriangleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }
  };

  const filteredNotifications = localNotifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = useMemo(
    () => localNotifications.filter((n) => !n.read).length,
    [localNotifications]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 border">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Notifications
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount !== 1 ? "s" : ""
                    }`
                  : "All caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap touch-target"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {["all", "unread", "success", "warning", "info"].map(
              (filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap touch-target ${
                    filter === filterType
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              )
            )}
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 sm:space-y-4"
        >
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
              <BellIcon className="h-10 sm:h-12 w-10 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                You're all caught up!
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const IconComponent = getTypeIcon(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 ${
                    !notification.read ? "border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                          <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                            {notification.title}
                          </h3>
                          <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                            {formatTimestamp(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 break-words">
                          {notification.message}
                        </p>
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium touch-target"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 touch-target"
                    >
                      <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationsPage;
