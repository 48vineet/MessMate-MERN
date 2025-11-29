// src/components/admin/WalletManagement.jsx
import {
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  CurrencyRupeeIcon,
  EnvelopeIcon,
  PhoneIcon,
  QrCodeIcon,
  UserIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";

const WalletManagement = () => {
  const [pendingRecharges, setPendingRecharges] = useState([]);
  const [allWallets, setAllWallets] = useState([]);
  const [walletSettings, setWalletSettings] = useState({
    upiId: "7038738012-2@ybl",
    qrCode: null,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [showSettings, setShowSettings] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, walletsRes] = await Promise.all([
        api.get("/wallet/admin/pending-recharges"),
        api.get("/wallet/admin/all-wallets"),
      ]);

      setPendingRecharges(pendingRes.data.pendingRecharges || []);
      setAllWallets(walletsRes.data.wallets || []);

      // Get wallet settings to display QR code
      try {
        const walletDetails = await api.get("/wallet/details");
        setCurrentQRCode(walletDetails.data.wallet.qrCode);
      } catch (error) {
        console.error("Error fetching wallet details:", error);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRecharge = async (transactionId, userId) => {
    try {
      await api.post("/wallet/admin/approve-recharge", {
        transactionId,
        userId,
      });

      toast.success("Recharge approved successfully");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error approving recharge:", error);
      toast.error("Failed to approve recharge");
    }
  };

  const handleRejectRecharge = async (transactionId, userId) => {
    const reason = prompt("Enter rejection reason (optional):");
    try {
      await api.post("/wallet/admin/reject-recharge", {
        transactionId,
        userId,
        reason,
      });

      toast.success("Recharge rejected successfully");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting recharge:", error);
      toast.error("Failed to reject recharge");
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put("/wallet/admin/settings", walletSettings);
      toast.success("Wallet settings updated successfully");
      setShowSettings(false);
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/2 sm:w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Wallet Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage customer wallet recharges and settings
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowQR(!showQR)}
                className="p-2 sm:p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-target"
              >
                <QrCodeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 sm:p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-target"
              >
                <CogIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={fetchData}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-target"
              >
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* QR Code Modal */}
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowQR(false)}
          >
            <div
              className="bg-white rounded-xl p-4 sm:p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                  Payment QR Code
                </h3>
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="w-48 h-48 bg-white rounded-lg mx-auto flex items-center justify-center">
                    {currentQRCode ? (
                      <img
                        src={currentQRCode}
                        alt="UPI QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCodeIcon className="h-32 w-32 text-gray-400" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  UPI ID: {walletSettings.upiId}
                </p>
                <p className="text-xs text-gray-500">
                  Scan this QR code to make payments
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSettings(false)}
          >
            <div
              className="bg-white rounded-xl p-4 sm:p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                Wallet Settings
              </h3>
              <form onSubmit={handleUpdateSettings}>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={walletSettings.upiId}
                      onChange={(e) =>
                        setWalletSettings((prev) => ({
                          ...prev,
                          upiId: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
                      placeholder="7038738012-2@ybl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QR Code URL
                    </label>
                    <input
                      type="url"
                      value={walletSettings.qrCode}
                      onChange={(e) =>
                        setWalletSettings((prev) => ({
                          ...prev,
                          qrCode: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base touch-target"
                      placeholder="https://example.com/qr-code.png"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base touch-target"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-target"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2 sm:mb-0 sm:mr-4">
                <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Pending Recharges
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {pendingRecharges.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    allWallets.reduce((sum, w) => sum + w.balance, 0)
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Wallets
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {allWallets.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Recharged
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    allWallets.reduce((sum, w) => sum + w.totalRecharged, 0)
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "pending"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pending Recharges ({pendingRecharges.length})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Wallets ({allWallets.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "pending" ? (
              <div className="space-y-4">
                {pendingRecharges.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ClockIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">
                      No pending recharges
                    </p>
                    <p className="text-sm">
                      All recharge requests have been processed
                    </p>
                  </div>
                ) : (
                  pendingRecharges.map((recharge) => (
                    <motion.div
                      key={recharge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                              {recharge.userName}
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600">
                              <span className="flex items-center">
                                <EnvelopeIcon className="h-4 w-4 mr-1" />
                                {recharge.userEmail}
                              </span>
                              <span className="flex items-center">
                                <PhoneIcon className="h-4 w-4 mr-1" />
                                {recharge.userPhone}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                          <div className="text-left sm:text-right">
                            <p className="text-lg sm:text-2xl font-bold text-green-600">
                              {formatCurrency(recharge.amount)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {formatDate(recharge.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleApproveRecharge(
                                recharge.id,
                                recharge.userId
                              )
                            }
                            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-xs sm:text-sm touch-target"
                          >
                            <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleRejectRecharge(recharge.id, recharge.userId)
                            }
                            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-xs sm:text-sm touch-target"
                          >
                            <XCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="overflow-x-auto hidden sm:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Recharged
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allWallets.map((wallet) => (
                      <tr key={wallet.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {wallet.userName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {wallet.userEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {formatCurrency(wallet.balance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(wallet.totalRecharged)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(wallet.totalSpent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              wallet.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {wallet.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Wallet Cards */}
            {activeTab === "all" && (
              <div className="sm:hidden space-y-3">
                {allWallets.map((wallet) => (
                  <div
                    key={wallet.userId}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {wallet.userName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {wallet.userEmail}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          wallet.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {wallet.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-xs text-gray-500">Balance</div>
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(wallet.balance)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Recharged</div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(wallet.totalRecharged)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Spent</div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(wallet.totalSpent)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletManagement;
