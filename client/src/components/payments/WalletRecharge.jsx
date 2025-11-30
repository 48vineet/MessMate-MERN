// src/components/payments/WalletRecharge.jsx
import { useState, useEffect } from 'react';
import { 
  CurrencyRupeeIcon,
  QrCodeIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const WalletRecharge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState(location.state?.amount || '');
  const [walletData, setWalletData] = useState({
    balance: 0,
    upiId: '7038738012-2@ybl',
    qrCode: null
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState(null);

  const quickAmounts = [100, 200, 500, 1000, 2000];

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await api.get('/wallet/details');
      setWalletData(response.data.wallet);
      setCurrentQRCode(response.data.wallet.qrCode);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = async (selectedAmount) => {
    setAmount(selectedAmount);
    
    // Generate QR code for the selected amount
    try {
      const response = await api.post('/wallet/generate-qr', {
        amount: selectedAmount
      });
      
      if (response.data.success) {
        setCurrentQRCode(response.data.qrCode);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback to generic QR code
      setCurrentQRCode(walletData.qrCode);
    }
  };

  const handleCustomAmountChange = async (e) => {
    const value = e.target.value;
    setAmount(value);
    
    // Generate QR code for custom amount if it's valid
    if (value && value > 0) {
      try {
        const response = await api.post('/wallet/generate-qr', {
          amount: parseFloat(value)
        });
        
        if (response.data.success) {
          setCurrentQRCode(response.data.qrCode);
        }
      } catch (error) {
        console.error('Error generating QR code:', error);
        // Fallback to generic QR code
        setCurrentQRCode(walletData.qrCode);
      }
    } else {
      // Reset to generic QR code if no amount
      setCurrentQRCode(walletData.qrCode);
    }
  };

  const handleSubmitRecharge = async (e) => {
    e.preventDefault();
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/wallet/recharge', {
        amount: parseFloat(amount),
        paymentMethod: 'upi',
        upiId: walletData.upiId
      });

      toast.success('Recharge request submitted successfully! Please make the payment and wait for admin approval.');
      navigate('/wallet');
    } catch (err) {
      console.error('Error submitting recharge:', err);
      toast.error('Failed to submit recharge request');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy UPI ID');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-64 bg-gray-300 rounded-lg"></div>
            <div className="h-32 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet Recharge</h1>
              <p className="text-gray-600">Add money to your MessMate wallet</p>
            </div>
            <button
              onClick={() => navigate('/wallet')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Wallet
            </button>
          </div>
        </div>

        {/* Current Balance */}
        <div
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-lg mb-2">Current Balance</p>
              <div className="flex items-center">
                <CurrencyRupeeIcon className="h-8 w-8 mr-2" />
                <span className="text-4xl font-bold">
                  {formatCurrency(walletData.balance)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Total Recharged</p>
              <p className="text-xl font-semibold">
                {formatCurrency(walletData.totalRecharged || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Payment */}
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCodeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan QR Code</h3>
              <p className="text-sm text-gray-600 mb-6">
                Scan the QR code with any UPI app to make payment
              </p>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
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
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">UPI ID</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="font-mono text-lg font-semibold text-gray-900">
                    {walletData.upiId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(walletData.upiId)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {copied ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Selection */}
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCardIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Amount</h3>
              <p className="text-sm text-gray-600">
                Choose amount and submit recharge request
              </p>
            </div>

            <form onSubmit={handleSubmitRecharge}>
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => handleAmountSelect(quickAmount)}
                    className={`py-3 px-4 border rounded-lg font-medium transition-colors ${
                      amount === quickAmount
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    ₹{quickAmount}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amount
                </label>
                <div className="relative">
                  <CurrencyRupeeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={handleCustomAmountChange}
                    placeholder="Enter amount"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    step="1"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !amount || amount <= 0}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <ClockIcon className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Submit Recharge Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Instructions */}
        <div
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Recharge</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <p>Select or enter the amount you want to recharge</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <p>Submit the recharge request</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <p>Scan the QR code or use UPI ID to make payment</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">4</span>
              </div>
              <p>Wait for admin approval (usually within 5-10 minutes)</p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-6"
        >
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">Important Notes</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li className="flex items-start space-x-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>Please include your name/ID in the payment description for easy identification</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>Recharge requests are processed manually by admin for security</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>For urgent recharges, please contact the mess admin directly</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-yellow-600 mt-1">•</span>
              <span>Minimum recharge amount is ₹100</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletRecharge; 