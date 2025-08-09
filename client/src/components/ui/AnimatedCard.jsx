// src/components/ui/AnimatedCard.jsx
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const AnimatedCard = forwardRef(({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  delay = 0,
  direction = 'up',
  ...props 
}, ref) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white rounded-xl shadow-lg border border-gray-100';
      case 'outlined':
        return 'bg-white rounded-lg border-2 border-gray-200';
      case 'filled':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100';
      case 'glass':
        return 'bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl';
      default:
        return 'bg-white rounded-lg shadow-sm border border-gray-200';
    }
  };

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 30 };
      case 'down':
        return { opacity: 0, y: -30 };
      case 'left':
        return { opacity: 0, x: 30 };
      case 'right':
        return { opacity: 0, x: -30 };
      case 'scale':
        return { opacity: 0, scale: 0.9 };
      default:
        return { opacity: 0, y: 30 };
    }
  };

  const getAnimatePosition = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { opacity: 1, y: 0 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 };
      case 'scale':
        return { opacity: 1, scale: 1 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  const hoverAnimation = hover ? {
    whileHover: { 
      scale: 1.02,
      y: -2,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  } : {};

  return (
    <motion.div
      ref={ref}
      initial={getInitialPosition()}
      animate={getAnimatePosition()}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: "easeOut"
      }}
      {...hoverAnimation}
      className={`${getVariantClasses()} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
});

AnimatedCard.displayName = 'AnimatedCard';

export default AnimatedCard;
