// components/dashboard/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { useBooking } from '../../hooks/useBooking';
import { useMenu } from '../../hooks/useMenu';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner } from '../ui';

// Import your other dashboard components
import MenuCard from './MenuCard';
import BookingCard from './BookingCard';
import ProfileCard from './ProfileCard';
import AttendanceCard from './AttendanceCard';
import NotificationCard from './NotificationCard';
import QuickActions from './QuickActions';
import MealHistory from './MealHistory';

const UserDashboard = () => {
  const { user } = useAuth();
  const { isConnected, onNotification } = useSocket();
  const { todayBookings, fetchBookings, loading: bookingLoading } = useBooking();
  const { todayMenu, fetchTodayMenu, loading: menuLoading } = useMenu();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const { userAPI } = useApi();

  // Fetch data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          fetchBookings(),
          fetchTodayMenu()
        ]);

        // Fetch user statistics
        if (user?.id) {
          const statsResponse = await userAPI.getUserStats(user.id);
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Dashboard data loading error:', error);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  // Listen for real-time notifications
  useEffect(() => {
    const cleanup = onNotification?.((notification) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          ...notification,
          timestamp: new Date().toISOString()
        },
        ...prev.slice(0, 9) // Keep only last 10 notifications
      ]);
    });

    return cleanup;
  }, [onNotification]);

  // Show loading state
  if (bookingLoading || menuLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="mt-2 text-gray-600">
                Here's what's happening with your meals today
              </p>
            </div>
            
            {/* Connection Status Indicator */}
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Live updates active' : 'Offline mode'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <QuickActions 
              user={user}
              todayBookings={todayBookings}
              todayMenu={todayMenu}
            />
            
            {/* Today's Menu Preview */}
            <MenuCard 
              todayMenu={todayMenu}
              compact={true}
              showBookButton={true}
            />
            
            {/* Current Bookings */}
            <BookingCard 
              todayBookings={todayBookings}
              loading={bookingLoading}
            />
            
            {/* Recent Meal History */}
            <MealHistory 
              user={user}
              limit={5}
            />
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <ProfileCard 
              user={user}
              stats={stats}
            />
            
            {/* Attendance Overview */}
            <AttendanceCard 
              user={user}
            />
            
            {/* Live Notifications */}
            <NotificationCard 
              notifications={notifications}
              onMarkAsRead={(notificationId) => {
                setNotifications(prev => 
                  prev.map(notif => 
                    notif.id === notificationId 
                      ? { ...notif, read: true }
                      : notif
                  )
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
