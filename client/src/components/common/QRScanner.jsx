// src/components/common/QRScanner.jsx
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCodeIcon,
  CameraIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const QRScanner = ({ isOpen, onClose, onScanSuccess, onScanError }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [hasCamera, setHasCamera] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      setScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
        startScanning();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
      setHasCamera(false);
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const startScanning = () => {
    const scanInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current && scanning) {
        captureAndAnalyze();
      } else {
        clearInterval(scanInterval);
      }
    }, 500);
  };

  const captureAndAnalyze = async () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // In a real implementation, you would use a QR code library like jsQR
      // For now, we'll simulate QR detection
      const qrData = await simulateQRDetection(imageData);
      
      if (qrData) {
        handleQRDetected(qrData);
      }
    } catch (err) {
      console.error('QR scanning error:', err);
    }
  };

  const simulateQRDetection = async (imageData) => {
    // Simulate QR code detection
    // In real implementation, use: import jsQR from 'jsqr';
    // return jsQR(imageData.data, imageData.width, imageData.height);
    
    // For demo purposes, return null (no QR detected)
    return null;
  };

  const handleQRDetected = async (qrData) => {
    setScanning(false);
    
    try {
      // Validate QR code with backend
      const response = await api.post('/qr/validate', {
        qrCode: qrData.data || qrData
      });

      if (response.data.success) {
        toast.success('QR code scanned successfully!');
        onScanSuccess && onScanSuccess(response.data);
        onClose();
      } else {
        toast.error(response.data.message || 'Invalid QR code');
        onScanError && onScanError(response.data.message);
        setScanning(true); // Continue scanning
      }
    } catch (error) {
      console.error('QR validation error:', error);
      toast.error('Failed to validate QR code');
      onScanError && onScanError('Validation failed');
      setScanning(true); // Continue scanning
    }
  };

  const handleManualInput = async (qrText) => {
    if (!qrText.trim()) {
      toast.error('Please enter a valid QR code');
      return;
    }

    try {
      const response = await api.post('/qr/validate', {
        qrCode: qrText.trim()
      });

      if (response.data.success) {
        toast.success('QR code validated successfully!');
        onScanSuccess && onScanSuccess(response.data);
        onClose();
      } else {
        toast.error(response.data.message || 'Invalid QR code');
        onScanError && onScanError(response.data.message);
      }
    } catch (error) {
      console.error('QR validation error:', error);
      toast.error('Failed to validate QR code');
      onScanError && onScanError('Validation failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <QrCodeIcon className="h-6 w-6 mr-2" />
            Scan QR Code
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Camera View */}
        {hasCamera && !error ? (
          <div className="relative mb-6">
            <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Scanning Frame */}
                  <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                  </div>
                  
                  {/* Scanning Animation */}
                  {scanning && (
                    <motion.div
                      initial={{ y: -192 }}
                      animate={{ y: 192 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute left-0 w-48 h-1 bg-blue-500 opacity-75"
                    />
                  )}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="absolute top-4 left-4">
                <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  scanning ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    scanning ? 'bg-white animate-pulse' : 'bg-white'
                  }`}></div>
                  {scanning ? 'Scanning...' : 'Camera Off'}
                </div>
              </div>
            </div>

            <p className="text-center text-gray-600 mt-4 text-sm">
              Position the QR code within the frame to scan
            </p>
          </div>
        ) : (
          /* Camera Error State */
          <div className="text-center py-8 mb-6">
            <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Camera Access Required</h4>
            <p className="text-gray-600 text-sm mb-4">
              {error || 'Unable to access camera. Please check permissions.'}
            </p>
            <button
              onClick={startCamera}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <CameraIcon className="h-5 w-5 mr-2" />
              Try Again
            </button>
          </div>
        )}

        {/* Manual Input Option */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Or enter QR code manually:</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter QR code text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualInput(e.target.value);
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.previousElementSibling;
                handleManualInput(input.value);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Validate
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">How to scan:</h5>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Hold your device steady</li>
            <li>• Position QR code within the frame</li>
            <li>• Ensure good lighting</li>
            <li>• Wait for automatic detection</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default QRScanner;
