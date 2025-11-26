// src/components/payments/UPIPayment.jsx
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const UPIPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount, purpose, bookingId } = location.state || {};

  const [paymentData, setPaymentData] = useState({
    amount: amount || 0,
    upiId: "7038738012-2@ybl",
    purpose: purpose || "Wallet Recharge",
  });
  const [processing, setProcessing] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [transactionId, setTransactionId] = useState("");

  const predefinedAmounts = [50, 100, 200, 500, 1000, 2000];
  const popularUPIApps = [
    { name: "PhonePe", iconName: "wallet", color: "bg-purple-600" },
    { name: "Google Pay", icon: "🎯", color: "bg-blue-600" },
    { name: "Paytm", icon: "💙", color: "bg-blue-800" },
    { name: "BHIM", icon: "🏛️", color: "bg-orange-600" },
  ];

  useEffect(() => {
    if (!amount && !bookingId) {
      navigate("/wallet");
    }
  }, [amount, bookingId, navigate]);

  const handleAmountSelect = (selectedAmount) => {
    setPaymentData((prev) => ({ ...prev, amount: selectedAmount }));
  };

  const generateQR = async () => {
    if (!paymentData.amount || paymentData.amount < 1) {
      toast.error("Please enter a valid amount");
      return;
    }

    setProcessing(true);
    try {
      const response = await api.post("/payments/generate-qr", {
        amount: paymentData.amount,
        purpose: paymentData.purpose,
        bookingId: bookingId || null,
      });

      setQrCode(response.data.data.qrCode);
      setTransactionId(response.data.data.paymentId);
      setQrGenerated(true);
      toast.success("QR Code generated! Scan to pay");

      // Start polling for payment status
      pollPaymentStatus(response.data.data.paymentId);
    } catch (error) {
      console.error("QR generation error:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setProcessing(false);
    }
  };

  const pollPaymentStatus = (txnId) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/payments/status/${txnId}`);
        const status = response.data.status;

        if (status === "success") {
          setPaymentStatus("success");
          clearInterval(interval);
          toast.success("Payment successful!");
          setTimeout(() => {
            navigate("/wallet", { state: { paymentSuccess: true } });
          }, 3000);
        } else if (status === "failed") {
          setPaymentStatus("failed");
          clearInterval(interval);
          toast.error("Payment failed");
        }
      } catch (error) {
        console.error("Status check error:", error);
      }
    }, 3000);

    // Clear interval after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const handleManualUPI = async () => {
    if (!paymentData.upiId || !paymentData.amount) {
      toast.error("Please enter UPI ID and amount");
      return;
    }

    setProcessing(true);
    try {
      const response = await api.post("/payments/upi-transfer", {
        upiId: paymentData.upiId,
        amount: paymentData.amount,
        purpose: paymentData.purpose,
        bookingId: bookingId || null,
      });

      if (response.data.success) {
        setPaymentStatus("success");
        toast.success("Payment initiated successfully!");
        setTimeout(() => {
          navigate("/wallet", { state: { paymentSuccess: true } });
        }, 2000);
      }
    } catch (error) {
      console.error("UPI payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            ₹{paymentData.amount} has been successfully processed.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Transaction ID: {transactionId}
          </p>
          <button
            onClick={() => navigate("/wallet")}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">UPI Payment</h1>
            <div></div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CurrencyRupeeIcon className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-600">{paymentData.purpose}</p>
          </div>
        </motion.div>

        {!qrGenerated ? (
          <>
            {/* Amount Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Enter Amount
              </h2>

              <div className="mb-4">
                <div className="relative">
                  <CurrencyRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="1"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleAmountSelect(amt)}
                    className={`py-2 px-4 rounded-lg border font-medium transition-colors ${
                      paymentData.amount === amt
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <button
                onClick={generateQR}
                disabled={processing || paymentData.amount < 1}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  processing || paymentData.amount < 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
                }`}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating QR...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <QrCodeIcon className="h-5 w-5 mr-2" />
                    Generate QR Code
                  </div>
                )}
              </button>
            </motion.div>

            {/* Popular UPI Apps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pay with UPI Apps
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {popularUPIApps.map((app) => (
                  <button
                    key={app.name}
                    onClick={generateQR}
                    disabled={paymentData.amount < 1}
                    className={`flex items-center p-3 rounded-lg border transition-colors ${
                      paymentData.amount < 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 ${app.color} rounded-lg flex items-center justify-center mr-3`}
                    >
                      <span className="text-white text-lg">{app.icon}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {app.name}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Manual UPI Transfer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Manual UPI Transfer
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={paymentData.upiId}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      upiId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="username@upi"
                />
              </div>

              <button
                onClick={handleManualUPI}
                disabled={
                  processing || !paymentData.upiId || paymentData.amount < 1
                }
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  processing || !paymentData.upiId || paymentData.amount < 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {processing ? "Processing..." : "Pay via UPI"}
              </button>
            </motion.div>
          </>
        ) : (
          /* QR Code Display */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Scan QR to Pay
              </h2>

              <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mx-auto mb-6">
                {qrCode ? (
                  <img
                    src={qrCode}
                    alt="Payment QR Code"
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <QrCodeIcon className="h-24 w-24 text-gray-300" />
                )}
              </div>

              <div className="mb-6">
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  ₹{paymentData.amount}
                </p>
                <p className="text-gray-600">{paymentData.purpose}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Transaction ID: {transactionId}
                </p>
              </div>

              <div className="flex items-center justify-center text-yellow-600 mb-4">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">Waiting for payment...</span>
              </div>

              <p className="text-xs text-gray-500 mb-6">
                Open any UPI app and scan this QR code to complete the payment
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setQrGenerated(false);
                    setQrCode("");
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => navigate("/wallet")}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center text-green-600 mb-2">
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">Secure & Encrypted Payment</span>
          </div>
          <p className="text-xs text-gray-500">
            Your payment is protected by bank-grade security
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default UPIPayment;
