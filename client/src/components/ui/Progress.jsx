// src/components/ui/Progress.jsx
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Progress = forwardRef(({
  className,
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  animated = true,
  showLabel = false,
  label,
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
    purple: 'bg-purple-600'
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div
        ref={ref}
        className={cn(
          "overflow-hidden rounded-full bg-gray-200",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <motion.div
          className={cn(
            "h-full transition-all duration-300 ease-in-out",
            variantClasses[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { 
            duration: 0.8, 
            ease: "easeOut" 
          } : { duration: 0 }}
        />
      </div>
    </div>
  );
});

Progress.displayName = "Progress";

export default Progress;
