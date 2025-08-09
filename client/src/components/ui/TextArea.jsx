    // src/components/ui/TextArea.jsx
import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const TextArea = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  resize = 'vertical',
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [currentLength, setCurrentLength] = useState(value?.length || 0);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setCurrentLength(newValue.length);
    
    if (maxLength && newValue.length > maxLength) {
      return; // Prevent input beyond maxLength
    }
    
    onChange && onChange(e);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-4 py-4 text-lg';
      default:
        return 'px-4 py-3 text-base';
    }
  };

  const getVariantClasses = () => {
    if (disabled) {
      return 'bg-gray-100 text-gray-500 cursor-not-allowed';
    }

    if (error) {
      return 'border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:ring-red-500 focus:border-red-500';
    }

    switch (variant) {
      case 'filled':
        return 'bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-blue-500';
      case 'outlined':
        return 'bg-transparent border-gray-300 focus:border-blue-500 focus:ring-blue-500';
      default:
        return 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    }
  };

  const getResizeClasses = () => {
    switch (resize) {
      case 'none':
        return 'resize-none';
      case 'horizontal':
        return 'resize-x';
      case 'both':
        return 'resize';
      default:
        return 'resize-y';
    }
  };

  const baseClasses = `
    w-full rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    placeholder-gray-400
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${getResizeClasses()}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`block text-sm font-medium mb-2 ${
            error ? 'text-red-700' : 'text-gray-700'
          }`}
          htmlFor={props.id}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>
      )}

      {/* TextArea Container */}
      <div className="relative">
        <motion.textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={baseClasses}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          {...props}
        />

        {/* Focus Ring Animation */}
        {isFocused && !error && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 rounded-lg border-2 border-blue-500 pointer-events-none"
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Error Icon */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-3 right-3 pointer-events-none"
          >
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </motion.div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between mt-2">
        {/* Helper Text / Error Message */}
        <div className="flex-1">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 flex items-center"
            >
              <ExclamationCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              {error}
            </motion.p>
          )}
          {!error && helperText && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500"
            >
              {helperText}
            </motion.p>
          )}
        </div>

        {/* Character Count */}
        {maxLength && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm ml-4 ${
              currentLength > maxLength * 0.9 
                ? currentLength >= maxLength 
                  ? 'text-red-600' 
                  : 'text-yellow-600'
                : 'text-gray-500'
            }`}
          >
            {currentLength}/{maxLength}
          </motion.div>
        )}
      </div>

      {/* Character Count Progress Bar */}
      {maxLength && (
        <div className="mt-1">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentLength / maxLength) * 100}%` }}
              className={`h-1 rounded-full transition-colors ${
                currentLength > maxLength * 0.9 
                  ? currentLength >= maxLength 
                    ? 'bg-red-500' 
                    : 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
