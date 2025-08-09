// src/components/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  UsersIcon,
  CurrencyRupeeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentActivity: [],
    alerts: [],
    charts: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use Promise.allSettled to handle individual API failures gracefully
      const results = await Promise.allSettled([
        api.get(`/analytics/stats?range=${timeRange}`),
        api.get('/analytics/recent-activity'),
        api.get('/analytics/alerts'),
        api.get(`/analytics/charts?range=${timeRange}`)
      ]);

      // Extract data from successful responses, provide fallbacks for failed ones
      const [statsResponse, activityResponse, alertsResponse, chartsResponse] = results;

      setDashboardData({
        stats: statsResponse.status === 'fulfilled' ? (statsResponse.value.data.stats || {}) : {
          totalUsers: 0,
          userGrowth: 0,
          todayRevenue: 0,
          revenueGrowth: 0,
          mealsServed: 0,
          mealGrowth: 0,
          activeBookings: 0,
          bookingGrowth: 0
        },
        recentActivity: activityResponse.status === 'fulfilled' ? (activityResponse.value.data.activities || []) : [],
        alerts: alertsResponse.status === 'fulfilled' ? (alertsResponse.value.data.alerts || []) : [],
        charts: chartsResponse.status === 'fulfilled' ? (chartsResponse.value.data.charts || {}) : {
          revenue: { labels: [], data: [] },
          bookings: { labels: [], data: [] },
          users: { labels: [], data: [] }
        }
      });

      // Show success message if all APIs worked
      if (results.every(result => result.status === 'fulfilled')) {
        console.log('Dashboard data loaded successfully');
      } else {
        console.warn('Some dashboard data failed to load, using fallback data');
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      // Set fallback data on complete failure
      setDashboardData({
        stats: {
          totalUsers: 0,
          userGrowth: 0,
          todayRevenue: 0,
          revenueGrowth: 0,
          mealsServed: 0,
          mealGrowth: 0,
          activeBookings: 0,
          bookingGrowth: 0
        },
        recentActivity: [],
        alerts: [],
        charts: {
          revenue: { labels: [], data: [] },
          bookings: { labels: [], data: [] },
          users: { labels: [], data: [] }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      title: 'Total Users',
      value: dashboardData.stats.totalUsers || 0,
      change: dashboardData.stats.userGrowth || 0,
      icon: UsersIcon,
      color: 'text-blue-600 bg-blue-100',
      prefix: ''
    },
    {
      title: 'Today\'s Revenue',
      value: dashboardData.stats.todayRevenue || 0,
      change: dashboardData.stats.revenueGrowth || 0,
      icon: CurrencyRupeeIcon,
      color: 'text-green-600 bg-green-100',
      prefix: '₹'
    },
    {
      title: 'Meals Served',
      value: dashboardData.stats.mealsServed || 0,
      change: dashboardData.stats.mealGrowth || 0,
      icon: CalendarDaysIcon,
      color: 'text-purple-600 bg-purple-100',
      prefix: ''
    },
    {
      title: 'Active Bookings',
      value: dashboardData.stats.activeBookings || 0,
      change: dashboardData.stats.bookingGrowth || 0,
      icon: ChartBarIcon,
      color: 'text-orange-600 bg-orange-100',
      prefix: ''
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
    if (change < 0) return < ArrowTrendingUpIcon className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default: return <ClockIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  // Simple SVG Chart Component
  const SimpleChart = ({ data, labels, title, color = '#3B82F6' }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    
    const width = 600;
    const height = 200;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = height - padding - ((value - minValue) / range) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={height - padding - ratio * chartHeight}
              x2={width - padding}
              y2={height - padding - ratio * chartHeight}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Line chart */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={points}
          />
          
          {/* Data points */}
          {data.map((value, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = height - padding - ((value - minValue) / range) * chartHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Labels */}
          {labels.map((label, index) => {
            const x = padding + (index / (labels.length - 1)) * chartWidth;
            return (
              <text
                key={index}
                x={x}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#6B7280"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
              <div className="h-96 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getGreeting()}, {user?.name}! 👋
              </h1>
              <p className="text-gray-600">
                Here's your MessMate admin overview for {timeRange}.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                {stat.change !== 0 && (
                  <div className="flex items-center">
                    {getChangeIcon(stat.change)}
                    <span className={`text-sm font-medium ml-1 ${getChangeColor(stat.change)}`}>
                      {Math.abs(stat.change)}%
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.prefix}{formatNumber(stat.value)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  vs previous {timeRange}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alerts */}
        {dashboardData.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">System Alerts</h2>
              <div className="space-y-3">
                {dashboardData.alerts.map((alert, index) => (
                  <motion.div
                    key={alert._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {dashboardData.recentActivity.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Revenue Trends</h2>
            </div>
            <div className="p-6">
              {dashboardData.charts.revenue ? (
                <SimpleChart
                  data={dashboardData.charts.revenue.data}
                  labels={dashboardData.charts.revenue.labels}
                  title="Revenue Over Time"
                  color="#4F46E5" // A dark blue color for revenue
                />
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No chart data available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Manage Users', icon: UsersIcon, path: '/admin/users', color: 'bg-blue-500' },
              { title: 'Menu Management', icon: CalendarDaysIcon, path: '/admin/menu', color: 'bg-green-500' },
              { title: 'View Reports', icon: ChartBarIcon, path: '/admin/reports', color: 'bg-purple-500' },
              { title: 'System Settings', icon: CurrencyRupeeIcon, path: '/admin/settings', color: 'bg-orange-500' }
            ].map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className={`p-4 rounded-xl text-white transition-all ${action.color} hover:shadow-lg`}
              >
                <action.icon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">{action.title}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
