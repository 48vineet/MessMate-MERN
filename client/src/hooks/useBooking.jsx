// hooks/useBooking.js
import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { useSocket } from './useSocket';
import { useToast } from './useToast';

export const useBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { bookingAPI } = useApi();
  const { onBookingUpdate, sendBookingUpdate } = useSocket();
  const { showToast } = useToast();

  // Fetch user bookings
  const fetchBookings = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingAPI.getBookings(params);
      setBookings(response.data || []);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bookingAPI]);

  // Create new booking
  const createBooking = useCallback(async (bookingData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingAPI.createBooking(bookingData);
      
      if (response.success) {
        // Update local state
        setBookings(prev => [response.data, ...prev]);
        
        // Send real-time update
        sendBookingUpdate({
          type: 'new_booking',
          booking: response.data
        });
        
        showToast('Booking created successfully!', 'success');
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to create booking', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bookingAPI, sendBookingUpdate, showToast]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId, reason) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingAPI.cancelBooking(bookingId, { reason });
      
      if (response.success) {
        // Update local state
        setBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: 'cancelled', cancellationReason: reason }
              : booking
          )
        );
        
        showToast('Booking cancelled successfully', 'success');
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to cancel booking', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bookingAPI, showToast]);

  // Add feedback to booking
  const addFeedback = useCallback(async (bookingId, feedbackData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingAPI.addFeedback(bookingId, feedbackData);
      
      if (response.success) {
        // Update local state
        setBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { ...booking, feedback: response.data }
              : booking
          )
        );
        
        showToast('Feedback submitted successfully!', 'success');
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to submit feedback', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bookingAPI, showToast]);

  // Get single booking
  const getBooking = useCallback(async (bookingId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookingAPI.getBooking(bookingId);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [bookingAPI]);

  // Listen for real-time booking updates
  useEffect(() => {
    const cleanup = onBookingUpdate?.((data) => {
      if (data.type === 'status_update') {
        setBookings(prev => 
          prev.map(booking => 
            booking._id === data.booking._id 
              ? { ...booking, ...data.booking }
              : booking
          )
        );
        
        showToast(`Booking ${data.booking.status}`, 'info');
      }
    });

    return cleanup;
  }, [onBookingUpdate, showToast]);

  // Helper functions
  const getTodayBookings = useCallback(() => {
    const today = new Date().toDateString();
    return bookings.filter(booking => 
      new Date(booking.bookingDate).toDateString() === today
    );
  }, [bookings]);

  const getUpcomingBookings = useCallback(() => {
    const now = new Date();
    return bookings.filter(booking => 
      new Date(booking.bookingDate) > now && booking.status !== 'cancelled'
    );
  }, [bookings]);

  const getPastBookings = useCallback(() => {
    const now = new Date();
    return bookings.filter(booking => 
      new Date(booking.bookingDate) < now
    );
  }, [bookings]);

  const getBookingsByStatus = useCallback((status) => {
    return bookings.filter(booking => booking.status === status);
  }, [bookings]);

  return {
    // State
    bookings,
    loading,
    error,
    
    // Actions
    fetchBookings,
    createBooking,
    cancelBooking,
    addFeedback,
    getBooking,
    
    // Helper functions
    getTodayBookings,
    getUpcomingBookings,
    getPastBookings,
    getBookingsByStatus,
    
    // Computed values
    todayBookings: getTodayBookings(),
    upcomingBookings: getUpcomingBookings(),
    pastBookings: getPastBookings()
  };
};

export default useBooking;
