// src/components/ui/Avatar.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';

const Avatar = ({ 
  src, 
  alt = '', 
  size = 'md', 
  name = '',
  className = '',
  online = false,
  onClick,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name) => {
    const colors = [
      'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500',
      'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      className={`relative inline-block ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      {...props}
    >
      <div className={`${sizes[size]} rounded-full overflow-hidden ${className}`}>
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`
            w-full h-full flex items-center justify-center text-white font-medium
            ${getRandomColor(name || 'Unknown')}
          `}>
            {getInitials(name || 'U')}
          </div>
        )}
      </div>
      
      {online && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"
        />
      )}
    </motion.div>
  );
};

export default Avatar;

