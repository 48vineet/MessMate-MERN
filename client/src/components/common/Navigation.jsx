// src/components/common/Navigation.jsx
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserIcon,
  CogIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { Badge } from '../ui';
import { useState } from 'react';

const Navigation = ({ userRole = 'student', activeItem, onItemClick }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      path: '/dashboard',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Overview and quick stats'
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: ClipboardDocumentListIcon,
      path: '/menu',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Browse available meals'
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: CalendarDaysIcon,
      path: '/bookings',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Manage your reservations',
      badge: '3'
    },
    {
      id: 'qr-code',
      label: 'QR Code',
      icon: QrCodeIcon,
      path: '/qr-code',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Generate check-in codes'
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: HeartIcon,
      path: '/favorites',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Your favorite meals'
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: ChatBubbleLeftRightIcon,
      path: '/feedback',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Rate and review meals',
      badge: '2'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      path: '/profile',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      description: 'Account settings'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: CogIcon,
      path: '/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'App preferences'
    }
  ];

  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <nav className="p-4">
      <div className="space-y-2">
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                activeItem === item.id
                  ? `${item.bgColor} ${item.color} shadow-lg`
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {/* Icon */}
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                activeItem === item.id 
                  ? 'bg-white shadow-md' 
                  : hoveredItem === item.id 
                    ? `${item.bgColor}` 
                    : 'bg-transparent'
              }`}>
                <item.icon className={`h-5 w-5 ${
                  activeItem === item.id 
                    ? item.color 
                    : hoveredItem === item.id 
                      ? item.color 
                      : 'text-gray-500'
                }`} />
              </div>

              {/* Label and Description */}
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={activeItem === item.id ? 'primary' : 'danger'}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className={`text-xs mt-1 transition-all duration-200 ${
                  activeItem === item.id 
                    ? 'text-gray-600' 
                    : hoveredItem === item.id 
                      ? 'text-gray-600' 
                      : 'text-gray-500'
                }`}>
                  {item.description}
                </p>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 pt-4 border-t border-gray-200"
      >
        <h3 className="text-sm font-medium text-gray-700 mb-3 px-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-lg">🍽️</span>
            <span>Book Next Meal</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-lg">💰</span>
            <span>Add Money</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-lg">📊</span>
            <span>View Stats</span>
          </button>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navigation;
