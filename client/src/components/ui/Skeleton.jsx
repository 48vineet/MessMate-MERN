// src/components/ui/Skeleton.jsx
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Skeleton = forwardRef(({
  className,
  animate = true,
  ...props
}, ref) => {
  const Component = animate ? motion.div : 'div';
  
  const motionProps = animate ? {
    animate: {
      opacity: [0.5, 1, 0.5]
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  return (
    <Component
      ref={ref}
      className={cn("bg-gray-200 rounded-md", className)}
      {...motionProps}
      {...props}
    />
  );
});

// Predefined skeleton components
export const SkeletonText = ({ lines = 3, className, ...props }) => (
  <div className={cn("space-y-2", className)} {...props}>
    {[...Array(lines)].map((_, i) => (
      <Skeleton
        key={i}
        className={cn(
          "h-4",
          i === lines - 1 ? "w-3/4" : "w-full"
        )}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className, ...props }) => (
  <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)} {...props}>
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4, className, ...props }) => (
  <div className={cn("bg-white rounded-lg border border-gray-200 overflow-hidden", className)} {...props}>
    {/* Header */}
    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {[...Array(cols)].map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {[...Array(cols)].map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn(
                  "h-4",
                  colIndex === 0 ? "w-3/4" : "w-full"
                )}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

Skeleton.displayName = "Skeleton";

export default Skeleton;
