// src/components/common/QRScanner.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CameraIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LightBulbIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { Button, Badge, Modal } from '../ui';
import { useState, useEffect, useRef } from 'react';

const QRScanner = ({ 
  isOpen = false, 
  onClose, 
  onScan, 
  title = "Scan QR Code",
  expectedMealType = null
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [flashOn, setFlashOn] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      requestCameraPermission();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setHasPermission(true);
      setError(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        
        // Start scanning simulation
        startScanning();
      }
    } catch (err) {
      setHasPermission(false);
      setError('Camera access denied. Please allow camera permissions to scan QR codes.');
    }
  };

  const startScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    // Simulate QR code detection
    scanIntervalRef.current = setInterval(() => {
      if (Math.random() > 0.9) { // 10% chance of detecting QR code
        const mockQRData = {
          userId: 'USR' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          mealType: expectedMealType || ['breakfast', 'lunch', 'dinner'][Math.floor(Math.random() * 3)],
          bookingId: 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          timestamp: Date.now(),
          validUntil: Date.now() + (30 * 60 * 1000),
          version: '1.0'
        };
        
        handleScanSuccess(mockQRData);
      }
    }, 2000);

    // Auto-stop after 60 seconds
    setTimeout(() => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        if (isScanning && !scanResult) {
          setError('No QR code detected. Please ensure the QR code is clearly visible and try again.');
          setIsScanning(false);
        }
      }
    }, 60000);
  };

  const handleScanSuccess = (qrData) => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    // Validate QR code data
    if (validateQRCode(qrData)) {
      setScanResult(qrData);
      setScanHistory(prev => [qrData, ...prev.slice(0, 4)]); // Keep last 5 scans
      
      if (onScan) {
        onScan(qrData);
      }
    } else {
      setError('Invalid QR code. Please scan a valid MessMate QR code.');
      setIsScanning(false);
    }
  };

  const validateQRCode = (qrData) => {
    // Check if QR code has required fields
    if (!qrData || !qrData.userId || !qrData.mealType || !qrData.timestamp) {
      return false;
    }

    // Check if QR code is not expired
    if (qrData.validUntil && Date.now() > qrData.validUntil) {
      setError('QR code has expired. Please generate a new one.');
      return false;
    }

    // Check meal type if specified
    if (expectedMealType && qrData.mealType !== expectedMealType) {
      setError(`This QR code is for ${qrData.mealType}, but ${expectedMealType} was expected.`);
      return false;
    }

    return true;
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setIsScanning(false);
  };

  const handleRetry = () => {
    setScanResult(null);
    setError(null);
    setIsScanning(false);
    requestCameraPermission();
  };

  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashOn }]
          });
          setFlashOn(!flashOn);
        } catch (error) {
          console.error('Flash toggle failed:', error);
        }
      }
    }
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setError(null);
    onClose();
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="lg"
    >
      <div className="space-y-6">
        {/* Scanner View */}
        <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {hasPermission === null && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <CameraIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <div className="animate-pulse">
                  <p className="text-lg font-medium mb-2">Requesting Camera Access</p>
                  <p className="text-sm text-gray-400">Please allow camera permissions to scan QR codes</p>
                </div>
              </div>
            </div>
          )}

          {hasPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white max-w-sm">
                <ExclamationTriangleIcon className="h-16 w-16 mx-auto mb-4 text-red-400" />
                <p className="text-lg font-medium mb-2">Camera Access Denied</p>
                <p className="text-sm text-gray-400 mb-4">
                  Please enable camera permissions in your browser settings and try again
                </p>
                <Button variant="outline" onClick={requestCameraPermission} className="text-white border-white">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {hasPermission && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    {/* Scanning Frame */}
                    <div className="w-64 h-64 border-4 border-white rounded-3xl relative overflow-hidden">
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-400 rounded-tl-3xl"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-400 rounded-tr-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-400 rounded-bl-3xl"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-400 rounded-br-3xl"></div>
                      
                      {/* Scanning Line */}
                      <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 250, opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 bg-primary-400 shadow-lg"
                        style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' }}
                      />
                      
                      {/* Center QR icon */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <QrCodeIcon className="h-8 w-8 text-white opacity-30" />
                      </div>
                    </div>
                    
                    {/* Scanning instruction */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
                    >
                      <p className="text-white font-medium">Position QR code in the frame</p>
                    </motion.div>
                  </motion.div>
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleFlash}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    flashOn 
                      ? 'bg-yellow-500 text-white shadow-lg' 
                      : 'bg-black/50 text-white border border-white/30'
                  }`}
                >
                  <LightBulbIcon className="h-5 w-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRetry}
                  className="w-12 h-12 rounded-full bg-black/50 text-white border border-white/30 flex items-center justify-center"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </>
          )}
        </div>

        {/* Status Messages */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 rounded-full border border-blue-200">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-blue-800 font-medium">Scanning for QR code...</span>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Point your camera at a MessMate QR code
            </p>
          </motion.div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6"
          >
            <div className="flex items-center mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-green-800">QR Code Scanned Successfully!</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700 font-medium">User ID:</span>
                  <Badge variant="success" className="font-mono text-xs">{scanResult.userId}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 font-medium">Meal Type:</span>
                  <Badge variant="primary" className="capitalize">{scanResult.mealType}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                {scanResult.bookingId && (
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">Booking ID:</span>
                    <span className="font-mono text-gray-900">{scanResult.bookingId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-green-700 font-medium">Valid Until:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(scanResult.validUntil).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-6"
          >
            <div className="flex items-center mb-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <span className="font-bold text-red-800">Scan Failed</span>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleRetry} size="sm">
                Try Again
              </Button>
              <Button variant="ghost" onClick={handleClose} size="sm">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-xl p-4"
          >
            <h4 className="font-medium text-gray-900 mb-3">Recent Scans</h4>
            <div className="space-y-2">
              {scanHistory.slice(0, 3).map((scan, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-white rounded-lg">
                  <div className="flex items-center space-x-2">
                    <QrCodeIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-mono text-gray-600">{scan.userId}</span>
                    <Badge variant="gray" className="text-xs capitalize">{scan.mealType}</Badge>
                  </div>
                  <span className="text-gray-500 text-xs">{formatTimeAgo(scan.timestamp)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          {scanResult && (
            <Button variant="primary" onClick={handleClose}>
              Confirm Scan
            </Button>
          )}
          {error && !scanResult && (
            <Button variant="primary" onClick={handleRetry}>
              Scan Again
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QRScanner;
