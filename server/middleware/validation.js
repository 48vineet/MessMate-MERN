// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Authentication Validations
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage('Role must be either student or admin'),
  
  body('studentId')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters')
    .isAlphanumeric()
    .withMessage('Student ID can only contain letters and numbers'),
  
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian mobile number'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

const validateResetPassword = [
  param('resettoken')
    .isLength({ min: 1 })
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

const validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

// Menu Validations
const validateMenuCreate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu name must be between 2 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('mealType')
    .isIn(['breakfast', 'lunch', 'dinner', 'snacks'])
    .withMessage('Meal type must be breakfast, lunch, dinner, or snacks'),
  
  body('category')
    .isIn(['starter', 'main-course', 'dessert', 'beverage', 'combo'])
    .withMessage('Category must be starter, main-course, dessert, beverage, or combo'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('maxQuantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum quantity must be a positive integer'),
  
  body('currentQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current quantity must be a non-negative integer'),
  
  body('preparationTime')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Preparation time must be between 1 and 120 minutes'),
  
  body('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array'),
  
  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),
  
  handleValidationErrors
];

const validateMenuUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid menu item ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  handleValidationErrors
];

// Booking Validations
const validateBookingCreate = [
  body('menuItem')
    .isMongoId()
    .withMessage('Invalid menu item ID'),
  
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  
  body('bookingDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid booking date')
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingDate = new Date(value);
      bookingDate.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        throw new Error('Booking date cannot be in the past');
      }
      
      // Max 7 days in advance
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 7);
      if (bookingDate > maxDate) {
        throw new Error('Booking date cannot be more than 7 days in advance');
      }
      
      return true;
    }),
  
  body('mealTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s?(AM|PM)$/i)
    .withMessage('Please provide a valid meal time (e.g., 12:30 PM)'),
  
  body('specialRequests')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Special requests cannot exceed 200 characters'),
  
  handleValidationErrors
];

const validateBookingUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),
  
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'prepared', 'served', 'cancelled', 'no-show'])
    .withMessage('Invalid booking status'),
  
  handleValidationErrors
];

// Inventory Validations
const validateInventoryCreate = [
  body('itemName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  
  body('itemCode')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Item code must be between 2 and 20 characters')
    .isAlphanumeric()
    .withMessage('Item code can only contain letters and numbers'),
  
  body('category')
    .isIn(['grains', 'pulses', 'vegetables', 'fruits', 'dairy', 'meat', 'spices', 'oils', 'beverages', 'others'])
    .withMessage('Invalid category'),
  
  body('currentStock')
    .isFloat({ min: 0 })
    .withMessage('Current stock must be a non-negative number'),
  
  body('minimumStock')
    .isFloat({ min: 0 })
    .withMessage('Minimum stock must be a non-negative number'),
  
  body('maximumStock')
    .isFloat({ min: 0 })
    .withMessage('Maximum stock must be a non-negative number')
    .custom((value, { req }) => {
      if (value < req.body.minimumStock) {
        throw new Error('Maximum stock must be greater than minimum stock');
      }
      return true;
    }),
  
  body('reorderLevel')
    .isFloat({ min: 0 })
    .withMessage('Reorder level must be a non-negative number'),
  
  body('unit')
    .isIn(['kg', 'grams', 'liters', 'ml', 'pieces', 'packets', 'boxes', 'bags'])
    .withMessage('Invalid unit'),
  
  body('unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number'),
  
  body('supplier.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Supplier name must be between 2 and 100 characters'),
  
  body('supplier.phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian mobile number'),
  
  body('supplier.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Payment Validations
const validatePaymentCreate = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least ₹1'),
  
  body('orderId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Order ID cannot be empty'),
  
  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Customer name must be between 2 and 50 characters'),
  
  body('customerEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

const validatePaymentVerify = [
  body('transactionRef')
    .isLength({ min: 1 })
    .withMessage('Transaction reference is required'),
  
  body('upiTransactionId')
    .isLength({ min: 1 })
    .withMessage('UPI transaction ID is required'),
  
  body('status')
    .isIn(['completed', 'failed'])
    .withMessage('Status must be completed or failed'),
  
  handleValidationErrors
];

// Feedback Validations
const validateFeedbackCreate = [
  body('feedbackType')
    .isIn(['meal-review', 'service-feedback', 'app-feedback', 'complaint', 'suggestion'])
    .withMessage('Invalid feedback type'),
  
  body('rating.overall')
    .isInt({ min: 1, max: 5 })
    .withMessage('Overall rating must be between 1 and 5'),
  
  body('rating.taste')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Taste rating must be between 1 and 5'),
  
  body('rating.quality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Quality rating must be between 1 and 5'),
  
  body('rating.service')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('category')
    .isIn(['food-quality', 'taste', 'service', 'hygiene', 'pricing', 'app-experience', 'other'])
    .withMessage('Invalid category'),
  
  body('booking')
    .optional()
    .isMongoId()
    .withMessage('Invalid booking ID'),
  
  body('menuItem')
    .optional()
    .isMongoId()
    .withMessage('Invalid menu item ID'),
  
  handleValidationErrors
];

// User Validations
const validateUserUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian mobile number'),
  
  body('role')
    .optional()
    .isIn(['student', 'admin'])
    .withMessage('Role must be either student or admin'),
  
  handleValidationErrors
];

const validateWalletAdd = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('amount')
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Amount must be between ₹1 and ₹10,000'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Description cannot exceed 100 characters'),
  
  body('transactionId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Transaction ID cannot be empty'),
  
  handleValidationErrors
];

// Query Validations
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
    .escape(),
  
  handleValidationErrors
];

// MongoDB ID Validation
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

module.exports = {
  // Auth validations
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePassword,
  
  // Menu validations
  validateMenuCreate,
  validateMenuUpdate,
  
  // Booking validations
  validateBookingCreate,
  validateBookingUpdate,
  
  // Inventory validations
  validateInventoryCreate,
  
  // Payment validations
  validatePaymentCreate,
  validatePaymentVerify,
  
  // Feedback validations
  validateFeedbackCreate,
  
  // User validations
  validateUserUpdate,
  validateWalletAdd,
  
  // Common validations
  validatePagination,
  validateSearch,
  validateMongoId,
  
  // Validation error handler
  handleValidationErrors
};
