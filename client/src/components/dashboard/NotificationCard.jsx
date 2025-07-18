// src/components/dashboard/NotificationCard.jsx
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { AnimatedCard, Button, Badge, Dropdown, DropdownItem } from '../ui';
import { useState } from 'react';

const NotificationCard = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'Menu Update',
      message: 'Tomorrow\'s lunch menu has been updated with special items!',
      time: '2 minutes ago',
      isRead: false,
      priority: 'normal'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Low Wallet Balance',
      message: 'Your wallet balance is below ₹100. Consider adding money.',
      time: '5 minutes ago',
      isRead: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'success',
      title: 'Booking Confirmed',
      message: 'Your lunch booking for tomorrow has been confirmed.',
      time: '1 hour ago',
      isRead: true,
      priority: 'normal'
    },
    {
      id: 4,
      type: 'error',
      title: 'Booking Cancelled',
      message: 'Your dinner booking was cancelled due to insufficient balance.',
      time: '3 hours ago',
      isRead: false,
      priority: 'high'
    },
    {
      id: 5,
      type: 'info',
      title: 'New Feature',
      message: 'QR code scanning is now available for faster check-ins!',
      time: '1 day ago',
      isRead: true,
      priority: 'low'
    }
  ]);

  const getNotificationIcon = (type) => {
    const iconClasses = "h-5 w-5";
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClasses} text-green-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClasses} text-yellow-500`} />;
      case 'error':
        return <XMarkIcon className={`${iconClasses} text-red-500`} />;
      default:
        return <InformationCircleIcon className={`${iconClasses} text-blue-500`} />;
    }
  };

  const getNotificationBg = (type, isRead) => {
    const baseClasses = "p-4 rounded-lg border-l-4 transition-all duration-300";
    if (isRead) {
      return `${baseClasses} bg-gray-50 border-l-gray-300`;
    }
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-l-green-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-l-yellow-500`;
      case 'error':
        return `${baseClasses} bg-red-50 border-l-red-500`;
      default:
        return `${baseClasses} bg-blue-50 border-l-blue-500`;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="warning" className="text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="gray" className="text-xs">Low</Badge>;
      default:
        return null;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatedCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <BellIcon className="h-6 w-6 text-primary-600" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-600">{unreadCount} unread</p>
          </div>
        </div>
        
        <Dropdown
          trigger={
            <Button variant="ghost" size="sm">
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
          }
        >
          <DropdownItem onClick={markAllAsRead}>
            Mark all as read
          </DropdownItem>
          <DropdownItem onClick={() => setNotifications([])}>
            Clear all
          </DropdownItem>
        </Dropdown>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications yet</p>
          </motion.div>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={getNotificationBg(notification.type, notification.isRead)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-medium ${
                      notification.isRead ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(notification.priority)}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-sm ${
                    notification.isRead ? 'text-gray-500' : 'text-gray-700'
                  }`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{notification.time}</span>
                    <div className="flex items-center space-x-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs"
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <Button variant="outline" size="sm" className="w-full">
            View All Notifications
          </Button>
        </motion.div>
      )}
    </AnimatedCard>
  );
};

export default NotificationCard;
