// src/context/BookingContext.jsx
import { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  bookings: [],
  currentBooking: null,
  upcomingBookings: [],
  pastBookings: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    mealType: 'all',
    dateRange: 'all'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  }
};

// Action types
const BOOKING_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_BOOKINGS: 'SET_BOOKINGS',
  SET_CURRENT_BOOKING: 'SET_CURRENT_BOOKING',
  SET_UPCOMING_BOOKINGS: 'SET_UPCOMING_BOOKINGS',
  SET_PAST_BOOKINGS: 'SET_PAST_BOOKINGS',
  ADD_BOOKING: 'ADD_BOOKING',
  UPDATE_BOOKING: 'UPDATE_BOOKING',
  REMOVE_BOOKING: 'REMOVE_BOOKING',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const bookingReducer = (state, action) => {
  switch (action.type) {
    case BOOKING_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case BOOKING_ACTIONS.SET_BOOKINGS:
      return {
        ...state,
        bookings: action.payload,
        loading: false,
        error: null
      };

    case BOOKING_ACTIONS.SET_CURRENT_BOOKING:
      return {
        ...state,
        currentBooking: action.payload,
        loading: false,
        error: null
      };

    case BOOKING_ACTIONS.SET_UPCOMING_BOOKINGS:
      return {
        ...state,
        upcomingBookings: action.payload,
        loading: false,
        error: null
      };

    case BOOKING_ACTIONS.SET_PAST_BOOKINGS:
      return {
        ...state,
        pastBookings: action.payload,
        loading: false,
        error: null
      };

    case BOOKING_ACTIONS.ADD_BOOKING:
      return {
        ...state,
        bookings: [action.payload, ...state.bookings],
        upcomingBookings: [action.payload, ...state.upcomingBookings],
        error: null
      };

    case BOOKING_ACTIONS.UPDATE_BOOKING:
      const updatedBookings = state.bookings.map(booking =>
        booking._id === action.payload._id ? action.payload : booking
      );
      
      return {
        ...state,
        bookings: updatedBookings,
        upcomingBookings: state.upcomingBookings.map(booking =>
          booking._id === action.payload._id ? action.payload : booking
        ),
        currentBooking: state.currentBooking?._id === action.payload._id 
          ? action.payload 
          : state.currentBooking,
        error: null
      };

    case BOOKING_ACTIONS.REMOVE_BOOKING:
      return {
        ...state,
        bookings: state.bookings.filter(booking => booking._id !== action.payload),
        upcomingBookings: state.upcomingBookings.filter(booking => booking._id !== action.payload),
        currentBooking: state.currentBooking?._id === action.payload ? null : state.currentBooking,
        error: null
      };

    case BOOKING_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case BOOKING_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };

    case BOOKING_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case BOOKING_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const BookingContext = createContext();

// Booking Provider component
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Fetch all bookings with pagination and filters
  const fetchBookings = useCallback(async (page = 1, filters = {}) => {
    try {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });

      const params = {
        page,
        limit: state.pagination.itemsPerPage,
        ...state.filters,
        ...filters
      };

      const response = await api.get('/bookings', { params });
      
      if (response.data.success) {
        const { bookings, pagination } = response.data;
        
        dispatch({ type: BOOKING_ACTIONS.SET_BOOKINGS, payload: bookings });
        dispatch({ type: BOOKING_ACTIONS.SET_PAGINATION, payload: pagination });
        
        return { success: true, bookings, pagination };
      } else {
        throw new Error(response.data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch bookings';
      
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [state.filters, state.pagination.itemsPerPage]);

  // Fetch upcoming bookings
  const fetchUpcomingBookings = useCallback(async () => {
    try {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });

      const response = await api.get('/bookings/upcoming');
      
      if (response.data.success) {
        const bookings = response.data.bookings || [];
        
        dispatch({ type: BOOKING_ACTIONS.SET_UPCOMING_BOOKINGS, payload: bookings });
        
        return { success: true, bookings };
      } else {
        throw new Error(response.data.message || 'Failed to fetch upcoming bookings');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch upcoming bookings';
      
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Fetch past bookings
  const fetchPastBookings = useCallback(async () => {
    try {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });

      const response = await api.get('/bookings/past');
      
      if (response.data.success) {
        const bookings = response.data.bookings || [];
        
        dispatch({ type: BOOKING_ACTIONS.SET_PAST_BOOKINGS, payload: bookings });
        
        return { success: true, bookings };
      } else {
        throw new Error(response.data.message || 'Failed to fetch past bookings');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch past bookings';
      
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Create a new booking
  const createBooking = useCallback(async (bookingData) => {
    try {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });

      const response = await api.post('/bookings/create', bookingData);
      
      if (response.data.success) {
        const booking = response.data.booking;
        
        dispatch({ type: BOOKING_ACTIONS.ADD_BOOKING, payload: booking });
        toast.success('Booking created successfully!');
        
        return { success: true, booking };
      } else {
        throw new Error(response.data.message || 'Failed to create booking');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create booking';
      
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Update booking
  const updateBooking = useCallback(async (bookingId, updateData) => {
    try {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });

      const response = await api.put(`/bookings/${bookingId}`, updateData);
      
      if (response.data.success) {
        const booking = response.data.booking;
        
        dispatch({ type: BOOKING_ACTIONS.UPDATE_BOOKING, payload: booking });
        toast.success('Booking updated successfully!');
        
        return { success: true, booking };
      } else {
        throw new Error(response.data.message || 'Failed to update booking');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update booking';
      
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId, reason) => {
    try {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });

      const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason });
      
      if (response.data.success) {
        const booking = response.data.booking;
        
        dispatch({ type: BOOKING_ACTIONS.UPDATE_BOOKING, payload: booking });
        toast.success('Booking cancelled successfully!');
        
        return { success: true, booking };
      } else {
        throw new Error(response.data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel booking';
      
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Delete booking
  const deleteBooking = useCallback(async (bookingId) => {
    try {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });

      const response = await api.delete(`/bookings/${bookingId}`);
      
      if (response.data.success) {
        dispatch({ type: BOOKING_ACTIONS.REMOVE_BOOKING, payload: bookingId });
        toast.success('Booking deleted successfully!');
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to delete booking');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete booking';
      
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Get booking by ID
  const getBookingById = useCallback(async (bookingId) => {
    try {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });

      const response = await api.get(`/bookings/${bookingId}`);
      
      if (response.data.success) {
        const booking = response.data.booking;
        
        dispatch({ type: BOOKING_ACTIONS.SET_CURRENT_BOOKING, payload: booking });
        
        return { success: true, booking };
      } else {
        throw new Error(response.data.message || 'Booking not found');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch booking';
      
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Set filters
  const setFilters = (filters) => {
    dispatch({ type: BOOKING_ACTIONS.SET_FILTERS, payload: filters });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });
  };

  // Get booking statistics
  const getBookingStats = useCallback(async () => {
    try {
      const response = await api.get('/bookings/stats');
      
      if (response.data.success) {
        return { success: true, stats: response.data.stats };
      } else {
        throw new Error(response.data.message || 'Failed to fetch booking stats');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch booking stats';
      return { success: false, error: errorMessage };
    }
  }, []);

  const value = {
    // State
    bookings: state.bookings,
    currentBooking: state.currentBooking,
    upcomingBookings: state.upcomingBookings,
    pastBookings: state.pastBookings,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,
    
    // Actions
    fetchBookings,
    fetchUpcomingBookings,
    fetchPastBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    getBookingById,
    setFilters,
    clearError,
    getBookingStats
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook to use booking context
export const useBooking = () => {
  const context = useContext(BookingContext);
  
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  
  return context;
};

export default BookingContext;
