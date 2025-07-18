// src/components/common/Header.jsx
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  UserCircleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  CogIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { 
  Button, 
  Badge, 
  Avatar,
  Dropdown,
  DropdownItem,
  Input
} from '../ui';
import { useState } from 'react';

const Header = ({ user, onToggleSidebar, showSearch = true }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const notifications = [
    { id: 1, message: 'New menu available', time: '2 min ago', type: 'info' },
    { id: 2, message: 'Booking confirmed', time: '5 min ago', type: 'success' },
    { id: 3, message: 'Low wallet balance', time: '1 hour ago', type: 'warning' }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="lg:hidden"
            >
              <Bars3Icon className="h-5 w-5" />
            </Button>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  MessMate
                </h1>
                <p className="text-xs text-gray-500">Smart Mess Management</p>
              </div>
            </motion.div>
          </div>

          {/* Center Section - Search */}
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex flex-1 max-w-md mx-8"
            >
              <Input
                placeholder="Search meals, bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                className="w-full"
              />
            </motion.div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden lg:block text-right"
            >
              <p className="text-sm font-medium text-gray-900">
                {getGreeting()}, {user?.name || 'User'}!
              </p>
              <p className="text-xs text-gray-500">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </motion.div>

            {/* Notifications */}
            <Dropdown
              trigger={
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative">
                    <BellIcon className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      >
                        {notifications.length}
                      </motion.span>
                    )}
                  </Button>
                </div>
              }
              position="bottom-right"
            >
              <div className="w-80 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Notifications</h3>
                </div>
                {notifications.map((notification) => (
                  <DropdownItem key={notification.id} className="block p-3 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </DropdownItem>
                ))}
              </div>
            </Dropdown>

            {/* User Menu */}
            <Dropdown
              trigger={
                <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                  <Avatar name={user?.name || 'User'} size="sm" />
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                </div>
              }
              position="bottom-right"
            >
              <DropdownItem>
                <UserCircleIcon className="h-4 w-4 mr-2" />
                Profile
              </DropdownItem>
              <DropdownItem>
                <CogIcon className="h-4 w-4 mr-2" />
                Settings
              </DropdownItem>
              <DropdownItem className="text-red-600">
                Logout
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
