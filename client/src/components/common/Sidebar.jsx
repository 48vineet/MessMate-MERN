// src/components/common/Sidebar.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  QrCodeIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { Button, Badge, Avatar } from '../ui';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, className = "" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/dashboard', badge: null },
    { id: 'menu', label: 'Today\'s Menu', icon: ClipboardDocumentListIcon, path: '/menu', badge: 'New' },
    { id: 'bookings', label: 'My Bookings', icon: CalendarDaysIcon, path: '/bookings', badge: '3' },
    { id: 'qr-code', label: 'QR Code', icon: QrCodeIcon, path: '/qr-code', badge: null },
    { id: 'wallet', label: 'Wallet', icon: CreditCardIcon, path: '/wallet', badge: null },
    { id: 'favorites', label: 'Favorites', icon: HeartIcon, path: '/favorites', badge: null },
    { id: 'feedback', label: 'Feedback', icon: ChatBubbleLeftRightIcon, path: '/feedback', badge: '2' },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, path: '/settings', badge: null }
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: HomeIcon, path: '/admin/dashboard', badge: null },
    { id: 'users', label: 'User Management', icon: UserGroupIcon, path: '/admin/users', badge: null },
    { id: 'menu', label: 'Menu Management', icon: ClipboardDocumentListIcon, path: '/admin/menu', badge: null },
    { id: 'bookings', label: 'All Bookings', icon: CalendarDaysIcon, path: '/admin/bookings', badge: '12' },
    { id: 'inventory', label: 'Inventory', icon: CubeIcon, path: '/admin/inventory', badge: 'Low' },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, path: '/admin/analytics', badge: null },
    { id: 'feedback', label: 'Feedback', icon: ChatBubbleLeftRightIcon, path: '/admin/feedback', badge: '5' },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, path: '/admin/settings', badge: null }
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: -320,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    open: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }),
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    onClose();
  };

  const isActiveItem = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 lg:static lg:translate-x-0 flex flex-col ${className}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  MessMate
                </h2>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || 'User'} Panel
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden hover:bg-white/50"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar 
              name={user?.name || 'User'} 
              src={user?.avatar?.url}
              size="md"
              className="ring-2 ring-primary-200"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user?.name || 'Guest User'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user?.email || 'No email'}
              </p>
              {user?.studentId && (
                <p className="text-xs text-primary-600 font-medium">
                  ID: {user.studentId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={itemVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActiveItem(item.path)
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg transform scale-105'
                      : hoveredItem === item.id
                        ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    isActiveItem(item.path)
                      ? 'bg-white/20'
                      : hoveredItem === item.id
                        ? 'bg-primary-100'
                        : 'bg-transparent group-hover:bg-gray-100'
                  }`}>
                    <item.icon className={`h-5 w-5 ${
                      isActiveItem(item.path)
                        ? 'text-white'
                        : hoveredItem === item.id
                          ? 'text-primary-600'
                          : 'text-gray-500 group-hover:text-gray-700'
                    }`} />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <span className="font-medium">{item.label}</span>
                  </div>
                  
                  {item.badge && (
                    <Badge
                      variant={
                        item.badge === 'New' ? 'success' :
                        item.badge === 'Low' ? 'warning' :
                        isActiveItem(item.path) ? 'white' : 'danger'
                      }
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </nav>

        {/* Quick Stats Section */}
        {user?.role === 'student' && (
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center">
                  <p className="font-bold text-green-600">₹{user?.wallet?.balance || 0}</p>
                  <p className="text-xs text-gray-600">Wallet Balance</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-blue-600">{user?.stats?.totalBookings || 0}</p>
                  <p className="text-xs text-gray-600">Total Bookings</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Need Help?</p>
                  <p className="text-xs text-gray-600">Contact Support</p>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
