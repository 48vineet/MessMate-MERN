// src/utils/constants.jsx

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    UPLOAD_AVATAR: "/auth/upload-avatar",
  },
  MENU: {
    GET_ALL: "/menu",
    GET_BY_DATE: "/menu/date",
    GET_BY_ID: "/menu/:id",
    SEARCH: "/menu/search",
    POPULAR: "/menu/popular",
    WEEKLY: "/menu/week",
  },
  BOOKING: {
    CREATE: "/bookings/create",
    GET_ALL: "/bookings",
    GET_BY_ID: "/bookings/:id",
    UPDATE: "/bookings/:id",
    CANCEL: "/bookings/:id/cancel",
    DELETE: "/bookings/:id",
    UPCOMING: "/bookings/upcoming",
    PAST: "/bookings/past",
    STATS: "/bookings/stats",
  },
  PAYMENT: {
    WALLET: "/wallet",
    RECHARGE: "/wallet/recharge",
    HISTORY: "/payments/history",
    STATUS: "/payments/status/:id",
    GENERATE_QR: "/payments/generate-qr",
    REFUND: "/payments/refund-request",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    MENU: "/admin/menu",
    BOOKINGS: "/admin/bookings",
    ANALYTICS: "/admin/analytics",
    REPORTS: "/admin/reports",
    INVENTORY: "/admin/inventory",
    SETTINGS: "/admin/settings",
  },
};

/**
 * User roles
 */
export const ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
};

/**
 * Meal types
 */
export const MEAL_TYPES = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
};

/**
 * Meal type configurations
 */
export const MEAL_CONFIG = {
  [MEAL_TYPES.BREAKFAST]: {
    name: "Breakfast",
    iconName: "coffee",
    timeSlot: "07:00-10:00",
    defaultTime: "08:00",
  },
  [MEAL_TYPES.LUNCH]: {
    name: "Lunch",
    iconName: "dining",
    timeSlot: "12:00-15:00",
    defaultTime: "13:00",
  },
  [MEAL_TYPES.DINNER]: {
    name: "Dinner",
    iconName: "dining",
    timeSlot: "19:00-22:00",
    defaultTime: "20:00",
  },
};

/**
 * Booking statuses
 */
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no-show",
};

/**
 * Payment statuses
 */
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

/**
 * Payment methods
 */
export const PAYMENT_METHODS = {
  WALLET: "wallet",
  UPI: "upi",
  CARD: "card",
  CASH: "cash",
};

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  BOOKING: "booking",
  PAYMENT: "payment",
  MENU: "menu",
  SYSTEM: "system",
  REMINDER: "reminder",
};

/**
 * File upload constraints
 */
export const FILE_CONSTRAINTS = {
  AVATAR: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
    dimensions: { width: 400, height: 400 },
  },
  MENU_IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/jpg", "image/png"],
    dimensions: { width: 800, height: 600 },
  },
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
  },
};

/**
 * App configurations
 */
export const APP_CONFIG = {
  NAME: "MessMate",
  VERSION: "1.0.0",
  THEME_COLORS: {
    PRIMARY: "#3B82F6",
    SECONDARY: "#8B5CF6",
    SUCCESS: "#10B981",
    WARNING: "#F59E0B",
    ERROR: "#EF4444",
    INFO: "#06B6D4",
  },
  CURRENCY: {
    SYMBOL: "₹",
    CODE: "INR",
    LOCALE: "en-IN",
  },
  DATE_FORMAT: "DD/MM/YYYY",
  TIME_FORMAT: "HH:mm",
  DATETIME_FORMAT: "DD/MM/YYYY HH:mm",
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  TOKEN: "messmate_token",
  USER: "messmate_user",
  THEME: "messmate_theme",
  LANGUAGE: "messmate_language",
  RECENT_SEARCHES: "messmate_recent_searches",
  CART: "messmate_cart",
  PREFERENCES: "messmate_preferences",
};

/**
 * Routes
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  MENU: "/menu",
  BOOKINGS: "/bookings",
  WALLET: "/wallet",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    MENU: "/admin/menu",
    BOOKINGS: "/admin/bookings",
    ANALYTICS: "/admin/analytics",
    REPORTS: "/admin/reports",
    INVENTORY: "/admin/inventory",
    SETTINGS: "/admin/settings",
  },
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  UNAUTHORIZED: "Session expired. Please login again.",
  FORBIDDEN: "Access denied. You do not have permission.",
  NOT_FOUND: "Requested resource not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  GENERIC_ERROR: "An unexpected error occurred.",
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN: "Login successful!",
  LOGOUT: "Logged out successfully",
  REGISTER: "Registration successful!",
  PROFILE_UPDATE: "Profile updated successfully",
  PASSWORD_CHANGE: "Password changed successfully",
  BOOKING_CREATE: "Booking created successfully",
  BOOKING_CANCEL: "Booking cancelled successfully",
  PAYMENT_SUCCESS: "Payment successful!",
  WALLET_RECHARGE: "Wallet recharged successfully",
};

/**
 * Validation rules
 */
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PASSWORD: {
    minLength: 6,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
  },
  NAME: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
  },
  AMOUNT: {
    min: 1,
    max: 10000,
  },
};

/**
 * Time configurations
 */
export const TIME_CONFIG = {
  MEAL_BOOKING_DEADLINE: 2, // hours before meal
  CANCELLATION_DEADLINE: 1, // hours before meal
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in ms
  TOKEN_REFRESH_INTERVAL: 15 * 60 * 1000, // 15 minutes in ms
  NOTIFICATION_CHECK_INTERVAL: 30 * 1000, // 30 seconds in ms
};

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
};

const constants = {
  API_ENDPOINTS,
  ROLES,
  MEAL_TYPES,
  MEAL_CONFIG,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  NOTIFICATION_TYPES,
  FILE_CONSTRAINTS,
  APP_CONFIG,
  STORAGE_KEYS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  TIME_CONFIG,
  PAGINATION,
};

export default constants;
