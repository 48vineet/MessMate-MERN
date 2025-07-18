// src/components/dashboard/QuickActions.jsx
import { motion } from 'framer-motion';
import { 
  QrCodeIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  HeartIcon,
  ChartBarIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { AnimatedCard, Button, Badge } from '../ui';
import { useState } from 'react';

const QuickActions = () => {
  const [activeAction, setActiveAction] = useState(null);

  const quickActions = [
    {
      id: 1,
      title: 'QR Code',
      subtitle: 'Scan to check-in',
      icon: QrCodeIcon,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      action: () => console.log('Open QR Code'),
      badge: null
    },
    {
      id: 2,
      title: 'Add Money',
      subtitle: 'Top up wallet',
      icon: CreditCardIcon,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      action: () => console.log('Add Money'),
      badge: null
    },
    {
      id: 3,
      title: 'Feedback',
      subtitle: 'Rate your meal',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      action: () => console.log('Give Feedback'),
      badge: '2'
    },
    {
      id: 4,
      title: 'Menu',
      subtitle: 'View today\'s menu',
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      action: () => console.log('View Menu'),
      badge: null
    },
    {
      id: 5,
      title: 'Profile',
      subtitle: 'Update details',
      icon: UserCircleIcon,
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      action: () => console.log('Edit Profile'),
      badge: null
    },
    {
      id: 6,
      title: 'Settings',
      subtitle: 'App preferences',
      icon: Cog6ToothIcon,
      color: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600',
      action: () => console.log('Open Settings'),
      badge: null
    },
    {
      id: 7,
      title: 'Favorites',
      subtitle: 'Saved meals',
      icon: HeartIcon,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      action: () => console.log('View Favorites'),
      badge: '5'
    },
    {
      id: 8,
      title: 'Analytics',
      subtitle: 'Your stats',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      action: () => console.log('View Analytics'),
      badge: null
    }
  ];

  const handleActionClick = (action) => {
    setActiveAction(action.id);
    action.action();
    setTimeout(() => setActiveAction(null), 300);
  };

  return (
    <AnimatedCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600">Access features instantly</p>
        </div>
        <motion.div
          animate={{ rotate: activeAction ? 360 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <CameraIcon className="h-6 w-6 text-primary-600" />
        </motion.div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleActionClick(action)}
            className={`
              relative cursor-pointer rounded-xl p-4 text-white transition-all duration-300
              ${action.color} ${action.hoverColor}
              ${activeAction === action.id ? 'ring-4 ring-white/30' : ''}
            `}
          >
            {/* Badge */}
            {action.badge && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
              >
                {action.badge}
              </motion.div>
            )}

            {/* Icon */}
            <div className="flex items-center justify-center mb-3">
              <action.icon className="h-8 w-8" />
            </div>

            {/* Content */}
            <div className="text-center">
              <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
              <p className="text-xs opacity-90">{action.subtitle}</p>
            </div>

            {/* Ripple Effect */}
            {activeAction === action.id && (
              <motion.div
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-white rounded-xl pointer-events-none"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Recent Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 pt-4 border-t border-gray-200"
      >
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Actions</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">QR Code Scanned</span>
            <span className="text-gray-500">2 min ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Added ₹500 to wallet</span>
            <span className="text-gray-500">1 hour ago</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Rated lunch meal</span>
            <span className="text-gray-500">3 hours ago</span>
          </div>
        </div>
      </motion.div>
    </AnimatedCard>
  );
};

export default QuickActions;
