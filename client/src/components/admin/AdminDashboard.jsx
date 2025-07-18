// src/components/admin/AdminDashboard.jsx
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CubeIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,        // ✅ Fixed
  ArrowTrendingDownIcon,      // ✅ Fixed
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  BellAlertIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  AnimatedCard, 
  Button, 
  Badge, 
  Avatar, 
  ProgressBar,
  Card,
  Skeleton 
} from '../ui';
import { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 1234,
    todayAttendance: 987,
    inventoryItems: 45,
    pendingBookings: 23,
    totalRevenue: 45650,
    monthlyGrowth: 12.5,
    attendanceRate: 79.9,
    lowStockItems: 8
  });

  const stats = [
    { 
      label: 'Total Students', 
      value: dashboardData.totalStudents.toLocaleString(), 
      icon: UserGroupIcon, 
      color: 'bg-blue-500',
      change: '+5.2%',
      trend: 'up',
      description: 'Active students this month'
    },
    { 
      label: 'Today\'s Attendance', 
      value: `${dashboardData.todayAttendance}/${dashboardData.totalStudents}`, 
      icon: ChartBarIcon, 
      color: 'bg-green-500',
      change: '+2.1%',
      trend: 'up',
      description: `${dashboardData.attendanceRate}% attendance rate`
    },
    { 
      label: 'Inventory Items', 
      value: dashboardData.inventoryItems, 
      icon: CubeIcon, 
      color: 'bg-purple-500',
      change: '-1.2%',
      trend: 'down',
      description: `${dashboardData.lowStockItems} items low stock`
    },
    { 
      label: 'Pending Bookings', 
      value: dashboardData.pendingBookings, 
      icon: ClipboardDocumentListIcon, 
      color: 'bg-orange-500',
      change: '+8.3%',
      trend: 'up',
      description: 'Require approval'
    }
  ];

  const recentBookings = [
    { 
      id: 1, 
      name: 'Arjun Sharma', 
      studentId: 'CS001', 
      meal: 'Lunch', 
      time: '12:30 PM', 
      status: 'confirmed',
      amount: 45,
      avatar: 'AS'
    },
    { 
      id: 2, 
      name: 'Priya Patel', 
      studentId: 'IT002', 
      meal: 'Dinner', 
      time: '7:00 PM', 
      status: 'pending',
      amount: 50,
      avatar: 'PP'
    },
    { 
      id: 3, 
      name: 'Rahul Kumar', 
      studentId: 'EC003', 
      meal: 'Breakfast', 
      time: '8:00 AM', 
      status: 'confirmed',
      amount: 25,
      avatar: 'RK'
    },
    { 
      id: 4, 
      name: 'Sneha Singh', 
      studentId: 'ME004', 
      meal: 'Lunch', 
      time: '1:00 PM', 
      status: 'cancelled',
      amount: 45,
      avatar: 'SS'
    },
    { 
      id: 5, 
      name: 'Vikram Yadav', 
      studentId: 'EE005', 
      meal: 'Dinner', 
      time: '7:30 PM', 
      status: 'confirmed',
      amount: 50,
      avatar: 'VY'
    }
  ];

  const inventoryAlerts = [
    { 
      item: 'Basmati Rice', 
      level: 'Low', 
      percentage: 15, 
      color: 'danger',
      quantity: '50 kg',
      supplier: 'ABC Foods',
      lastUpdated: '2 hours ago'
    },
    { 
      item: 'Toor Dal', 
      level: 'Medium', 
      percentage: 45, 
      color: 'warning',
      quantity: '180 kg',
      supplier: 'XYZ Grains',
      lastUpdated: '4 hours ago'
    },
    { 
      item: 'Cooking Oil', 
      level: 'Critical', 
      percentage: 5, 
      color: 'danger',
      quantity: '10 L',
      supplier: 'Oil Mart',
      lastUpdated: '1 hour ago'
    },
    { 
      item: 'Mixed Vegetables', 
      level: 'Good', 
      percentage: 80, 
      color: 'success',
      quantity: '200 kg',
      supplier: 'Fresh Greens',
      lastUpdated: '6 hours ago'
    },
    { 
      item: 'Wheat Flour', 
      level: 'Medium', 
      percentage: 35, 
      color: 'warning',
      quantity: '150 kg',
      supplier: 'Grain Master',
      lastUpdated: '3 hours ago'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove students and staff',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      action: '/admin/users'
    },
    {
      title: 'Update Menu',
      description: 'Modify today\'s menu and pricing',
      icon: ClipboardDocumentListIcon,
      color: 'bg-green-500',
      action: '/admin/menu'
    },
    {
      title: 'Check Inventory',
      description: 'Monitor stock levels and suppliers',
      icon: CubeIcon,
      color: 'bg-purple-500',
      action: '/admin/inventory'
    },
    {
      title: 'View Reports',
      description: 'Analytics and business insights',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      action: '/admin/analytics'
    },
    {
      title: 'Notifications',
      description: 'Send announcements to students',
      icon: BellAlertIcon,
      color: 'bg-red-500',
      action: '/admin/notifications'
    },
    {
      title: 'Settings',
      description: 'Configure system preferences',
      icon: Cog6ToothIcon,
      color: 'bg-gray-500',
      action: '/admin/settings'
    }
  ];

  const revenueData = {
    today: 12450,
    yesterday: 11200,
    thisWeek: 78650,
    lastWeek: 72400,
    thisMonth: 285300,
    lastMonth: 267800
  };

  useEffect(() => {
    // Simulate API call
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In real app, fetch from your backend API
        // const response = await fetch('/api/admin/dashboard');
        // const data = await response.json();
        // setDashboardData(data);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'gray';
    }
  };

  const handleQuickAction = (action) => {
    // In real app, use React Router navigation
    console.log('Navigate to:', action);
    // navigate(action);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton height="h-8" width="w-64" className="mb-2" />
            <Skeleton height="h-4" width="w-96" className="mb-4" />
            <div className="flex space-x-4">
              <Skeleton height="h-10" width="w-32" />
              <Skeleton height="h-10" width="w-32" />
            </div>
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center">
                  <Skeleton width="w-12" height="h-12" className="rounded-full mr-4" />
                  <div className="flex-1">
                    <Skeleton width="w-20" height="h-4" className="mb-2" />
                    <Skeleton width="w-16" height="h-6" className="mb-1" />
                    <Skeleton width="w-12" height="h-3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <Skeleton height="h-6" width="w-32" className="mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton width="w-10" height="h-10" className="rounded-full mr-3" />
                    <div className="flex-1">
                      <Skeleton width="w-24" height="h-4" className="mb-1" />
                      <Skeleton width="w-20" height="h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card className="p-6">
              <Skeleton height="h-6" width="w-32" className="mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton width="w-3" height="h-3" className="rounded-full mr-3" />
                      <Skeleton width="w-20" height="h-4" />
                    </div>
                    <Skeleton width="w-16" height="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard 🎛️
              </h1>
              <p className="text-gray-600">
                Welcome back! Here's what's happening in your mess today.
              </p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <div className="flex items-center">
                  <CurrencyRupeeIcon className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-green-700">Today's Revenue</p>
                    <p className="font-bold text-green-800">₹{revenueData.today.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  leftIcon={<DocumentTextIcon className="h-4 w-4" />}
                  onClick={() => handleQuickAction('/admin/reports')}
                >
                  Reports
                </Button>
                <Button 
                  variant="primary"
                  leftIcon={<ChartBarIcon className="h-4 w-4" />}
                  onClick={() => handleQuickAction('/admin/analytics')}
                >
                  Analytics
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <AnimatedCard key={stat.label} delay={index * 0.1} className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.color} mr-4 shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
                <div className="flex items-center ml-4">
                  {stat.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Bookings - Takes 2 columns */}
          <div className="lg:col-span-2">
            <AnimatedCard delay={0.4} className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                  <p className="text-sm text-gray-600">Latest meal reservations from students</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  rightIcon={<EyeIcon className="h-4 w-4" />}
                  onClick={() => handleQuickAction('/admin/bookings')}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-l-blue-500"
                  >
                    <div className="flex items-center flex-1">
                      <Avatar 
                        name={booking.name} 
                        fallback={booking.avatar}
                        size="sm" 
                        className="mr-3 ring-2 ring-blue-100"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{booking.name}</p>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            {booking.studentId}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{booking.meal} - {booking.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{booking.amount}</p>
                      </div>
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedCard>
          </div>

          {/* Inventory Alerts - Takes 1 column */}
          <div className="lg:col-span-1">
            <AnimatedCard delay={0.5} className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
                  <p className="text-sm text-gray-600">Current stock levels</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  rightIcon={<EyeIcon className="h-4 w-4" />}
                  onClick={() => handleQuickAction('/admin/inventory')}
                >
                  Manage
                </Button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {inventoryAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.item}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-purple-500"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          alert.color === 'danger' ? 'bg-red-500' :
                          alert.color === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{alert.item}</p>
                          <p className="text-xs text-gray-600">{alert.quantity} • {alert.supplier}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        alert.color === 'danger' ? 'bg-red-100 text-red-700' :
                        alert.color === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {alert.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-3">
                        <ProgressBar 
                          value={alert.percentage} 
                          color={alert.color === 'success' ? 'success' : 'danger'}
                          size="sm"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {alert.percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Updated {alert.lastUpdated}</p>
                  </motion.div>
                ))}
              </div>
            </AnimatedCard>
          </div>
        </div>

        {/* Quick Actions */}
        <AnimatedCard delay={0.6} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Frequently used admin functions</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              leftIcon={<PlusIcon className="h-4 w-4" />}
            >
              Customize
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  className="h-24 w-full flex-col p-4 hover:shadow-lg transition-all duration-300"
                  onClick={() => handleQuickAction(action.action)}
                >
                  <div className={`p-2 rounded-lg ${action.color} mb-2`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {action.title}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>

        {/* Revenue Overview */}
        <AnimatedCard delay={0.8} className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Today</p>
              <p className="text-xl font-bold text-blue-900">₹{revenueData.today.toLocaleString()}</p>
              <p className="text-xs text-blue-600">+₹{(revenueData.today - revenueData.yesterday).toLocaleString()} vs yesterday</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700 font-medium">This Week</p>
              <p className="text-xl font-bold text-green-900">₹{revenueData.thisWeek.toLocaleString()}</p>
              <p className="text-xs text-green-600">+₹{(revenueData.thisWeek - revenueData.lastWeek).toLocaleString()} vs last week</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">This Month</p>
              <p className="text-xl font-bold text-purple-900">₹{revenueData.thisMonth.toLocaleString()}</p>
              <p className="text-xs text-purple-600">+₹{(revenueData.thisMonth - revenueData.lastMonth).toLocaleString()} vs last month</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-700 font-medium">Avg/Student</p>
              <p className="text-xl font-bold text-orange-900">₹{Math.round(revenueData.thisMonth / dashboardData.totalStudents)}</p>
              <p className="text-xs text-orange-600">Monthly average</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Growth Rate</p>
              <p className="text-xl font-bold text-red-900">{dashboardData.monthlyGrowth}%</p>
              <p className="text-xs text-red-600">Month over month</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">Attendance</p>
              <p className="text-xl font-bold text-gray-900">{dashboardData.attendanceRate}%</p>
              <p className="text-xs text-gray-600">Daily average</p>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
