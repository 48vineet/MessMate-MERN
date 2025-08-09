// src/components/admin/ReportsPanel.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  UsersIcon,
  ChartBarIcon,
  PrinterIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const ReportsPanel = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState({
    sales: null,
    inventory: null,
    users: null,
    feedback: null
  });

  const reportTypes = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Revenue, bookings, and transaction analysis',
      icon: CurrencyRupeeIcon,
      color: 'bg-green-100 text-green-600',
      fields: ['revenue', 'bookings', 'popular_items', 'payment_methods']
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Stock levels, consumption, and reorder alerts',
      icon: ChartBarIcon,
      color: 'bg-blue-100 text-blue-600',
      fields: ['stock_levels', 'consumption', 'low_stock', 'expired_items']
    },
    {
      id: 'users',
      title: 'User Analytics',
      description: 'User activity, registrations, and engagement',
      icon: UsersIcon,
      color: 'bg-purple-100 text-purple-600',
      fields: ['registrations', 'active_users', 'meal_preferences', 'attendance']
    },
    {
      id: 'feedback',
      title: 'Feedback Report',
      description: 'Ratings, reviews, and satisfaction metrics',
      icon: DocumentChartBarIcon,
      color: 'bg-orange-100 text-orange-600',
      fields: ['ratings', 'comments', 'satisfaction_trends', 'improvement_areas']
    }
  ];

  useEffect(() => {
    fetchReportsHistory();
  }, []);

  const fetchReportsHistory = async () => {
    try {
      const response = await api.get('/reports/history');
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports history:', error);
      toast.error('Failed to load reports history');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType) => {
    setGeneratingReport(reportType);
    try {
      const response = await api.post('/reports/generate', {
        type: reportType,
        dateRange: selectedDateRange,
        includeCharts: true
      });

      setReportData(prev => ({
        ...prev,
        [reportType]: response.data.report
      }));

      toast.success(`${reportType} report generated successfully`);
      fetchReportsHistory();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(`Failed to generate ${reportType} report`);
    } finally {
      setGeneratingReport(null);
    }
  };

  const downloadReport = async (reportId, format = 'pdf', reportType = null) => {
    try {
      const params = { format };
      
      // Add report type and date range if available
      if (reportType) {
        params.type = reportType;
        params.dateRange = JSON.stringify(selectedDateRange);
      }
      
      const response = await api.get(`/reports/${reportId}/download`, {
        params,
        responseType: 'blob'
      });

      // Determine file extension based on format
      const fileExtension = format === 'excel' ? 'csv' : format;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType || 'report'}-${reportId}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const scheduleReport = async (reportType, frequency) => {
    try {
      await api.post('/reports/schedule', {
        type: reportType,
        frequency, // daily, weekly, monthly
        enabled: true
      });

      toast.success(`${reportType} report scheduled ${frequency}`);
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast.error('Failed to schedule report');
    }
  };

  const getReportStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      processing: { color: 'bg-yellow-100 text-yellow-800', text: 'Processing' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
      scheduled: { color: 'bg-blue-100 text-blue-800', text: 'Scheduled' }
    };

    const config = statusConfig[status] || statusConfig.completed;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports and insights</p>
        </motion.div>

        {/* Date Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Report Parameters</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDateRange.startDate}
                  onChange={(e) => setSelectedDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={selectedDateRange.endDate}
                  onChange={(e) => setSelectedDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportTypes.map((reportType, index) => (
            <motion.div
              key={reportType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${reportType.color}`}>
                  <reportType.icon className="h-6 w-6" />
                </div>
                {reportData[reportType.id] && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => downloadReport(reportData[reportType.id].id, 'pdf', reportType.id)}
                      className="p-1 text-gray-600 hover:text-blue-600 rounded transition-colors"
                      title="Download PDF"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(`/reports/${reportData[reportType.id].id}/view`, '_blank')}
                      className="p-1 text-gray-600 hover:text-blue-600 rounded transition-colors"
                      title="View Report"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{reportType.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{reportType.description}</p>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Includes:</p>
                  {reportType.fields.map((field) => (
                    <p key={field} className="text-xs text-gray-600">• {field.replace('_', ' ')}</p>
                  ))}
                </div>
                
                {reportType.id === 'users' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => window.location.href = '/admin/users/reports'}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Detailed User Report →
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => generateReport(reportType.id)}
                  disabled={generatingReport === reportType.id}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    generatingReport === reportType.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {generatingReport === reportType.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    'Generate Report'
                  )}
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={() => scheduleReport(reportType.id, 'weekly')}
                    className="flex-1 py-1 px-2 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Schedule Weekly
                  </button>
                  <button
                    onClick={() => scheduleReport(reportType.id, 'monthly')}
                    className="flex-1 py-1 px-2 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Schedule Monthly
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Reports</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.length > 0 ? (
                  reports.map((report, index) => (
                    <motion.tr
                      key={report._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <DocumentChartBarIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">{report.type} Report</p>
                            <p className="text-sm text-gray-500">ID: {report._id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(report.dateRange.startDate).toLocaleDateString('en-IN')} - 
                          {new Date(report.dateRange.endDate).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(report.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getReportStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(`/reports/${report._id}/view`, '_blank')}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="View Report"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => downloadReport(report._id, 'pdf', report.type)}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title="Download PDF"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => downloadReport(report._id, 'excel', report.type)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded transition-colors"
                            title="Download Excel"
                          >
                            <DocumentChartBarIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <DocumentChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No reports generated yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsPanel;
