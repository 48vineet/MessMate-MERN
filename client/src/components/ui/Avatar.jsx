// src/components/ui/Avatar.jsx
import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
        "2xl": "h-20 w-20"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);

const Avatar = forwardRef(({
  className,
  size,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(avatarVariants({ size }), className)}
    {...props}
  >
    {children}
  </div>
));

const AvatarImage = forwardRef(({
  className,
  src,
  alt,
  onError,
  animate = false,
  ...props
}, ref) => {
  const [hasError, setHasError] = useState(false);
  
  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  if (hasError || !src) {
    return null;
  }

  const Component = animate ? motion.img : 'img';
  
  const motionProps = animate ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <Component
      ref={ref}
      src={src}
      alt={alt}
      onError={handleError}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...motionProps}
      {...props}
    />
  );
});

const AvatarFallback = forwardRef(({
  className,
  children,
  delayMs = 600,
  ...props
}, ref) => {
  const [show, setShow] = useState(delayMs === 0);

  useState(() => {
    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!show) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Avatar.displayName = "Avatar";
AvatarImage.displayName = "AvatarImage";
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
export default Avatar;
