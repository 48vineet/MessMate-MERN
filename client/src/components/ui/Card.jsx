// src/components/ui/Card.jsx
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'p-6',
  shadow = 'shadow-soft',
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { 
        y: -2, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" 
      } : {}}
      className={`
        bg-white rounded-xl ${shadow} hover:shadow-medium transition-all duration-300
        ${padding} ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`pb-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`pt-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

export default Card;
