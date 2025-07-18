// src/components/admin/ReportsPanel.jsx
import { motion } from 'framer-motion';
import { 
  DocumentArrowDownIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  PrinterIcon,
  ShareIcon,
  FunnelIcon
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

const ReportsPanel = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('sales');

  const reportTypes = [
    { value: 'sales', label: 'Sales Report', icon: ChartBarIcon },
    { value: 'inventory', label: 'Inventory Report', icon: FunnelIcon },
    { value: 'user', label: 'User Activity', icon: CalendarDaysIcon },
    { value: 'financial', label: 'Financial Report', icon: DocumentArrowDownIcon }
  ];

  const salesData = {
    totalRevenue: 124500,
    totalOrders: 2847,
    avgOrderValue: 43.7,
    topMeals: [
      { name: 'Dal Rice', revenue: 38250, orders: 850 },
      { name: 'Roti Sabzi', revenue: 25200, orders: 720 },
      { name: 'Poha', revenue: 16250, orders: 650 }
    ],
    dailySales: [
      { date: '2025-07-11', revenue: 15200, orders: 342 },
      { date: '2025-07-12', revenue: 18750, orders: 425 },
      { date: '2025-07-13', revenue: 16800, orders: 378 },
      { date: '2025-07-14', revenue: 19200, orders: 445 },
      { date: '2025-07-15', revenue: 17500, orders: 398 },
      { date: '2025-07-16', revenue: 20100, orders: 465 },
      { date: '2025-07-17', revenue: 16900, orders: 394 }
    ]
  };

  const inventoryData = {
    totalItems: 68,
    lowStockItems: 12,
    outOfStockItems: 3,
    totalValue: 156000,
    categories: [
      { name: 'Grains', items: 15, value: 45000 },
      { name: 'Vegetables', items: 25, value: 38000 },
      { name: 'Pulses', items: 12, value: 32000 },
      { name: 'Spices', items: 16, value: 41000 }
    ]
  };

  const userActivity = {
    totalUsers: 1234,
    activeUsers: 987,
    newUsers: 45,
    retention: 85.2,
    engagement: [
      { metric: 'Daily Active Users', value: 892, percentage: 72 },
      { metric: 'Weekly Active Users', value: 1156, percentage: 94 },
      { metric: 'Monthly Active Users', value: 1234, percentage: 100 }
    ]
  };

  const handleExport = (format) => {
    console.log(`Exporting ${reportType} report in ${format} format`);
  };

  const handlePrint = () => {
    console.log('Printing report...');
  };

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
              <p className="text-gray-600">Generate detailed reports and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <Button 
                variant="outline" 
                leftIcon={<PrinterIcon className="h-4 w-4" />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button 
                variant="primary" 
                leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                onClick={() => handleExport('pdf')}
              >
                Export PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Report Type Selector */}
        <AnimatedCard delay={0.1} className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {reportTypes.map((type) => (
              <motion.button
                key={type.value}
                onClick={() => setReportType(type.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  reportType === type.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <type.icon className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </motion.button>
            ))}
          </div>
        </AnimatedCard>

        {/* Report Content */}
        <AnimatedCard delay={0.2} className="p-6">
          <Tabs defaultTab={0}>
            <TabPanel label="Overview">
              {reportType === 'sales' && (
                <div className="space-y-6">
                  {/* Sales Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700">Total Revenue</span>
                        <span className="text-2xl font-bold text-green-600">₹{salesData.totalRevenue.toLocaleString()}</span>
                      </div>
                      <ProgressBar value={85} color="success" size="sm" />
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">Total Orders</span>
                        <span className="text-2xl font-bold text-blue-600">{salesData.totalOrders.toLocaleString()}</span>
                      </div>
                      <ProgressBar value={78} color="primary" size="sm" />
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700">Avg Order Value</span>
                        <span className="text-2xl font-bold text-purple-600">₹{salesData.avgOrderValue}</span>
                      </div>
                      <ProgressBar value={65} color="secondary" size="sm" />
                    </div>
                  </div>

                  {/* Top Meals */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Top Performing Meals</h3>
                    <div className="space-y-3">
                      {salesData.topMeals.map((meal, index) => (
                        <motion.div
                          key={meal.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{meal.name}</p>
                            <p className="text-sm text-gray-600">{meal.orders} orders</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{meal.revenue.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Revenue</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'inventory' && (
                <div className="space-y-6">
                  {/* Inventory Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">Total Items</span>
                      <p className="text-2xl font-bold text-blue-600">{inventoryData.totalItems}</p>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <span className="text-sm font-medium text-yellow-700">Low Stock</span>
                      <p className="text-2xl font-bold text-yellow-600">{inventoryData.lowStockItems}</p>
                    </div>
                    <div className="bg-red-50 p-6 rounded-lg">
                      <span className="text-sm font-medium text-red-700">Out of Stock</span>
                      <p className="text-2xl font-bold text-red-600">{inventoryData.outOfStockItems}</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <span className="text-sm font-medium text-green-700">Total Value</span>
                      <p className="text-2xl font-bold text-green-600">₹{inventoryData.totalValue.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                    <div className="space-y-3">
                      {inventoryData.categories.map((category, index) => (
                        <motion.div
                          key={category.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-gray-600">{category.items} items</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{category.value.toLocaleString()}</p>
                            <div className="w-20 mt-1">
                              <ProgressBar 
                                value={(category.value / inventoryData.totalValue) * 100} 
                                color="primary" 
                                size="sm" 
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'user' && (
                <div className="space-y-6">
                  {/* User Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <span className="text-sm font-medium text-purple-700">Total Users</span>
                      <p className="text-2xl font-bold text-purple-600">{userActivity.totalUsers}</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <span className="text-sm font-medium text-green-700">Active Users</span>
                      <p className="text-2xl font-bold text-green-600">{userActivity.activeUsers}</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">New Users</span>
                      <p className="text-2xl font-bold text-blue-600">{userActivity.newUsers}</p>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-lg">
                      <span className="text-sm font-medium text-orange-700">Retention Rate</span>
                      <p className="text-2xl font-bold text-orange-600">{userActivity.retention}%</p>
                    </div>
                  </div>

                  {/* Engagement Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
                    <div className="space-y-4">
                      {userActivity.engagement.map((metric, index) => (
                        <motion.div
                          key={metric.metric}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium">{metric.metric}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold">{metric.value}</span>
                            <div className="w-24">
                              <ProgressBar 
                                value={metric.percentage} 
                                color="primary" 
                                size="sm" 
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabPanel>

            <TabPanel label="Detailed View">
              <div className="text-center py-12">
                <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Analytics</h3>
                <p className="text-gray-600">Comprehensive charts and graphs will be displayed here</p>
              </div>
            </TabPanel>

            <TabPanel label="Export Options">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => handleExport('pdf')}
                  >
                    <DocumentArrowDownIcon className="h-8 w-8 mb-2" />
                    <span>Export as PDF</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => handleExport('excel')}
                  >
                    <DocumentArrowDownIcon className="h-8 w-8 mb-2" />
                    <span>Export as Excel</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex-col"
                    onClick={() => handleExport('csv')}
                  >
                    <DocumentArrowDownIcon className="h-8 w-8 mb-2" />
                    <span>Export as CSV</span>
                  </Button>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default ReportsPanel;
