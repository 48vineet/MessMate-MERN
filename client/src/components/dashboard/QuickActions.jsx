// src/components/dashboard/QuickActions.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Icons from "../common/Icons";

const QuickActions = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const navigate = useNavigate();

  const handleShowQR = () => {
    // For now, show a placeholder QR code
    // In a real implementation, this would fetch the user's active booking
    setQrData({
      mealType: "DINNER",
      date: new Date().toLocaleDateString("en-IN"),
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    setShowQRModal(true);
  };

  const handleNavigation = (route, title) => {
    try {
      navigate(route);
    } catch (error) {
      console.error(`Error navigating to ${route}:`, error);
      toast.error(`Unable to navigate to ${title}`);
    }
  };

  const quickActions = [
    {
      title: "Book Meal",
      description: "Book your next meal",
      icon: Icons.calendar,
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => handleNavigation("/menu", "Book Meal"),
    },
    {
      title: "View QR Code",
      description: "Show meal QR code",
      icon: Icons.qrCode,
      color: "bg-green-500 hover:bg-green-600",
      onClick: handleShowQR,
    },
    {
      title: "Wallet",
      description: "Manage your wallet",
      icon: Icons.wallet,
      color: "bg-emerald-500 hover:bg-emerald-600",
      onClick: () => handleNavigation("/wallet", "Wallet"),
    },
    {
      title: "Notifications",
      description: "Check notifications",
      icon: Icons.bell,
      color: "bg-orange-500 hover:bg-orange-600",
      onClick: () => handleNavigation("/notifications", "Notifications"),
    },
    {
      title: "Profile",
      description: "Update profile",
      icon: Icons.user,
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: () => handleNavigation("/profile", "Profile"),
    },
    {
      title: "Settings",
      description: "App settings",
      icon: Icons.settings,
      color: "bg-gray-500 hover:bg-gray-600",
      onClick: () => handleNavigation("/settings", "Settings"),
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Access frequently used features
          </p>
        </div>

        {/* Actions Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={action.onClick}
                className={`${action.color} text-white p-4 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <div className="flex flex-col items-center text-center">
                  <action.icon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">{action.title}</span>
                  <span className="text-xs opacity-90">
                    {action.description}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* QR Code Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Meal QR Code
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.close className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Icons.qrCode className="h-24 w-24 text-gray-400" />
              </div>

              <div className="text-sm text-gray-600">
                <p className="font-medium">{qrData.mealType}</p>
                <p>{qrData.date}</p>
                <p>{qrData.time}</p>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Show this QR code at the mess counter to collect your meal
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default QuickActions;
