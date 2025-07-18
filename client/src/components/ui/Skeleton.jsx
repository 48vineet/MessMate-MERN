// src/components/ui/Skeleton.jsx
import { motion } from 'framer-motion';

const Skeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  animate = true,
  variant = 'default' 
}) => {
  const variants = {
    default: 'bg-gray-200',
    light: 'bg-gray-100',
    dark: 'bg-gray-300'
  };

  const baseClasses = `${variants[variant]} rounded ${width} ${height} ${className}`;

  if (animate) {
    return (
      <motion.div
        animate={{
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={baseClasses}
      />
    );
  }

  return <div className={baseClasses} />;
};

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index} 
        width={index === lines - 1 ? 'w-3/4' : 'w-full'}
        height="h-4"
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-soft ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton width="w-12" height="h-12" className="rounded-full" />
      <div className="flex-1">
        <Skeleton width="w-24" height="h-4" className="mb-2" />
        <Skeleton width="w-16" height="h-3" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export default Skeleton;
