// src/components/payments/UPIPayment.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button, Modal, Badge, Input } from '../ui';
import { QrCodeIcon, DocumentDuplicateIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import QRCode from 'qrcode';

const UPIPayment = ({ isOpen, onClose, amount, orderId, onPaymentSuccess }) => {
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [copied, setCopied] = useState(false);

  // Your UPI Configuration
  const UPI_ID = "7038738012-2@ybl";
  const MERCHANT_NAME = "MessMate";

  const upiApps = [
    {
      name: 'PhonePe',
      icon: '📱',
      color: 'bg-purple-500',
      deepLink: 'phonepe://pay'
    },
    {
      name: 'Google Pay',
      icon: '🌐', 
      color: 'bg-green-500',
      deepLink: 'gpay://upi/pay'
    },
    {
      name: 'Paytm',
      icon: '💳',
      color: 'bg-blue-500', 
      deepLink: 'paytm://pay'
    },
    {
      name: 'BHIM UPI',
      icon: '🏦',
      color: 'bg-orange-500',
      deepLink: 'bhim://pay'
    }
  ];

  const generatePayment = async () => {
    try {
      // Generate UPI URL with your PhonePe ID
      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`MessMate Payment - ${orderId}`)}`;
      
      // Generate QR Code
      const qrCode = await QRCode.toDataURL(upiUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      
      setQrCodeImage(qrCode);
      setPaymentStatus('payment_generated');
    } catch (error) {
      console.error('Payment generation error:', error);
    }
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openUPIApp = (app) => {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`MessMate Payment - ${orderId}`)}`;
    
    // Try to open specific app deep link
    const specificUrl = `${app.deepLink}?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`MessMate Payment - ${orderId}`)}`;
    
    // Fallback to generic UPI URL
    window.open(specificUrl, '_blank') || window.open(upiUrl, '_blank');
  };

  const submitPayment = async () => {
    if (!transactionId) return;

    // Here you would typically call your backend to store the transaction
    // For now, we'll simulate success
    try {
      setPaymentStatus('submitted');
      onPaymentSuccess({
        transactionId,
        amount,
        orderId,
        upiId: UPI_ID,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Payment verification error:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="UPI Payment" size="md">
      <div className="space-y-6">
        {/* Payment Amount */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">₹{amount}</h3>
          <p className="text-gray-600">Order ID: {orderId}</p>
        </div>

        {paymentStatus === 'pending' && (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white border-2 border-gray-200 rounded-lg"
            >
              <QrCodeIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h4 className="font-semibold text-gray-900 mb-2">Ready to Pay?</h4>
              <p className="text-gray-600 mb-4">Click below to generate UPI payment QR code</p>
              <Button variant="primary" onClick={generatePayment} className="w-full">
                Generate UPI Payment
              </Button>
            </motion.div>
          </div>
        )}

        {paymentStatus === 'payment_generated' && qrCodeImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* QR Code */}
            <div className="text-center p-6 bg-white border-2 border-gray-200 rounded-lg">
              <img 
                src={qrCodeImage} 
                alt="UPI QR Code" 
                className="w-48 h-48 mx-auto mb-4 border-2 border-gray-300 rounded-lg"
              />
              <p className="text-sm text-gray-600 mb-4">Scan with any UPI app</p>
            </div>

            {/* UPI ID Display */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Pay to UPI ID</p>
                  <p className="text-lg font-mono font-bold text-gray-900">{UPI_ID}</p>
                  <p className="text-sm text-gray-600">{MERCHANT_NAME}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyUPIId}
                  leftIcon={copied ? <CheckCircleIcon className="h-4 w-4" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
                >
                  {copied ? 'Copied!' : 'Copy UPI ID'}
                </Button>
              </div>
            </div>

            {/* UPI Apps */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pay with UPI Apps</h4>
              <div className="grid grid-cols-2 gap-3">
                {upiApps.map((app, index) => (
                  <motion.button
                    key={app.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openUPIApp(app)}
                    className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                  >
                    <div className={`w-10 h-10 ${app.color} rounded-full flex items-center justify-center text-lg mb-2 mx-auto`}>
                      {app.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{app.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Manual Payment Instructions */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">📱 Manual Payment Steps:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal ml-4">
                <li>Open your UPI app (PhonePe, Google Pay, etc.)</li>
                <li>Scan the QR code above OR enter UPI ID: <strong>{UPI_ID}</strong></li>
                <li>Enter amount: <strong>₹{amount}</strong></li>
                <li>Complete the payment</li>
                <li>Enter the transaction ID below</li>
              </ol>
            </div>

            {/* Payment Confirmation */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-3">After Payment</h4>
              <p className="text-sm text-yellow-700 mb-4">
                Enter your UPI transaction ID below to confirm payment
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Enter UPI Transaction ID (e.g., 123456789012)"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
                <Button 
                  variant="primary" 
                  onClick={submitPayment}
                  disabled={!transactionId}
                  className="w-full"
                >
                  Confirm Payment
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {paymentStatus === 'submitted' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="text-6xl mb-4">✅</div>
            <h4 className="font-bold text-green-800 mb-2">Payment Submitted!</h4>
            <p className="text-green-700 mb-4">
              Your payment to <strong>{UPI_ID}</strong> has been submitted for verification. 
              You'll receive a confirmation once it's verified by our team.
            </p>
            <Badge variant="success">Transaction ID: {transactionId}</Badge>
          </motion.div>
        )}
      </div>
    </Modal>
  );
};

export default UPIPayment;
