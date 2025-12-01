// src/components/dashboard/BookingCard.jsx
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";
import Icons from "../common/Icons";

const BookingCard = ({ upcomingBookings = [], onRefresh }) => {
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [qrPayload, setQrPayload] = useState("");
  const [qrSvg, setQrSvg] = useState("");
  const [generatingQR, setGeneratingQR] = useState(false);

  // Use real bookings data
  const displayBookings = upcomingBookings;

  const handleCancelBooking = async (bookingId) => {
    setCancellingBooking(bookingId);
    try {
      const response = await api.delete(`/bookings/${bookingId}`);

      if (response.data.success) {
        toast.success("Booking cancelled successfully");
        onRefresh && onRefresh();
      } else {
        toast.error(response.data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancellingBooking(null);
    }
  };

  const handleShowQR = (booking) => {
    setSelectedBooking(booking);
    setShowQRModal(true);
    generateQRCode(booking);
  };

  const generateQRCode = async (booking) => {
    setGeneratingQR(true);
    try {
      // Validate and format dates properly
      const formatDate = (dateValue) => {
        if (!dateValue) return "Date not available";
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return "Invalid date format";
          return date.toLocaleDateString("en-IN");
        } catch (error) {
          console.error("Date formatting error:", error);
          return "Date error";
        }
      };

      const formatTime = (timeValue) => {
        if (!timeValue) return "Time not available";
        // Since mealTime is stored as a string like "dinner time", just return it directly
        if (typeof timeValue === "string") {
          return timeValue;
        }
        try {
          const time = new Date(timeValue);
          if (isNaN(time.getTime())) return "Invalid time format";
          return time.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (error) {
          console.error("Time formatting error:", error);
          return "Time error";
        }
      };

      // Create compact, scanner-friendly QR payload
      const qrData = {
        v: 1, // payload version
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

      // Generate SVG (inline) for reliable rendering on React 19
      try {
        const svgString = await QRCode.toString(payload, {
          type: "svg",
          errorCorrectionLevel: "M",
          margin: 2,
          width: 256,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrSvg(svgString);
      } catch (e) {
        console.warn("SVG QR generation failed; will fall back to PNG.", e);
      }

      // Best-effort: also pre-generate a PNG data URL for download fallback
      try {
        const qrDataUrl = await QRCode.toDataURL(payload, {
          width: 256,
          margin: 2,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrCodeDataUrl(qrDataUrl);
      } catch (e) {
        // Non-fatal: SVG renderer below will still show the QR
        console.warn("PNG QR generation failed; using SVG only.", e);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setGeneratingQR(false);
    }
  };

  const getBookingStatus = (booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.bookingDate);

    // Check the booking status
    if (booking.status === "booked") return "booked";
    if (booking.status === "confirmed") return "confirmed";
    if (booking.status === "cancelled") return "cancelled";
    return "pending";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "booked":
        return "text-green-600 bg-green-100";
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "expired":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "booked":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "pending":
        return <ClockIcon className="h-4 w-4" />;
      case "cancelled":
        return <XMarkIcon className="h-4 w-4" />;
      case "expired":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case "breakfast":
        return <Icons.coffee className="h-6 w-6" />;
      case "lunch":
        return <Icons.dining className="h-6 w-6" />;
      case "dinner":
        return <Icons.dining className="h-6 w-6" />;
      default:
        return <Icons.dining className="h-6 w-6" />;
    }
  };

  const canCancelBooking = (booking) => {
    // Allow cancellation for booked and confirmed status
    return booking.status === "booked" || booking.status === "confirmed";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Upcoming Bookings
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarDaysIcon className="h-4 w-4 mr-1" />
              {displayBookings.length} booking
              {displayBookings.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {displayBookings.length > 0 ? (
            <div className="space-y-4">
              {displayBookings.map((booking, index) => {
                const status = getBookingStatus(booking);
                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      {/* Booking Info */}
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {getMealIcon(booking.mealType)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 capitalize">
                              {booking.mealType}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                status
                              )}`}
                            >
                              {getStatusIcon(status)}
                              <span className="ml-1 capitalize">{status}</span>
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <CalendarDaysIcon className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(booking.bookingDate).toLocaleDateString(
                                "en-IN"
                              )}
                            </span>
                            <ClockIcon className="h-4 w-4 ml-3 mr-1" />
                            <span>
                              {typeof booking.mealTime === "string"
                                ? booking.mealTime
                                : new Date(booking.mealTime).toLocaleTimeString(
                                    "en-IN",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                            </span>
                          </div>
                          {booking.totalAmount && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              ₹{booking.totalAmount}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {(status === "booked" || status === "confirmed") && (
                          <button
                            onClick={() => handleShowQR(booking)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Show QR Code"
                          >
                            <QrCodeIcon className="h-5 w-5" />
                          </button>
                        )}

                        {canCancelBooking(booking) && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancellingBooking === booking._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel Booking"
                          >
                            {cancellingBooking === booking._id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                            ) : (
                              <XMarkIcon className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    {booking.specialInstructions && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Special Instructions:</strong>{" "}
                          {booking.specialInstructions}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* No Bookings */
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Upcoming Bookings
              </h3>
              <p className="text-gray-600 mb-4">
                You don't have any upcoming meal bookings. Book your next meal
                from today's menu!
              </p>
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Refresh Bookings
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* QR Code Modal */}
      {showQRModal && selectedBooking && (
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
                onClick={() => {
                  setShowQRModal(false);
                  setQrCodeDataUrl(null);
                  setSelectedBooking(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center">
              <div
                className="bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ width: 272, height: 272 }}
              >
                {generatingQR ? (
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
                ) : qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCodeIcon className="h-24 w-24 text-gray-400" />
                )}
              </div>

              {/* Actions under QR */}
              {(qrCodeDataUrl || qrPayload) && (
                <div className="flex items-center justify-center gap-3 mb-2">
                  {qrCodeDataUrl && (
                    <a
                      href={qrCodeDataUrl}
                      download={`messmate-qr-${
                        selectedBooking?._id || "booking"
                      }.png`}
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

              <div className="text-sm text-gray-600">
                <p className="font-medium">
                  {selectedBooking.mealType.toUpperCase()}
                </p>
                <p>
                  {(() => {
                    if (!selectedBooking.bookingDate)
                      return "Date not available";
                    try {
                      const date = new Date(selectedBooking.bookingDate);
                      if (isNaN(date.getTime())) return "Invalid date format";
                      return date.toLocaleDateString("en-IN");
                    } catch (error) {
                      return "Date error";
                    }
                  })()}
                </p>
                <p>
                  {(() => {
                    if (!selectedBooking.mealTime) return "Time not available";
                    // Since mealTime is stored as a string like "dinner time", just return it directly
                    if (typeof selectedBooking.mealTime === "string") {
                      return selectedBooking.mealTime;
                    }
                    try {
                      const time = new Date(selectedBooking.mealTime);
                      if (isNaN(time.getTime())) return "Invalid time format";
                      return time.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    } catch (error) {
                      return "Time error";
                    }
                  })()}
                </p>
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

export default BookingCard;
