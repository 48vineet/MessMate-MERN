// src/components/ui/AnimatedCard.jsx
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const AnimatedCard = forwardRef(({ 
  children, 
  delay = 0, 
  className = "", 
  hover = true,
  onClick,
  direction = "up",
  duration = 0.6,
  ...props 
}, ref) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: -20 },
    right: { x: 20 }
  };

  const hoverEffects = {
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.3 }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      whileHover={hover ? hoverEffects : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
});

AnimatedCard.displayName = 'AnimatedCard';

export default AnimatedCard;
