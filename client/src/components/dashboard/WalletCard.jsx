// src/components/dashboard/WalletCard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyRupeeIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CreditCardIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const WalletCard = ({ wallet = {}, onRefresh }) => {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState({
    balance: 0,
    monthlySpent: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use the correct backend endpoint for wallet details
  const WALLET_DETAILS_ENDPOINT = '/wallet/details';

  useEffect(() => {
    if (wallet && Object.keys(wallet).length > 0) {
      setWalletData(wallet);
    } else {
      fetchWalletData();
    }
    // eslint-disable-next-line
  }, [wallet]);

  // Add sample wallet data if no data is available
  useEffect(() => {
    if (walletData.balance === 0 && walletData.recentTransactions.length === 0) {
      setWalletData({
        balance: 1300,
        monthlySpent: 200,
        recentTransactions: [
          {
            _id: 'sample1',
            type: 'credit',
            amount: 1500,
            description: 'Wallet recharge',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          {
            _id: 'sample2',
            type: 'debit',
            amount: 80,
            description: 'Breakfast booking',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            _id: 'sample3',
            type: 'debit',
            amount: 120,
            description: 'Lunch booking',
            date: new Date(Date.now() - 1 * 60 * 60 * 1000)
          }
        ]
      });
    }
  }, [walletData]);

  const fetchWalletData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(WALLET_DETAILS_ENDPOINT);
      if (response.data && response.data.wallet) {
        setWalletData(response.data.wallet);
      } else {
        setWalletData({
          balance: 0,
          monthlySpent: 0,
          recentTransactions: []
        });
        toast.error('No wallet data found.');
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      if (error?.response?.status === 404) {
        setError('API route not found. Please inform support.');
        toast.error('API route /wallet/details not found.');
      } else {
        setError('Failed to load wallet data.');
        toast.error('Failed to load wallet data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = () => {
    navigate('/wallet/recharge');
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
      case 'recharge':
        return { icon: ArrowUpIcon, color: 'text-green-600 bg-green-100' };
      case 'debit':
      case 'meal':
      case 'booking':
        return { icon: ArrowDownIcon, color: 'text-red-600 bg-red-100' };
      default:
        return { icon: CurrencyRupeeIcon, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getTimeAgo = (date) => {
    if (!date) return '-';
    const now = new Date();
    const transactionDate = new Date(date);
    const diffInHours = Math.floor((now - transactionDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return transactionDate.toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <CreditCardIcon className="h-12 w-12 text-red-300 mx-auto mb-3" />
        <p className="text-red-700 mb-2 font-semibold">{error}</p>
        <button
          onClick={fetchWalletData}
          className="mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">MessMate Wallet</h3>
          <CreditCardIcon className="h-4 w-4" />
        </div>
        {/* Balance */}
        <div className="mb-2">
          <p className="text-green-100 text-xs mb-1">Available Balance</p>
          <div className="flex items-center">
            <CurrencyRupeeIcon className="h-5 w-5 mr-1" />
            <span className="text-xl font-bold">
              {Number(walletData.balance)?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="text-green-100">This Month</p>
            <p className="font-semibold">₹{Number(walletData.monthlySpent)?.toLocaleString('en-IN') || '0'} spent</p>
          </div>
          <button
            onClick={handleRecharge}
            className="bg-white text-green-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center shadow-sm"
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Add Money
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-gray-900">Recent Transactions</h4>
          <button
            onClick={() => navigate('/wallet/transactions')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View All
          </button>
        </div>

        {walletData.recentTransactions && walletData.recentTransactions.length > 0 ? (
          <div className="space-y-1">
            {walletData.recentTransactions.slice(0, 2).map((transaction, index) => {
              const { icon: IconComponent, color } = getTransactionIcon(transaction.type);
              return (
                <motion.div
                  key={transaction._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-1 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${color} mr-2`}>
                      <IconComponent className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 truncate">{transaction.description || transaction.type}</p>
                      <p className="text-xs text-gray-500">{getTimeAgo(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${transaction.type === 'credit' || transaction.type === 'recharge' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' || transaction.type === 'recharge' ? '+' : '-'}₹{Number(transaction.amount)?.toLocaleString('en-IN') || '0'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-2">
            <CurrencyRupeeIcon className="h-6 w-6 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">No transactions yet!</p>
            <button
              onClick={handleRecharge}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Add money to get started!
            </button>
          </div>
        )}

        {/* Wallet Benefits */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <h5 className="text-xs font-semibold text-gray-900 mb-1">Wallet Benefits</h5>
          <div className="space-y-1">
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
              Instant payments
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
              No cash needed
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
              Track expenses
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WalletCard;
