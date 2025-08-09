// src/utils/validators.jsx

/**
 * Email validation
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Phone number validation (Indian)
   */
  export const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleaned = phone.replace(/\D/g, '');
    return phoneRegex.test(cleaned);
  };
  
  /**
   * Password validation
   */
  export const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Name validation
   */
  export const isValidName = (name) => {
    if (!name || name.trim().length < 2) {
      return false;
    }
    
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name.trim());
  };
  
  /**
   * Aadhaar number validation
   */
  export const isValidAadhaar = (aadhaar) => {
    const aadhaarRegex = /^\d{12}$/;
    const cleaned = aadhaar.replace(/\D/g, '');
    return aadhaarRegex.test(cleaned);
  };
  
  /**
   * PAN number validation
   */
  export const isValidPAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  };
  
  /**
   * UPI ID validation
   */
  export const isValidUPI = (upi) => {
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    return upiRegex.test(upi);
  };
  
  /**
   * Amount validation
   */
  export const isValidAmount = (amount, min = 1, max = 10000) => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount >= min && numAmount <= max;
  };
  
  /**
   * Date validation
   */
  export const isValidDate = (date) => {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
  };
  
  /**
   * Future date validation
   */
  export const isFutureDate = (date) => {
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dateObj >= today;
  };
  
  /**
   * File validation
   */
  export const validateFile = (file, options = {}) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
      required = true
    } = options;
    
    const errors = [];
    
    if (required && !file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }
    
    if (!file) {
      return { isValid: true, errors: [] };
    }
    
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Form validation utility
   */
  export const validateForm = (data, rules) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const value = data[field];
      const fieldRules = rules[field];
      
      // Required validation
      if (fieldRules.required && (!value || value.toString().trim() === '')) {
        errors[field] = `${fieldRules.label || field} is required`;
        return;
      }
      
      // Skip other validations if field is empty and not required
      if (!value) return;
      
      // Email validation
      if (fieldRules.type === 'email' && !isValidEmail(value)) {
        errors[field] = 'Please enter a valid email address';
        return;
      }
      
      // Phone validation
      if (fieldRules.type === 'phone' && !isValidPhone(value)) {
        errors[field] = 'Please enter a valid phone number';
        return;
      }
      
      // Min length validation
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
        return;
      }
      
      // Max length validation
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `${fieldRules.label || field} must not exceed ${fieldRules.maxLength} characters`;
        return;
      }
      
      // Custom validation
      if (fieldRules.custom) {
        const customResult = fieldRules.custom(value);
        if (customResult !== true) {
          errors[field] = customResult;
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  const validators = {
    isValidEmail,
    isValidPhone,
    validatePassword,
    isValidName,
    isValidAadhaar,
    isValidPAN,
    isValidUPI,
    isValidAmount,
    isValidDate,
    isFutureDate,
    validateFile,
    validateForm
  };
  
  export default validators;
  