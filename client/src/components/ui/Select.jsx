// src/components/ui/Select.jsx
import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

const Select = forwardRef(({
  className,
  label,
  placeholder = "Select an option",
  options = [],
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  multiple = false,
  searchable = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(option => option.value === value);
  const selectedLabel = selectedOption?.label || placeholder;

  const handleSelect = (optionValue) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? value : [];
      const updatedValue = newValue.includes(optionValue)
        ? newValue.filter(v => v !== optionValue)
        : [...newValue, optionValue];
      onChange?.(updatedValue);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  const isSelected = (optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          ref={ref}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "relative w-full cursor-default rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm",
            "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-300 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
          <span className={cn(
            "block truncate",
            !selectedOption && "text-gray-500"
          )}>
            {selectedLabel}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className={cn(
                "h-5 w-5 text-gray-400 transition-transform",
                isOpen && "transform rotate-180"
              )}
            />
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              {searchable && (
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              {filteredOptions.length === 0 ? (
                <div className="py-2 px-3 text-gray-500 text-sm">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "relative cursor-default select-none py-2 pl-3 pr-9 w-full text-left hover:bg-gray-100",
                      isSelected(option.value) && "bg-blue-50 text-blue-900"
                    )}
                  >
                    <span className={cn(
                      "block truncate",
                      isSelected(option.value) ? "font-medium" : "font-normal"
                    )}>
                      {option.label}
                    </span>
                    {isSelected(option.value) && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                        <CheckIcon className="h-5 w-5" />
                      </span>
                    )}
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(error || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2"
        >
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </motion.div>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
