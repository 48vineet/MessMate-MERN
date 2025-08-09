// src/components/payments/RefundRequest.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const RefundRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking, transaction } = location.state || {};
  
  const [refundData, setRefundData] = useState({
    amount: booking?.totalAmount || transaction?.amount || 0,
    reason: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [refundReasons] = useState([
    'Meal was not available',
    'Poor food quality',
    'Late delivery',
    'Wrong order received',
    'Event cancelled',
    'Personal emergency',
    'Technical issue',
    'Other'
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!refundData.reason) {
      toast.error('Please select a reason for refund');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/payments/refund-request', {
        bookingId: booking?._id,
        transactionId: transaction?._id,
        amount: refundData.amount,
        reason: refundData.reason,
        description: refundData.description
      });

      if (response.data.success) {
        toast.success('Refund request submitted successfully');
        navigate('/payments/history', { 
          state: { refundRequested: true } 
        });
      }
    } catch (error) {
      console.error('Refund request error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setLoading(false);
    }
  };

  if (!booking && !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-4">Invalid Request</h2>
          <p className="text-gray-600 mb-6">
            No booking or transaction data found for refund processing.
          </p>
          <button
            onClick={() => navigate('/payments/history')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Payment History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Refund</h1>
          <p className="text-gray-600">Submit a refund request for your payment</p>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h2>
          
          <div className="space-y-3">
            {booking ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium">#{booking._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Meal Type:</span>
                  <span className="font-medium capitalize">{booking.mealType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(booking.date).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium">#{transaction._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{transaction.type}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-green-600">₹{refundData.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {new Date((booking || transaction).createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Refund Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Refund Information</h2>

            {/* Refund Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount
              </label>
              <div className="relative">
                <CurrencyRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={refundData.amount}
                  onChange={(e) => setRefundData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  max={booking?.totalAmount || transaction?.amount}
                  min="1"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum refundable amount: ₹{booking?.totalAmount || transaction?.amount}
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Refund *
              </label>
              <select
                value={refundData.reason}
                onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a reason</option>
                {refundReasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details
              </label>
              <textarea
                value={refundData.description}
                onChange={(e) => setRefundData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please provide additional details about your refund request..."
              />
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-2">Important Notes:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Refund requests are processed within 3-5 working days</li>
                    <li>• Refunds for cancelled bookings must be requested at least 2 hours before meal time</li>
                    <li>• Partial refunds may apply based on the reason and timing</li>
                    <li>• You will receive email updates about your refund status</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !refundData.reason}
                className={`flex-1 py-3 px-4 font-medium rounded-lg transition-all ${
                  loading || !refundData.reason
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Submit Refund Request
                  </div>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Process Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Process Timeline</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Request Submitted</p>
                <p className="text-sm text-gray-600">Your refund request is submitted for review</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <ClockIcon className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Under Review</p>
                <p className="text-sm text-gray-600">Our team reviews your request (1-2 days)</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Refund Processed</p>
                <p className="text-sm text-gray-600">Amount credited to your wallet (2-3 days)</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RefundRequest;
