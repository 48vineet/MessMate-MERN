// src/components/dashboard/QuickActions.jsx
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Icons from "../common/Icons";

const QuickActions = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const [qrSvg, setQrSvg] = useState("");
  const [qrPng, setQrPng] = useState("");
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const navigate = useNavigate();

  const handleShowQR = async () => {
    setLoadingQR(true);
    setQrPayload("");
    setQrSvg("");
    setQrPng("");
    setBookingInfo(null);
    try {
      // Fetch today's most recent booking for the logged-in user
      const { data } = await api.get("/bookings/my-bookings", {
        params: { date: "today", limit: 1 },
      });

      const booking =
        Array.isArray(data?.data) && data.data.length ? data.data[0] : null;
      if (!booking) {
        toast.error("No active booking found for today");
        return;
      }

      // Prepare compact QR payload
      const qrData = {
        v: 1,
        bookingId: booking._id,
        user:
          typeof booking.user === "string"
            ? booking.user
            : booking.user?._id || "",
        mealType: booking.mealType,
        bookingDate: booking.bookingDate
          ? new Date(booking.bookingDate).toISOString()
          : null,
        mealTime:
          typeof booking.mealTime === "string" ? booking.mealTime : null,
        status: booking.status,
        ts: Date.now(),
      };

      const payload = JSON.stringify(qrData);
      setQrPayload(payload);
      setBookingInfo({
        mealType: booking.mealType,
        date: new Date(booking.bookingDate).toLocaleDateString("en-IN"),
        time:
          typeof booking.mealTime === "string"
            ? booking.mealTime
            : new Date(booking.mealTime).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
      });

      // Generate SVG for display
      try {
        const svg = await QRCode.toString(payload, {
          type: "svg",
          errorCorrectionLevel: "M",
          margin: 2,
          width: 256,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrSvg(svg);
      } catch (e) {
        console.warn("QuickActions: SVG QR generation failed", e);
      }

      // Generate PNG for download
      try {
        const png = await QRCode.toDataURL(payload, {
          width: 256,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrPng(png);
      } catch (e) {
        console.warn("QuickActions: PNG QR generation failed", e);
      }

      setShowQRModal(true);
    } catch (error) {
      console.error("QuickActions QR error:", error);
      toast.error(
        error.response?.data?.message || "Failed to generate QR code"
      );
    } finally {
      setLoadingQR(false);
    }
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
      {showQRModal && (
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
              <div
                className="bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ width: 272, height: 272 }}
              >
                {loadingQR ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-sm text-gray-600">
                      Generating QR Code...
                    </p>
                  </div>
                ) : qrSvg ? (
                  <div
                    className="w-[256px] h-[256px]"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : qrPng ? (
                  <img
                    src={qrPng}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Icons.qrCode className="h-24 w-24 text-gray-400" />
                )}
              </div>

              <div className="text-sm text-gray-600">
                {bookingInfo ? (
                  <>
                    <p className="font-medium">
                      {bookingInfo.mealType?.toUpperCase()}
                    </p>
                    <p>{bookingInfo.date}</p>
                    <p>{bookingInfo.time}</p>
                  </>
                ) : (
                  <p className="text-gray-500">No booking info</p>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Show this QR code at the mess counter to collect your meal
              </p>

              {(qrPng || qrPayload) && (
                <div className="flex items-center justify-center gap-3 mt-3">
                  {qrPng && (
                    <a
                      href={qrPng}
                      download={`messmate-qr.png`}
                      className="text-sm px-3 py-1.5 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Download PNG
                    </a>
                  )}
                  {qrPayload && (
                    <button
                      onClick={() => navigator.clipboard.writeText(qrPayload)}
                      className="text-sm px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Copy Payload
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default QuickActions;
