// components/dashboard/BookingCard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useBooking } from '../../hooks/useBooking';
import { useModal } from '../../hooks/useModal';
import { Button, Badge, LoadingSpinner } from '../ui';
import { QRGenerator } from '../common';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  QrCodeIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const BookingCard = ({ todayBookings = [], loading = false }) => {
  const { 
    bookings, 
    fetchBookings, 
    cancelBooking, 
    addFeedback,
    getUpcomingBookings,
    loading: bookingLoading 
  } = useBooking();
  
  const { isOpen, data, openModal, closeModal } = useModal();
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId, reason = 'User cancelled') => {
    try {
      await cancelBooking(bookingId, reason);
    } catch (error) {
      console.error('Cancel booking error:', error);
    }
  };

  const handleGenerateQR = (booking) => {
    openModal({
      type: 'qr',
      booking,
      userId: booking.user,
      mealType: booking.mealType,
      bookingId: booking.bookingId
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      prepared: 'info',
      served: 'success',
      cancelled: 'danger',
      'no-show': 'danger'
    };
    return colors[status] || 'gray';
  };

  const upcomingBookings = getUpcomingBookings();
  const displayBookings = activeTab === 'today' ? todayBookings : upcomingBookings;

  if (loading || bookingLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              My Bookings 📅
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your meal reservations
            </p>
          </div>
          
          <div className="text-sm text-gray-500">
            Total: {bookings.length} bookings
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'today'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Today ({todayBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'upcoming'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="p-6">
        {displayBookings.length > 0 ? (
          <div className="space-y-4">
            {displayBookings.map((booking, index) => (
              <motion.div
                key={booking._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                {/* Booking Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {booking.menuItem?.name || 'Meal Booking'}
                      </h3>
                      <Badge
                        variant={getStatusColor(booking.status)}
                        className="text-xs"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{booking.mealTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ₹{booking.finalAmount}
                    </div>
                    <div className="text-xs text-gray-500">
                      Qty: {booking.quantity}
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="ml-2 font-mono font-medium">
                      {booking.bookingId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Meal Type:</span>
                    <span className="ml-2 capitalize font-medium">
                      {booking.mealType}
                    </span>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Special Requests:</span>
                    <p className="text-sm mt-1">{booking.specialRequests}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {/* QR Code Button */}
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateQR(booking)}
                        leftIcon={<QrCodeIcon className="w-4 h-4" />}
                      >
                        QR Code
                      </Button>
                    )}
                    
                    {/* Cancel Button */}
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking._id)}
                        leftIcon={<ExclamationTriangleIcon className="w-4 h-4" />}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(booking.updatedAt || booking.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📅</span>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'today' 
                ? "You haven't booked any meals for today" 
                : "No upcoming bookings scheduled"
              }
            </p>
            <Button 
              variant="primary" 
              onClick={() => window.location.href = '/menu'}
            >
              Browse Menu
            </Button>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QRGenerator
        isOpen={isOpen && data?.type === 'qr'}
        onClose={closeModal}
        userId={data?.userId}
        mealType={data?.mealType}
        bookingId={data?.bookingId}
        onSuccess={() => {
          console.log('QR Code generated successfully');
        }}
      />
    </div>
  );
};

export default BookingCard;
