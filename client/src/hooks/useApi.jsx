// hooks/useApi.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

const BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  // Request interceptor - Add auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle auth errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        logout();
        showToast('Session expired. Please login again.', 'error');
      }
      return Promise.reject(error);
    }
  );

  const request = useCallback(async (config) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api(config);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // API Methods
  const get = useCallback((url, params = {}) => {
    return request({ method: 'GET', url, params });
  }, [request]);

  const post = useCallback((url, data = {}) => {
    return request({ method: 'POST', url, data });
  }, [request]);

  const put = useCallback((url, data = {}) => {
    return request({ method: 'PUT', url, data });
  }, [request]);

  const patch = useCallback((url, data = {}) => {
    return request({ method: 'PATCH', url, data });
  }, [request]);

  const del = useCallback((url) => {
    return request({ method: 'DELETE', url });
  }, [request]);

  // Auth API
  const authAPI = {
    login: (credentials) => post('/auth/login', credentials),
    register: (userData) => post('/auth/register', userData),
    logout: () => post('/auth/logout'),
    getMe: () => get('/auth/me'),
    forgotPassword: (email) => post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => put(`/auth/reset-password/${token}`, { password }),
    updateProfile: (data) => put('/auth/update-details', data),
    updatePassword: (data) => put('/auth/update-password', data)
  };

  // Menu API
  const menuAPI = {
    getMenuItems: (params) => get('/menu', params),
    getMenuItem: (id) => get(`/menu/${id}`),
    getTodayMenu: () => get('/menu/today'),
    createMenuItem: (data) => post('/menu', data),
    updateMenuItem: (id, data) => put(`/menu/${id}`, data),
    deleteMenuItem: (id) => del(`/menu/${id}`)
  };

  // Booking API
  const bookingAPI = {
    getBookings: (params) => get('/bookings', params),
    getBooking: (id) => get(`/bookings/${id}`),
    createBooking: (data) => post('/bookings', data),
    updateBooking: (id, data) => patch(`/bookings/${id}/status`, data),
    cancelBooking: (id, data) => del(`/bookings/${id}`, data),
    addFeedback: (id, data) => post(`/bookings/${id}/feedback`, data)
  };

  // Payment API
  const paymentAPI = {
    generateUPI: (data) => post('/payments/generate-upi', data),
    verifyPayment: (data) => post('/payments/verify', data),
    getPayments: (params) => get('/payments', params),
    getUPIDetails: () => get('/payments/upi-details')
  };

  // User API
  const userAPI = {
    getUsers: (params) => get('/users', params),
    getUser: (id) => get(`/users/${id}`),
    updateUser: (id, data) => put(`/users/${id}`, data),
    addMoney: (id, data) => post(`/users/${id}/wallet/add`, data),
    getUserStats: (id) => get(`/users/${id}/stats`)
  };

  return {
    loading,
    error,
    // Direct methods
    get,
    post,
    put,
    patch,
    del,
    // API groups
    authAPI,
    menuAPI,
    bookingAPI,
    paymentAPI,
    userAPI
  };
};

export default useApi;
