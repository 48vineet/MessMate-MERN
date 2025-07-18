// src/components/ui/Switch.jsx
import { motion } from 'framer-motion';

const Switch = ({ 
  checked = false, 
  onChange, 
  size = 'md',
  color = 'primary',
  disabled = false,
  className = '' 
}) => {
  const sizes = {
    sm: { switch: 'w-8 h-4', thumb: 'w-3 h-3' },
    md: { switch: 'w-11 h-6', thumb: 'w-5 h-5' },
    lg: { switch: 'w-14 h-8', thumb: 'w-6 h-6' }
  };

  const colors = {
    primary: checked ? 'bg-primary-600' : 'bg-gray-200',
    secondary: checked ? 'bg-secondary-600' : 'bg-gray-200',
    success: checked ? 'bg-green-600' : 'bg-gray-200'
  };

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${sizes[size].switch} ${colors[color]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      disabled={disabled}
    >
      <motion.span
        animate={{
          x: checked ? 
            (size === 'sm' ? 16 : size === 'md' ? 20 : 24) : 
            2
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`
          inline-block bg-white rounded-full shadow-lg
          ${sizes[size].thumb}
          absolute top-1/2 transform -translate-y-1/2
        `}
      />
    </motion.button>
  );
};

export default Switch;
