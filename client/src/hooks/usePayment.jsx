// src/hooks/usePayment.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePayment as usePaymentContext } from '../context/PaymentContext';
import { toast } from 'react-hot-toast';

const usePayment = () => {
  return usePaymentContext();
};

export const useWallet = () => {
  const { wallet, fetchWallet, rechargeWallet, loading } = usePaymentContext();
  const [refreshing, setRefreshing] = useState(false);

  const refreshWallet = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await fetchWallet();
      return result;
    } catch (error) {
      console.error('Error refreshing wallet:', error);
      return { success: false, error: error.message };
    } finally {
      setRefreshing(false);
    }
  }, [fetchWallet]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  return { 
    wallet, 
    loading: loading || refreshing, 
    refreshWallet, 
    rechargeWallet 
  };
};

export const useQRPayment = () => {
  const { generateUPIQR, checkPaymentStatus } = usePaymentContext();
  const [qrCode, setQrCode] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const generateQR = useCallback(async (amount, purpose, bookingId = null) => {
    if (!amount || amount <= 0) {
      const errorMsg = 'Invalid amount provided';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    setError(null);
    setPaymentStatus('pending');

    try {
      const result = await generateUPIQR(amount, purpose, bookingId);
      
      if (result.success) {
        setQrCode(result.qrCode);
        setTransactionId(result.transactionId);
        toast.success('QR code generated successfully');
      } else {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to generate QR code';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [generateUPIQR]);

  const startPolling = useCallback((txnId) => {
    if (polling || !txnId) return;
    
    setPolling(true);
    
    intervalRef.current = setInterval(async () => {
      try {
        const result = await checkPaymentStatus(txnId);
        
        if (result.success) {
          setPaymentStatus(result.status);
          
          if (result.status === 'success') {
            toast.success('Payment successful!');
            clearInterval(intervalRef.current);
            setPolling(false);
          } else if (result.status === 'failed') {
            toast.error('Payment failed');
            clearInterval(intervalRef.current);
            setPolling(false);
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000);

    // Stop polling after 5 minutes
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setPolling(false);
      toast.warning('Payment verification timeout');
    }, 300000);
  }, [checkPaymentStatus, polling]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPolling(false);
  }, []);

  const resetPayment = useCallback(() => {
    stopPolling();
    setQrCode(null);
    setTransactionId(null);
    setPaymentStatus('pending');
    setError(null);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return { 
    qrCode, 
    transactionId, 
    paymentStatus, 
    polling,
    error,
    generateQR, 
    startPolling,
    stopPolling,
    resetPayment
  };
};

export const usePaymentHistory = (filters = {}) => {
  const { fetchPaymentHistory } = usePaymentContext();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (newFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchPaymentHistory({ ...filters, ...newFilters });
      
      if (result.success) {
        setPayments(result.payments || []);
      } else {
        setError(result.error || 'Failed to fetch payment history');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch payment history';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentHistory, filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { payments, loading, error, refetch: fetchHistory };
};

export const useRefund = () => {
  const { requestRefund } = usePaymentContext();
  const [requesting, setRequesting] = useState(false);

  const handleRefundRequest = useCallback(async (paymentId, reason, amount = null) => {
    if (!paymentId || !reason) {
      const errorMsg = 'Payment ID and reason are required';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    setRequesting(true);

    try {
      const result = await requestRefund(paymentId, reason, amount);
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to request refund';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setRequesting(false);
    }
  }, [requestRefund]);

  return { handleRefundRequest, requesting };
};

export default usePayment;
