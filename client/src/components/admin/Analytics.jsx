// src/components/admin/Analytics.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    revenue: { current: 0, growth: 0 },
    users: { current: 0, growth: 0, new: 0, active: 0, retention: 0 },
    bookings: { current: 0, growth: 0 },
    satisfaction: { current: 0, growth: 0 },
    charts: { topMeals: [], dailyRevenue: [], mealDistribution: [] }
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [dateRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics?range=${dateRange}`);
      const data = response.data.analytics || {};
      
      // Merge with default values to ensure all properties exist
      setAnalyticsData({
        revenue: { current: 0, growth: 0, ...data.revenue },
        users: { current: 0, growth: 0, new: 0, active: 0, retention: 0, ...data.users },
        bookings: { current: 0, growth: 0, ...data.bookings },
        satisfaction: { current: 0, growth: 0, ...data.satisfaction },
        charts: { topMeals: [], dailyRevenue: [], mealDistribution: [], ...data.charts }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await api.get(`/analytics/export?range=${dateRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const metrics = [
    {
      title: 'Total Revenue',
      current: formatCurrency(analyticsData?.revenue?.current || 0),
      growth: analyticsData?.revenue?.growth || 0,
      icon: CurrencyRupeeIcon,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Active Users',
      current: (analyticsData?.users?.current || 0).toLocaleString(),
      growth: analyticsData?.users?.growth || 0,
      icon: UsersIcon,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Total Bookings',
      current: (analyticsData?.bookings?.current || 0).toLocaleString(),
      growth: analyticsData?.bookings?.growth || 0,
      icon: CalendarDaysIcon,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Satisfaction Rate',
      current: `${(analyticsData?.satisfaction?.current || 0).toFixed(1)}%`,
      growth: analyticsData?.satisfaction?.growth || 0,
      icon: ChartBarIcon,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
                <div className="flex items-center">
                  {metric.growth > 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : metric.growth < 0 ? (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  ) : null}
                  <span className={`text-sm font-medium ${getGrowthColor(metric.growth)}`}>
                    {metric.growth > 0 ? '+' : ''}{metric.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.current}</p>
                <p className="text-xs text-gray-500 mt-1">vs previous period</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Revenue</h3>
            <div className="h-64">
              {analyticsData?.charts?.dailyRevenue?.length > 0 ? (
                <div className="h-full flex items-end justify-between space-x-1">
                  {analyticsData.charts.dailyRevenue.slice(-7).map((day, index) => {
                    const maxRevenue = Math.max(...analyticsData.charts.dailyRevenue.map(d => d.revenue));
                    const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${height}%` }}
                          title={`${day.date}: ₹${day.revenue}`}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2 text-center">
                          {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No revenue data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Meal Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Meal Distribution</h3>
            <div className="h-64">
              {analyticsData?.charts?.mealDistribution?.length > 0 ? (
                <div className="h-full flex flex-col justify-center space-y-4">
                  {analyticsData.charts.mealDistribution.map((meal, index) => {
                    const totalOrders = analyticsData.charts.mealDistribution.reduce((sum, m) => sum + m.orders, 0);
                    const percentage = totalOrders > 0 ? (meal.orders / totalOrders) * 100 : 0;
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium capitalize">{meal.mealType || 'Unknown'}</span>
                            <span className="text-gray-600">{meal.orders} orders</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${colors[index % colors.length]}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No meal distribution data available</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Meals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Meals</h3>
            <div className="space-y-3">
              {analyticsData?.charts?.topMeals?.length > 0 ? (
                analyticsData.charts.topMeals.map((meal, index) => {
                  const mealIcons = {
                    'Chicken Biryani': '🍛',
                    'Veg Thali': '🥗',
                    'Butter Chicken': '🍗',
                    'Paneer Tikka': '🧀',
                    'Dal Khichdi': '🍚',
                    'default': '🍽️'
                  };
                  const icon = mealIcons[meal.name] || mealIcons.default;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{meal.name}</p>
                          <p className="text-sm text-gray-600">{meal.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(meal.revenue)}</p>
                        <p className="text-sm text-gray-500">{meal.rating.toFixed(1)}⭐</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-gray-500">No meal data available</p>
                  <p className="text-sm text-gray-400 mt-1">Start creating menus to see performance data</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* User Growth Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <UsersIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">New Registrations</p>
                    <p className="text-sm text-blue-700">This {dateRange}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">
                    {analyticsData?.users?.new || 0}
                  </p>
                  <p className="text-sm text-blue-600">users</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <ChartBarIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">Active Users</p>
                    <p className="text-sm text-green-700">Daily average</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-900">
                    {analyticsData?.users?.active || 0}
                  </p>
                  <p className="text-sm text-green-600">users/day</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">Retention Rate</p>
                    <p className="text-sm text-purple-700">Monthly retention</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-900">
                    {analyticsData?.users?.retention || 0}%
                  </p>
                  <p className="text-sm text-purple-600">retained</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;