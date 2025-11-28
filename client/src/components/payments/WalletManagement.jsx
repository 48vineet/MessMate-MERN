// src/components/payments/WalletManagement.jsx
import {
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  CreditCardIcon,
  CurrencyRupeeIcon,
  LockClosedIcon,
  LockOpenIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const WalletManagement = () => {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalSpent: 0,
    totalRecharged: 0,
    monthlySpent: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await api.get("/wallet/details");
      setWalletData(response.data.wallet);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Failed to load wallet information");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
    toast.success("Wallet data refreshed");
  };

  const handleRecharge = () => {
    navigate("/wallet/recharge", {
      state: {
        amount: null,
      },
    });
  };

  const quickRechargeAmounts = [100, 200, 500, 1000];

  const handleQuickRecharge = (amount) => {
    navigate("/wallet/recharge", {
      state: {
        amount,
      },
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "₹0";
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-48 bg-gray-300 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Wallet
              </h1>
              <p className="text-gray-600">
                Manage your MessMate wallet and payments
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon
                className={`h-6 w-6 text-gray-600 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Wallet Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 mr-3" />
              <h2 className="text-2xl font-bold">MessMate Wallet</h2>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showBalance ? (
                <LockOpenIcon className="h-6 w-6 text-gray-700" />
              ) : (
                <LockClosedIcon className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>

          <div className="mb-6">
            <p className="text-blue-100 text-lg mb-2">Available Balance</p>
            <div className="flex items-center">
              <CurrencyRupeeIcon className="h-12 w-12 mr-2" />
              <span className="text-5xl font-bold">
                {showBalance
                  ? walletData.balance.toLocaleString("en-IN")
                  : "****"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">This Month Spent</p>
              <p className="text-xl font-semibold">
                ₹
                {showBalance
                  ? walletData.monthlySpent.toLocaleString("en-IN")
                  : "****"}
              </p>
            </div>
            <button
              onClick={handleRecharge}
              className="bg-white hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-all flex items-center text-blue-600"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Money
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Quick Recharge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Recharge
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {quickRechargeAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickRecharge(amount)}
                  className="py-3 px-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium"
                >
                  ₹{amount}
                </button>
              ))}
            </div>
            <button
              onClick={handleRecharge}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Custom Amount
            </button>
          </motion.div>

          {/* Wallet Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Wallet Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Recharged</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(walletData.totalRecharged)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(walletData.totalSpent)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Balance</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(walletData.balance)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate("/payments/history")}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Payment History</h3>
                <p className="text-sm text-gray-600">View all transactions</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleRecharge}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <PlusIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Money</h3>
                <p className="text-sm text-gray-600">Recharge your wallet</p>
              </div>
            </div>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <BanknotesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Auto Recharge</h3>
                <p className="text-sm text-gray-600">Coming soon</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Transactions Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Transactions
              </h3>
              <button
                onClick={() => navigate("/payments/history")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {walletData.recentTransactions.length > 0 ? (
              walletData.recentTransactions
                .slice(0, 5)
                .map((transaction, index) => (
                  <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            transaction.type === "credit"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          <CurrencyRupeeIcon
                            className={`h-5 w-5 ${
                              transaction.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description || "Payment Transaction"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            transaction.type === "credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}₹
                          {transaction.amount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="p-12 text-center">
                <CurrencyRupeeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet</p>
                <button
                  onClick={handleRecharge}
                  className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Add money to get started
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletManagement;
