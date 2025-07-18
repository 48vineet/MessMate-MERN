// client/src/utils/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  updateProfile: (data) => api.put('/auth/update-details', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
  verifyToken: () => api.get('/auth/verify')
};

// User API calls
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  addMoney: (id, data) => api.post(`/users/${id}/wallet/add`, data),
  getUserStats: (id) => api.get(`/users/${id}/stats`)
};

// Menu API calls
export const menuAPI = {
  getMenuItems: (params) => api.get('/menu', { params }),
  getMenuItem: (id) => api.get(`/menu/${id}`),
  getTodayMenu: () => api.get('/menu/today'),
  createMenuItem: (data) => api.post('/menu', data),
  updateMenuItem: (id, data) => api.put(`/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/menu/${id}`),
  updateAvailability: (id, data) => api.patch(`/menu/${id}/availability`, data)
};

// Booking API calls
export const bookingAPI = {
  getBookings: (params) => api.get('/bookings', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (data) => api.post('/bookings', data),
  updateBookingStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  cancelBooking: (id, data) => api.delete(`/bookings/${id}`, { data }),
  addFeedback: (id, data) => api.post(`/bookings/${id}/feedback`, data)
};

// Payment API calls
export const paymentAPI = {
  generateUPI: (data) => api.post('/payments/generate-upi', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getPayments: (params) => api.get('/payments', { params }),
  getUPIDetails: () => api.get('/payments/upi-details'),
  approvePayment: (id, data) => api.patch(`/payments/${id}/approve`, data),
  rejectPayment: (id, data) => api.patch(`/payments/${id}/reject`, data)
};

// Inventory API calls
export const inventoryAPI = {
  getInventoryItems: (params) => api.get('/inventory', { params }),
  getInventoryItem: (id) => api.get(`/inventory/${id}`),
  createInventoryItem: (data) => api.post('/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/inventory/${id}`, data),
  deleteInventoryItem: (id) => api.delete(`/inventory/${id}`),
  addStock: (id, data) => api.post(`/inventory/${id}/add-stock`, data),
  consumeStock: (id, data) => api.post(`/inventory/${id}/consume-stock`, data),
  getLowStockAlerts: () => api.get('/inventory/alerts')
};

// Feedback API calls
export const feedbackAPI = {
  getAllFeedback: (params) => api.get('/feedback', { params }),
  getFeedback: (id) => api.get(`/feedback/${id}`),
  createFeedback: (data) => api.post('/feedback', data),
  respondToFeedback: (id, data) => api.post(`/feedback/${id}/respond`, data),
  resolveFeedback: (id, data) => api.patch(`/feedback/${id}/resolve`, data),
  addHelpfulVote: (id, data) => api.post(`/feedback/${id}/vote`, data),
  getFeedbackStats: () => api.get('/feedback/admin/stats')
};

// Analytics API calls
export const analyticsAPI = {
  getDashboardOverview: () => api.get('/analytics/overview'),
  getSalesAnalytics: (params) => api.get('/analytics/sales', { params }),
  getUserAnalytics: (params) => api.get('/analytics/users', { params }),
  getAttendanceAnalytics: (params) => api.get('/analytics/attendance', { params })
};

// File upload utility
export const uploadFile = async (file, folder = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
