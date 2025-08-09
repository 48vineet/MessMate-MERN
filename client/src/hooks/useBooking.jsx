// src/hooks/useBooking.jsx
import { useState, useEffect, useCallback } from 'react';
import { useBooking as useBookingContext } from '../context/BookingContext';
import { toast } from 'react-hot-toast';

const useBooking = () => {
  return useBookingContext();
};

export const useQuickBooking = () => {
  const { createBooking } = useBookingContext();
  const [booking, setBooking] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);

  const quickBook = useCallback(async (mealType, date = new Date().toISOString().split('T')[0], paymentMethod = 'wallet') => {
    if (!mealType) {
      toast.error('Meal type is required');
      return { success: false, error: 'Meal type is required' };
    }

    setBooking(true);
    
    try {
      const result = await createBooking({
        mealType,
        date,
        paymentMethod
      });

      if (result.success) {
        setLastBooking(result.booking);
        toast.success(`${mealType} booked successfully!`);
      }

      return result;
    } catch (error) {
      const errorMessage = error.message || 'Booking failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setBooking(false);
    }
  }, [createBooking]);

  return { quickBook, booking, lastBooking };
};

export const useUpcomingMeals = () => {
  const { fetchUpcomingBookings, upcomingBookings } = useBookingContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchUpcomingBookings();
      
      if (!result.success) {
        setError(result.error || 'Failed to fetch upcoming meals');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch upcoming meals';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchUpcomingBookings]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { 
    upcomingMeals: upcomingBookings, 
    loading, 
    error, 
    refetch 
  };
};

export const useBookingHistory = (filters = {}) => {
  const { fetchBookings, bookings, pagination } = useBookingContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (page = 1, newFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchBookings(page, { ...filters, ...newFilters });
      
      if (!result.success) {
        setError(result.error || 'Failed to fetch booking history');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch booking history';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchBookings, filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { 
    bookings, 
    pagination, 
    loading, 
    error, 
    refetch: fetchHistory 
  };
};

export const useBookingActions = () => {
  const { updateBooking, cancelBooking, deleteBooking } = useBookingContext();
  const [actionLoading, setActionLoading] = useState({});

  const handleUpdateBooking = useCallback(async (bookingId, updateData) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: 'updating' }));

    try {
      const result = await updateBooking(bookingId, updateData);
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to update booking';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  }, [updateBooking]);

  const handleCancelBooking = useCallback(async (bookingId, reason = 'User cancelled') => {
    setActionLoading(prev => ({ ...prev, [bookingId]: 'cancelling' }));

    try {
      const result = await cancelBooking(bookingId, reason);
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to cancel booking';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  }, [cancelBooking]);

  const handleDeleteBooking = useCallback(async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: 'deleting' }));

    try {
      const result = await deleteBooking(bookingId);
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete booking';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  }, [deleteBooking]);

  return { 
    handleUpdateBooking, 
    handleCancelBooking, 
    handleDeleteBooking, 
    actionLoading 
  };
};

export default useBooking;
