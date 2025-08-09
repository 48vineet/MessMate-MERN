import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const QRDisplayPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qrData = location.state?.qrData;
  const bookingData = location.state?.booking;

  console.log('=== QR Display Page Debug ===');
  console.log('Location state:', location.state);
  console.log('QR Data:', qrData);
  console.log('Booking Data:', bookingData);

  if (!qrData) {
    console.log('No QR data found, showing error page');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">QR Code Not Found</h1>
          <p className="text-gray-600 mb-6">No QR code data available.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Parse QR data safely
  const parseQRData = () => {
    try {
      console.log('Parsing QR data:', qrData.data);
      const parsed = qrData.data ? JSON.parse(qrData.data) : null;
      console.log('Parsed QR data:', parsed);
      return parsed;
    } catch (error) {
      console.error('Error parsing QR data:', error);
      return null;
    }
  };

  const qrInfo = parseQRData();

  // Format dates safely
  const formatDate = (dateString) => {
    try {
      console.log('Formatting date:', dateString);
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    try {
      console.log('Formatting time:', dateString);
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      const formatted = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      console.log('Formatted time:', formatted);
      return formatted;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  console.log('QR Info:', qrInfo);
  console.log('QR URL:', qrData.url);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Meal QR Code</h1>
        </div>

        <Card className="p-6">
          <div className="text-center">
            <div className="mb-6">
              <img
                src={qrData.url}
                alt="QR Code"
                className="mx-auto w-64 h-64 border-2 border-gray-200 rounded-lg"
                onError={(e) => {
                  console.error('QR image failed to load:', e);
                  e.target.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('QR image loaded successfully');
                }}
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Booking Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Booking ID:</strong> {qrInfo?.bookingId || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Meal Type:</strong> {qrInfo?.mealType?.toUpperCase() || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Date:</strong> {formatDate(qrInfo?.bookingDate)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Time:</strong> {formatTime(qrInfo?.timestamp)}
                  </p>
                  {bookingData && (
                    <p className="text-sm text-gray-600">
                      <strong>Status:</strong> {bookingData.status?.toUpperCase() || 'N/A'}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500">
                  Show this QR code at the mess counter to collect your meal
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QRDisplayPage; 