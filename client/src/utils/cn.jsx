// src/utils/cn.jsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for conflict resolution
 */
const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

/**
 * Helper function for creating variants with cn
 */
export const createVariant = (baseClasses, variants) => {
  return (variant, className) => {
    return cn(baseClasses, variants[variant], className);
  };
};

// Export both as default and named export
export { cn };
export default cn;
