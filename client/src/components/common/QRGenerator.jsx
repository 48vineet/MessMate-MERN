// src/components/common/QRGenerator.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCodeIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  PrinterIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ArrowDownTrayIcon   // ✅ Fixed - was DownloadIcon
} from '@heroicons/react/24/outline';
import { Button, Badge, Modal } from '../ui';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRGenerator = ({ 
  userId, 
  mealType, 
  bookingId, 
  isOpen = false, 
  onClose,
  onSuccess
}) => {
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [loading, setLoading] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    if (isOpen && userId && mealType) {
      generateQR();
    }
  }, [isOpen, userId, mealType, bookingId]);

  // Countdown timer
  useEffect(() => {
    if (qrData && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [qrData, timeLeft]);

  const generateQR = async () => {
    try {
      setLoading(true);
      
      const data = {
        userId,
        mealType,
        bookingId,
        timestamp: Date.now(),
        validUntil: Date.now() + (30 * 60 * 1000), // 30 minutes
        version: '1.0'
      };
      
      setQrData(data);
      
      // Generate QR code with high quality
      const qrString = JSON.stringify(data);
      const qrDataURL = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });
      
      setQrCode(qrDataURL);
      setTimeLeft(30 * 60); // Reset timer
      
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(qrData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && qrCode) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrCode);
        const blob = await response.blob();
        const file = new File([blob], `messmate-qr-${bookingId}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'MessMate QR Code',
          text: `QR Code for ${mealType} booking`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        handleDownload(); // Fallback to download
      }
    } else {
      handleDownload();
    }
  };

  const handleDownload = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.download = `messmate-qr-${bookingId || 'booking'}.png`;
      link.href = qrCode;
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }
  };

  const handlePrint = () => {
    if (!qrCode) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>MessMate QR Code</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              text-align: center; 
              padding: 40px; 
              background: #f8fafc;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .qr-code { 
              max-width: 250px; 
              margin: 20px auto;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 10px;
              background: white;
            }
            .details {
              background: #f1f5f9;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MessMate QR Code</h1>
              <p>Scan to Check-in</p>
            </div>
            <img src="${qrCode}" alt="QR Code" class="qr-code" />
            <div class="details">
              <p><strong>Meal Type:</strong> ${mealType}</p>
              <p><strong>Booking ID:</strong> ${bookingId}</p>
              <p><strong>Valid Until:</strong> ${new Date(qrData?.validUntil).toLocaleString()}</p>
            </div>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()}</p>
              <p>MessMate - Smart Mess Management System</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getExpiryColor = () => {
    if (timeLeft > 600) return 'text-green-600'; // > 10 minutes
    if (timeLeft > 300) return 'text-yellow-600'; // > 5 minutes
    return 'text-red-600'; // < 5 minutes
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Your QR Code"
      size="md"
    >
      <div className="space-y-6">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Generating your QR code...</p>
          </motion.div>
        ) : qrCode ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* QR Code Display */}
            <div className="text-center">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200 mx-auto max-w-sm">
                <div className="flex items-center justify-center mb-4">
                  <QrCodeIcon className="h-8 w-8 text-primary-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Scan to Check-in</h3>
                </div>
                
                <div className="relative">
                  <img 
                    ref={qrRef}
                    src={qrCode} 
                    alt="QR Code" 
                    className="w-64 h-64 mx-auto border-2 border-gray-300 rounded-lg bg-white"
                  />
                  
                  {/* Timer Overlay */}
                  <div className="absolute top-2 right-2">
                    <div className={`bg-white rounded-full px-2 py-1 shadow-lg flex items-center space-x-1 ${getExpiryColor()}`}>
                      <ClockIcon className="h-3 w-3" />
                      <span className="text-xs font-mono font-bold">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Meal Type:</span>
                    <Badge variant="primary" className="capitalize">{mealType}</Badge>
                  </div>
                  {bookingId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-mono font-medium text-gray-900">{bookingId}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Expires:</span>
                    <span className={`font-medium ${getExpiryColor()}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <span className="text-lg mr-2">💡</span>
                How to use this QR code:
              </h4>
              <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
                <li>Show this QR code at the mess counter</li>
                <li>Staff will scan the code to verify your booking</li>
                <li>Collect your meal and enjoy!</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleCopy}
                leftIcon={copied ? <CheckCircleIcon className="h-4 w-4" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
                className={copied ? 'border-green-500 text-green-600 bg-green-50' : ''}
                disabled={copied}
              >
                {copied ? 'Copied!' : 'Copy Data'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownload}
                leftIcon={downloaded ? <CheckCircleIcon className="h-4 w-4" /> : <ArrowDownTrayIcon className="h-4 w-4" />}
                className={downloaded ? 'border-green-500 text-green-600 bg-green-50' : ''}
                disabled={downloaded}
              >
                {downloaded ? 'Downloaded!' : 'Download'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                leftIcon={<ShareIcon className="h-4 w-4" />}
              >
                Share
              </Button>
              
              <Button
                variant="outline"
                onClick={handlePrint}
                leftIcon={<PrinterIcon className="h-4 w-4" />}
              >
                Print
              </Button>
            </div>

            {/* Regenerate Button */}
            <div className="text-center pt-4">
              <Button
                variant="primary"
                onClick={generateQR}
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate New QR Code'}
              </Button>
            </div>

            {/* Expiry Warning */}
            {timeLeft < 300 && timeLeft > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <div className="text-red-500 mr-3">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-red-800 font-medium">QR Code expiring soon!</p>
                    <p className="text-red-700 text-sm">
                      This code will expire in {formatTime(timeLeft)}. Generate a new one if needed.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Expired State */}
            {timeLeft <= 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
              >
                <XMarkIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <h4 className="text-red-800 font-bold mb-2">QR Code Expired</h4>
                <p className="text-red-700 text-sm mb-4">
                  This QR code has expired. Please generate a new one.
                </p>
                <Button variant="primary" onClick={generateQR} className="w-full">
                  Generate New QR Code
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <QrCodeIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No QR code available</p>
            <p className="text-sm">Please check your booking details</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QRGenerator;
