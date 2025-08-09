// src/components/ui/TabPanel.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef } from 'react';

const TabPanel = forwardRef(({ 
  children, 
  isActive, 
  className = '',
  direction = 'horizontal',
  animationType = 'fade',
  ...props 
}, ref) => {

  const getAnimationVariants = () => {
    switch (animationType) {
      case 'slide':
        return {
          initial: { 
            opacity: 0, 
            x: direction === 'horizontal' ? 30 : 0,
            y: direction === 'vertical' ? 30 : 0
          },
          animate: { 
            opacity: 1, 
            x: 0,
            y: 0
          },
          exit: { 
            opacity: 0, 
            x: direction === 'horizontal' ? -30 : 0,
            y: direction === 'vertical' ? -30 : 0
          }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 }
        };
      case 'none':
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 }
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          ref={ref}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ 
            duration: 0.3, 
            ease: "easeInOut" 
          }}
          className={`w-full ${className}`}
          role="tabpanel"
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

TabPanel.displayName = 'TabPanel';

export default TabPanel;
