// src/context/PaymentContext.jsx
import { createContext, useCallback, useContext, useReducer } from "react";
import { toast } from "react-hot-toast";
import api from "../utils/api";

// Initial state
const initialState = {
  wallet: {
    balance: 0,
    transactions: [],
    monthlySpent: 0,
    totalSpent: 0,
    totalRecharged: 0,
  },
  payments: [],
  currentPayment: null,
  loading: false,
  error: null,
  paymentMethods: [],
  upiApps: [
    { name: "PhonePe", iconName: "wallet", id: "phonepe" },
    { name: "Google Pay", icon: "🎯", id: "googlepay" },
    { name: "Paytm", icon: "💙", id: "paytm" },
    { name: "BHIM", icon: "🏛️", id: "bhim" },
  ],
};

// Action types
const PAYMENT_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_WALLET: "SET_WALLET",
  SET_PAYMENTS: "SET_PAYMENTS",
  SET_CURRENT_PAYMENT: "SET_CURRENT_PAYMENT",
  ADD_TRANSACTION: "ADD_TRANSACTION",
  UPDATE_TRANSACTION: "UPDATE_TRANSACTION",
  SET_PAYMENT_METHODS: "SET_PAYMENT_METHODS",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Reducer function
const paymentReducer = (state, action) => {
  switch (action.type) {
    case PAYMENT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case PAYMENT_ACTIONS.SET_WALLET:
      return {
        ...state,
        wallet: { ...state.wallet, ...action.payload },
        loading: false,
        error: null,
      };

    case PAYMENT_ACTIONS.SET_PAYMENTS:
      return {
        ...state,
        payments: action.payload,
        loading: false,
        error: null,
      };

    case PAYMENT_ACTIONS.SET_CURRENT_PAYMENT:
      return {
        ...state,
        currentPayment: action.payload,
        loading: false,
        error: null,
      };

    case PAYMENT_ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        wallet: {
          ...state.wallet,
          transactions: [action.payload, ...state.wallet.transactions],
          balance:
            action.payload.type === "credit"
              ? state.wallet.balance + action.payload.amount
              : state.wallet.balance - action.payload.amount,
        },
        error: null,
      };

    case PAYMENT_ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        wallet: {
          ...state.wallet,
          transactions: state.wallet.transactions.map((transaction) =>
            transaction._id === action.payload._id
              ? action.payload
              : transaction
          ),
        },
        error: null,
      };

    case PAYMENT_ACTIONS.SET_PAYMENT_METHODS:
      return {
        ...state,
        paymentMethods: action.payload,
        loading: false,
        error: null,
      };

    case PAYMENT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case PAYMENT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const PaymentContext = createContext();

