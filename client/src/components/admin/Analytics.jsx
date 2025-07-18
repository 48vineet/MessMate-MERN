// src/components/admin/Analytics.jsx
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,      // Fixed: was TrendingUpIcon
  ArrowTrendingDownIcon,    // Fixed: was TrendingDownIcon
  CalendarDaysIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { 
  AnimatedCard, 
  Button, 
  Badge,
  Tabs,
  TabPanel,
  ProgressBar
} from '../ui';
import { useState } from 'react';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [activeTab, setActiveTab] = useState(0);

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const overviewStats = [
    {
      title: 'Total Revenue',
      value: '₹1,24,500',
      change: '+12.5%',
      trend: 'up',
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Total Bookings',
      value: '2,847',
      change: '+8.2%',
      trend: 'up',
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+3.1%',
      trend: 'up',
      icon: UsersIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Avg Order Value',
      value: '₹45.2',
      change: '-2.3%',
      trend: 'down',
      icon: ChartBarIcon,
      color: 'bg-orange-500'
    }
  ];

  const mealPopularity = [
    { meal: 'Dal Rice', orders: 850, percentage: 85 },
    { meal: 'Roti Sabzi', orders: 720, percentage: 72 },
    { meal: 'Poha', orders: 650, percentage: 65 },
    { meal: 'Idli Sambhar', orders: 480, percentage: 48 },
    { meal: 'Rajma Chawal', orders: 420, percentage: 42 }
  ];

  const weeklyData = [
    { day: 'Mon', breakfast: 180, lunch: 220, dinner: 195 },
    { day: 'Tue', breakfast: 165, lunch: 210, dinner: 180 },
    { day: 'Wed', breakfast: 190, lunch: 235, dinner: 200 },
    { day: 'Thu', breakfast: 175, lunch: 225, dinner: 185 },
    { day: 'Fri', breakfast: 200, lunch: 250, dinner: 210 },
    { day: 'Sat', breakfast: 160, lunch: 200, dinner: 170 },
    { day: 'Sun', breakfast: 140, lunch: 180, dinner: 155 }
  ];

  const feedbackStats = [
    { rating: 5, count: 45, percentage: 60 },
    { rating: 4, count: 20, percentage: 27 },
    { rating: 3, count: 8, percentage: 11 },
    { rating: 2, count: 1, percentage: 1 },
    { rating: 1, count: 1, percentage: 1 }
  ];

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
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              <Button variant="outline" leftIcon={<CalendarDaysIcon className="h-4 w-4" />}>
                Custom Range
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => (
            <AnimatedCard key={stat.title} delay={index * 0.1} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center">
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
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </AnimatedCard>
          ))}
        </div>

        {/* Analytics Tabs */}
        <AnimatedCard delay={0.4} className="p-6">
          <Tabs defaultTab={activeTab} onChange={setActiveTab}>
            <TabPanel label="Meal Analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Meal Popularity */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Most Popular Meals</h3>
                  <div className="space-y-4">
                    {mealPopularity.map((meal, index) => (
                      <motion.div
                        key={meal.meal}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{meal.meal}</p>
                          <p className="text-sm text-gray-600">{meal.orders} orders</p>
                        </div>
                        <div className="w-24">
                          <ProgressBar 
                            value={meal.percentage} 
                            color="primary"
                            size="sm"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Weekly Consumption */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Weekly Consumption</h3>
                  <div className="space-y-3">
                    {weeklyData.map((day, index) => (
                      <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium w-12">{day.day}</span>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                            <span>B: {day.breakfast}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                            <span>L: {day.lunch}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                            <span>D: {day.dinner}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel label="User Analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Engagement */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Daily Active Users</span>
                        <span className="text-2xl font-bold text-blue-600">892</span>
                      </div>
                      <ProgressBar value={75} color="primary" size="sm" />
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Weekly Active Users</span>
                        <span className="text-2xl font-bold text-green-600">1,234</span>
                      </div>
                      <ProgressBar value={85} color="success" size="sm" />
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Monthly Active Users</span>
                        <span className="text-2xl font-bold text-purple-600">2,145</span>
                      </div>
                      <ProgressBar value={90} color="secondary" size="sm" />
                    </div>
                  </div>
                </div>

                {/* User Feedback */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">User Feedback</h3>
                  <div className="space-y-3">
                    {feedbackStats.map((rating, index) => (
                      <motion.div
                        key={rating.rating}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{rating.rating}</span>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{rating.count}</span>
                          <div className="w-16">
                            <ProgressBar 
                              value={rating.percentage} 
                              color="warning"
                              size="sm"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel label="Financial Analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Meal Sales</span>
                        <span className="text-xl font-bold text-green-600">₹98,500</span>
                      </div>
                      <ProgressBar value={80} color="success" size="sm" />
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Subscription</span>
                        <span className="text-xl font-bold text-blue-600">₹26,000</span>
                      </div>
                      <ProgressBar value={20} color="primary" size="sm" />
                    </div>
                  </div>
                </div>

                {/* Cost Analysis */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Cost Analysis</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Ingredient Costs</span>
                        <span className="text-xl font-bold text-red-600">₹45,000</span>
                      </div>
                      <ProgressBar value={65} color="danger" size="sm" />
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Operational Costs</span>
                        <span className="text-xl font-bold text-orange-600">₹24,000</span>
                      </div>
                      <ProgressBar value={35} color="warning" size="sm" />
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Net Profit</span>
                        <span className="text-xl font-bold text-green-600">₹55,500</span>
                      </div>
                      <ProgressBar value={85} color="success" size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default Analytics;
