// hooks/usePayment.js
import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { useSocket } from './useSocket';
import { useToast } from './useToast';
import QRCode from 'qrcode';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const { paymentAPI } = useApi();
  const { onPaymentUpdate, sendPaymentUpdate } = useSocket();
  const { showToast } = useToast();

  // Your UPI Configuration
  const UPI_ID = "7038738012-2@ybl";
  const MERCHANT_NAME = "MessMate";

  // Generate UPI payment
  const generateUPIPayment = useCallback(async (amount, orderId, description = 'MessMate Payment') => {
    try {
      setLoading(true);
      setError(null);

      // Generate UPI URL
      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`${description} - ${orderId}`)}`;
      
      // Generate QR Code
      const qrCode = await QRCode.toDataURL(upiUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });

      // Generate transaction reference
      const transactionRef = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const payment = {
        upiId: UPI_ID,
        merchantName: MERCHANT_NAME,
        amount: amount,
        orderId: orderId,
        transactionRef: transactionRef,
        upiUrl: upiUrl,
        qrCode: qrCode,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      };

      setPaymentData(payment);
      return payment;

    } catch (err) {
      setError(err.message);
      showToast('Failed to generate payment', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Verify payment
  const verifyPayment = useCallback(async (transactionRef, upiTransactionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await paymentAPI.verifyPayment({
        transactionRef,
        upiTransactionId,
        status: 'completed'
      });

      if (response.success) {
        // Send real-time update
        sendPaymentUpdate({
          type: 'payment_verification',
          transactionRef,
          upiTransactionId,
          status: 'submitted'
        });

        showToast('Payment submitted for verification!', 'success');
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to verify payment', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [paymentAPI, sendPaymentUpdate, showToast]);

  // Get payment history
  const getPaymentHistory = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await paymentAPI.getPayments(params);
      return response.data || [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [paymentAPI]);

  // Get UPI details
  const getUPIDetails = useCallback(async () => {
    try {
      const response = await paymentAPI.getUPIDetails();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [paymentAPI]);

  // Open UPI app
  const openUPIApp = useCallback((appName = 'phonepe') => {
    if (!paymentData) {
      showToast('No payment data available', 'error');
      return;
    }

    const deepLinks = {
      phonepe: 'phonepe://pay',
      googlepay: 'gpay://upi/pay',
      paytm: 'paytm://pay',
      bhim: 'bhim://pay'
    };

    const baseDeepLink = deepLinks[appName.toLowerCase()] || deepLinks.phonepe;
    const upiParams = `?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${paymentData.amount}&cu=INR&tn=${encodeURIComponent(`MessMate Payment - ${paymentData.orderId}`)}`;
    
    const deepLinkUrl = `${baseDeepLink}${upiParams}`;
    
    // Try to open app-specific deep link
    const link = document.createElement('a');
    link.href = deepLinkUrl;
    link.click();
    
    // Fallback to generic UPI URL after a delay
    setTimeout(() => {
      window.open(paymentData.upiUrl, '_blank');
    }, 1000);

  }, [paymentData, showToast]);

  // Copy UPI ID
  const copyUPIId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      showToast('UPI ID copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy UPI ID', 'error');
    }
  }, [showToast]);

  // Download QR Code
  const downloadQRCode = useCallback(() => {
    if (!paymentData?.qrCode) {
      showToast('No QR code available', 'error');
      return;
    }

    const link = document.createElement('a');
    link.download = `messmate-payment-qr-${paymentData.orderId}.png`;
    link.href = paymentData.qrCode;
    link.click();
    
    showToast('QR code downloaded!', 'success');
  }, [paymentData, showToast]);

  // Share payment details
  const sharePayment = useCallback(async () => {
    if (!paymentData) {
      showToast('No payment data available', 'error');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MessMate Payment',
          text: `Pay ₹${paymentData.amount} to ${MERCHANT_NAME}`,
          url: paymentData.upiUrl
        });
      } catch (err) {
        console.log('Share failed:', err);
        copyUPIId();
      }
    } else {
      copyUPIId();
    }
  }, [paymentData, copyUPIId, showToast]);

  // Check if payment is expired
  const isPaymentExpired = useCallback(() => {
    if (!paymentData?.expiresAt) return false;
    return new Date() > new Date(paymentData.expiresAt);
  }, [paymentData]);

  // Get time remaining
  const getTimeRemaining = useCallback(() => {
    if (!paymentData?.expiresAt) return 0;
    const now = new Date().getTime();
    const expiry = new Date(paymentData.expiresAt).getTime();
    return Math.max(0, expiry - now);
  }, [paymentData]);

  return {
    // State
    loading,
    error,
    paymentData,
    
    // Actions
    generateUPIPayment,
    verifyPayment,
    getPaymentHistory,
    getUPIDetails,
    openUPIApp,
    copyUPIId,
    downloadQRCode,
    sharePayment,
    
    // Utilities
    isPaymentExpired,
    getTimeRemaining,
    
    // Constants
    UPI_ID,
    MERCHANT_NAME
  };
};

export default usePayment;