// Payment Provider component
export const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  // Fetch wallet details
  const fetchWallet = useCallback(async () => {
    try {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: PAYMENT_ACTIONS.CLEAR_ERROR });

      const response = await api.get("/wallet/details");

      if (response.data.success) {
        const wallet = response.data.wallet;

        dispatch({ type: PAYMENT_ACTIONS.SET_WALLET, payload: wallet });

        return { success: true, wallet };
      } else {
        throw new Error(
          response.data.message || "Failed to fetch wallet details"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch wallet details";

      dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Recharge wallet
  const rechargeWallet = useCallback(async (amount, paymentMethod = "upi") => {
    try {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: PAYMENT_ACTIONS.CLEAR_ERROR });

      const response = await api.post("/wallet/recharge", {
        amount,
        paymentMethod,
      });

      if (response.data.success) {
        const transaction = response.data.transaction;

        dispatch({
          type: PAYMENT_ACTIONS.ADD_TRANSACTION,
          payload: transaction,
        });
        toast.success(`Wallet recharged with ₹${amount}`);

        return { success: true, transaction };
      } else {
        throw new Error(response.data.message || "Failed to recharge wallet");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to recharge wallet";

      dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Process payment for booking
  const processBookingPayment = useCallback(async (bookingId, paymentData) => {
    try {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: PAYMENT_ACTIONS.CLEAR_ERROR });

      const response = await api.post("/payments/booking", {
        bookingId,
        ...paymentData,
      });

      if (response.data.success) {
        const payment = response.data.payment;

        dispatch({
          type: PAYMENT_ACTIONS.SET_CURRENT_PAYMENT,
          payload: payment,
        });

        // Update wallet if payment was from wallet
        if (paymentData.paymentMethod === "wallet") {
          dispatch({
            type: PAYMENT_ACTIONS.ADD_TRANSACTION,
            payload: {
              _id: payment._id,
              type: "debit",
              amount: payment.amount,
              description: `Payment for booking #${bookingId.slice(-8)}`,
              createdAt: new Date().toISOString(),
              status: "completed",
            },
          });
        }

        toast.success("Payment processed successfully!");

        return { success: true, payment };
      } else {
        throw new Error(response.data.message || "Payment failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Payment failed";

      dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Generate UPI QR code
  const generateUPIQR = useCallback(
    async (amount, purpose, bookingId = null) => {
      try {
        dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: PAYMENT_ACTIONS.CLEAR_ERROR });

        const response = await api.post("/payments/generate-qr", {
          amount,
          purpose,
          bookingId,
        });

        if (response.data.success) {
          const { qrCode, transactionId } = response.data;

          return { success: true, qrCode, transactionId };
        } else {
          throw new Error(
            response.data.message || "Failed to generate QR code"
          );
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to generate QR code";

        dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: errorMessage });
        return { success: false, error: errorMessage };
      } finally {
        dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: false });
      }
    },
    []
  );

  // Check payment status
  const checkPaymentStatus = useCallback(async (transactionId) => {
    try {
      const response = await api.get(`/payments/status/${transactionId}`);

      if (response.data.success) {
        const { status, payment } = response.data;

        if (payment) {
          dispatch({
            type: PAYMENT_ACTIONS.SET_CURRENT_PAYMENT,
            payload: payment,
          });
        }

        return { success: true, status, payment };
      } else {
        throw new Error(
          response.data.message || "Failed to check payment status"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to check payment status";
      return { success: false, error: errorMessage };
    }
  }, []);

  // Fetch payment history
  const fetchPaymentHistory = useCallback(async (filters = {}) => {
    try {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: PAYMENT_ACTIONS.CLEAR_ERROR });

      const response = await api.get("/payments/history", { params: filters });

      if (response.data.success) {
        const payments = response.data.payments || [];

        dispatch({ type: PAYMENT_ACTIONS.SET_PAYMENTS, payload: payments });

        return { success: true, payments };
      } else {
        throw new Error(
          response.data.message || "Failed to fetch payment history"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payment history";

      dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Request refund
  const requestRefund = useCallback(async (paymentId, reason, amount) => {
    try {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: PAYMENT_ACTIONS.CLEAR_ERROR });

      const response = await api.post("/payments/refund-request", {
        paymentId,
        reason,
        amount,
      });

      if (response.data.success) {
        toast.success("Refund request submitted successfully!");

        return { success: true, refundRequest: response.data.refundRequest };
      } else {
        throw new Error(
          response.data.message || "Failed to submit refund request"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit refund request";

      dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);

      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Fetch available payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      const response = await api.get("/payments/methods");

      if (response.data.success) {
        const methods = response.data.methods || [];

        dispatch({
          type: PAYMENT_ACTIONS.SET_PAYMENT_METHODS,
          payload: methods,
        });

        return { success: true, methods };
      } else {
        throw new Error(
          response.data.message || "Failed to fetch payment methods"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payment methods";
      return { success: false, error: errorMessage };
    }
  }, []);

  // Clear error
  const clearError = () => {
    dispatch({ type: PAYMENT_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    // State
    wallet: state.wallet,
    payments: state.payments,
    currentPayment: state.currentPayment,
    loading: state.loading,
    error: state.error,
    paymentMethods: state.paymentMethods,
    upiApps: state.upiApps,

    // Actions
    fetchWallet,
    rechargeWallet,
    processBookingPayment,
    generateUPIQR,
    checkPaymentStatus,
    fetchPaymentHistory,
    requestRefund,
    fetchPaymentMethods,
    clearError,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
};

// Custom hook to use payment context
export const usePayment = () => {
  const context = useContext(PaymentContext);

  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }

  return context;
};

export default PaymentContext;
