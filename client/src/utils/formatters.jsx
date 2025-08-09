// src/utils/formatters.jsx

/**
 * Format currency values
 */
export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
    if (typeof amount !== 'number') {
      return '₹0';
    }
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  /**
   * Format numbers with Indian number system
   */
  export const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    
    if (num >= 10000000) {
      return (num / 10000000).toFixed(1) + ' Cr';
    } else if (num >= 100000) {
      return (num / 100000).toFixed(1) + ' L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    
    return num.toString();
  };
  
  /**
   * Format date and time
   */
  export const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return new Date(date).toLocaleDateString('en-IN', defaultOptions);
  };
  
  export const formatTime = (date, options = {}) => {
    if (!date) return '';
    
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options
    };
    
    return new Date(date).toLocaleTimeString('en-IN', defaultOptions);
  };
  
  export const formatDateTime = (date) => {
    if (!date) return '';
    
    return `${formatDate(date)} at ${formatTime(date)}`;
  };
  
  /**
   * Format relative time (time ago)
   */
  export const formatTimeAgo = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };
  
  /**
   * Format phone number
   */
  export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91 ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
    }
    
    return phone;
  };
  
  /**
   * Format file size
   */
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  /**
   * Format percentage
   */
  export const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(1)}%`;
  };
  
  const formatters = {
    formatCurrency,
    formatNumber,
    formatDate,
    formatTime,
    formatDateTime,
    formatTimeAgo,
    formatPhoneNumber,
    formatFileSize,
    formatPercentage
  };
  
  export default formatters;
  