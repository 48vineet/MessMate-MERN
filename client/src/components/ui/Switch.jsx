// src/components/ui/Switch.jsx
import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Switch = forwardRef(({
  className,
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  ...props
}, ref) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  const sizeClasses = {
    sm: {
      track: 'h-5 w-9',
      thumb: 'h-4 w-4',
      translate: 'translate-x-4'
    },
    md: {
      track: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: 'translate-x-5'
    },
    lg: {
      track: 'h-7 w-12',
      thumb: 'h-6 w-6',
      translate: 'translate-x-5'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center space-x-3">
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          currentSize.track,
          isChecked ? "bg-blue-600" : "bg-gray-200",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        <motion.span
          layout
          className={cn(
            "pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200",
            currentSize.thumb,
            isChecked ? currentSize.translate : "translate-x-0"
          )}
          animate={{
            x: isChecked ? (size === 'sm' ? 16 : size === 'lg' ? 20 : 20) : 0
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className={cn(
              "text-sm font-medium",
              disabled ? "text-gray-400" : "text-gray-900"
            )}>
              {label}
            </span>
          )}
          {description && (
            <span className={cn(
              "text-xs",
              disabled ? "text-gray-300" : "text-gray-500"
            )}>
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Switch.displayName = "Switch";

export default Switch;
