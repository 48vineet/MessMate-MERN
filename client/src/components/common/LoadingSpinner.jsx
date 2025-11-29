// src/components/common/LoadingSpinner.jsx
import { motion } from "framer-motion";
import Logo from "./Logo";

const LoadingSpinner = ({
  size = "md",
  color = "blue",
  text = "",
  overlay = false,
  fullScreen = false,
}) => {
  const sizeClasses = {
    xs: "h-4 w-4",
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const colorClasses = {
    blue: "border-blue-600",
    green: "border-green-600",
    red: "border-red-600",
    purple: "border-purple-600",
    orange: "border-orange-600",
    gray: "border-gray-600",
    white: "border-white",
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const spinnerElement = (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          border-4 border-t-transparent rounded-full
        `}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`
            mt-3 text-gray-600 font-medium text-center
            ${textSizeClasses[size]}
          `}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-white flex items-center justify-center z-50"
      >
        <div className="text-center">
          <div className="mb-6">
            <Logo size="xl" showText={false} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">MessMate</h2>
          </div>
          {spinnerElement}
        </div>
      </motion.div>
    );
  }

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-40"
      >
        {spinnerElement}
      </motion.div>
    );
  }

  return spinnerElement;
};

// Specialized loading components
export const PageLoader = ({ text = "Loading..." }) => (
  <LoadingSpinner size="lg" text={text} fullScreen />
);

export const ButtonLoader = ({ size = "sm", color = "white" }) => (
  <LoadingSpinner size={size} color={color} />
);

export const CardLoader = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner size="md" text={text} />
  </div>
);

export const OverlayLoader = ({ text = "Please wait..." }) => (
  <LoadingSpinner size="lg" text={text} overlay />
);

// Skeleton loader for lists
export const SkeletonLoader = ({ lines = 3, className = "" }) => (
  <div className={`animate-pulse space-y-3 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-300 rounded ${
          i === lines - 1 ? "w-3/4" : "w-full"
        }`}
      />
    ))}
  </div>
);

// Card skeleton loader
export const CardSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-300 rounded"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6"></div>
        <div className="h-3 bg-gray-300 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

// Table skeleton loader
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="animate-pulse">
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {[...Array(cols)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {[...Array(cols)].map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`h-4 bg-gray-300 rounded ${
                    colIndex === 0 ? "w-3/4" : "w-full"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LoadingSpinner;
